import type { Category, Task, TaskCompletion } from "../types";
import type { DayStackSnapshot, DayStackStorage } from "./types";

const DB_NAME = "daystack";
const DB_VERSION = 1;

type StoredCompletion = TaskCompletion & { key: string };

const completionKey = (taskId: number, date: string) => `${taskId}|${date}`;

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB is not available"));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("tasks")) {
          const tasks = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
          tasks.createIndex("category_id", "category_id");
        }
        if (!db.objectStoreNames.contains("task_completions")) {
          const completions = db.createObjectStore("task_completions", { keyPath: "key" });
          completions.createIndex("task_id", "task_id");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

async function deleteTasksAndCompletions(tx: IDBTransaction, taskIds: number[]) {
  const tasks = tx.objectStore("tasks");
  const completions = tx.objectStore("task_completions");
  const allCompletions = await promisify(completions.getAll() as IDBRequest<StoredCompletion[]>);
  const idSet = new Set(taskIds);
  for (const c of allCompletions) {
    if (idSet.has(c.task_id)) completions.delete(c.key);
  }
  for (const id of taskIds) tasks.delete(id);
}

export const indexedDbStorage: DayStackStorage = {
  async init() {
    await openDb();
  },

  async loadAll(): Promise<DayStackSnapshot> {
    const db = await openDb();
    const tx = db.transaction(["categories", "tasks", "task_completions"], "readonly");
    const [categories, tasks, completions] = await Promise.all([
      promisify(tx.objectStore("categories").getAll() as IDBRequest<Category[]>),
      promisify(tx.objectStore("tasks").getAll() as IDBRequest<Task[]>),
      promisify(tx.objectStore("task_completions").getAll() as IDBRequest<StoredCompletion[]>),
    ]);
    return {
      categories,
      tasks,
      completions: completions.map(({ task_id, date, completed_at }) => ({
        task_id,
        date,
        completed_at,
      })),
    };
  },

  async insertCategory(data) {
    const db = await openDb();
    const tx = db.transaction("categories", "readwrite");
    const id = await promisify(tx.objectStore("categories").add(data));
    await done(tx);
    return Number(id);
  },

  async updateCategory(category) {
    const db = await openDb();
    const tx = db.transaction("categories", "readwrite");
    tx.objectStore("categories").put(category);
    await done(tx);
  },

  async deleteCategory(id) {
    const db = await openDb();
    const tx = db.transaction(["categories", "tasks", "task_completions"], "readwrite");
    const allTasks = await promisify(tx.objectStore("tasks").getAll() as IDBRequest<Task[]>);
    await deleteTasksAndCompletions(
      tx,
      allTasks.filter((t) => t.category_id === id).map((t) => t.id)
    );
    tx.objectStore("categories").delete(id);
    await done(tx);
  },

  async insertTask(data) {
    const db = await openDb();
    const tx = db.transaction("tasks", "readwrite");
    const id = await promisify(tx.objectStore("tasks").add(data));
    await done(tx);
    return Number(id);
  },

  async updateTask(task) {
    const db = await openDb();
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").put(task);
    await done(tx);
  },

  async deleteTask(id) {
    const db = await openDb();
    const tx = db.transaction(["tasks", "task_completions"], "readwrite");
    await deleteTasksAndCompletions(tx, [id]);
    await done(tx);
  },

  async setCompletion(taskId, date, completed) {
    const db = await openDb();
    const tx = db.transaction("task_completions", "readwrite");
    const store = tx.objectStore("task_completions");
    const key = completionKey(taskId, date);
    if (completed) {
      const record: StoredCompletion = {
        key,
        task_id: taskId,
        date,
        completed_at: new Date().toISOString(),
      };
      store.put(record);
    } else {
      store.delete(key);
    }
    await done(tx);
  },
};
