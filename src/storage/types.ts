import type { Category, Task, TaskCompletion } from "../types";

export interface DayStackSnapshot {
  categories: Category[];
  tasks: Task[];
  completions: TaskCompletion[];
}

export interface DayStackStorage {
  init(): Promise<void>;
  loadAll(): Promise<DayStackSnapshot>;
  insertCategory(data: Omit<Category, "id">): Promise<number>;
  updateCategory(category: Category): Promise<void>;
  deleteCategory(id: number): Promise<void>;
  insertTask(data: Omit<Task, "id">): Promise<number>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: number): Promise<void>;
  setCompletion(taskId: number, date: string, completed: boolean): Promise<void>;
}
