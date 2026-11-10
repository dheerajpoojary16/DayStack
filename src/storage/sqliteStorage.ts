import * as SQLite from "expo-sqlite";
import type { Category, Task, TaskCompletion } from "../types";
import type { DayStackStorage } from "./types";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("daystack.db");
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          position INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS task_completions (
          task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          completed_at TEXT NOT NULL,
          PRIMARY KEY (task_id, date)
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export const sqliteStorage: DayStackStorage = {
  async init() {
    await getDb();
  },

  async loadAll() {
    const db = await getDb();
    const [categories, tasks, completions] = await Promise.all([
      db.getAllAsync<Category>("SELECT id, name, color, position FROM categories"),
      db.getAllAsync<Task>("SELECT id, title, category_id, position FROM tasks"),
      db.getAllAsync<TaskCompletion>("SELECT task_id, date, completed_at FROM task_completions"),
    ]);
    return { categories, tasks, completions };
  },

  async insertCategory({ name, color, position }) {
    const db = await getDb();
    const result = await db.runAsync(
      "INSERT INTO categories (name, color, position) VALUES (?, ?, ?)",
      name,
      color,
      position
    );
    return result.lastInsertRowId;
  },

  async updateCategory({ id, name, color, position }) {
    const db = await getDb();
    await db.runAsync(
      "UPDATE categories SET name = ?, color = ?, position = ? WHERE id = ?",
      name,
      color,
      position,
      id
    );
  },

  async deleteCategory(id) {
    const db = await getDb();
    await db.runAsync("DELETE FROM categories WHERE id = ?", id);
  },

  async insertTask({ title, category_id, position }) {
    const db = await getDb();
    const result = await db.runAsync(
      "INSERT INTO tasks (title, category_id, position) VALUES (?, ?, ?)",
      title,
      category_id,
      position
    );
    return result.lastInsertRowId;
  },

  async updateTask({ id, title, category_id, position }) {
    const db = await getDb();
    await db.runAsync(
      "UPDATE tasks SET title = ?, category_id = ?, position = ? WHERE id = ?",
      title,
      category_id,
      position,
      id
    );
  },

  async deleteTask(id) {
    const db = await getDb();
    await db.runAsync("DELETE FROM tasks WHERE id = ?", id);
  },

  async setCompletion(taskId, date, completed) {
    const db = await getDb();
    if (completed) {
      await db.runAsync(
        "INSERT OR REPLACE INTO task_completions (task_id, date, completed_at) VALUES (?, ?, ?)",
        taskId,
        date,
        new Date().toISOString()
      );
    } else {
      await db.runAsync(
        "DELETE FROM task_completions WHERE task_id = ? AND date = ?",
        taskId,
        date
      );
    }
  },
};
