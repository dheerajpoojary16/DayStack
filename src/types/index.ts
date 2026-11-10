export interface Category {
  id: number;
  name: string;
  color: string;
  position: number;
}

export interface Task {
  id: number;
  title: string;
  category_id: number;
  position: number;
}

export interface TaskCompletion {
  task_id: number;
  /** Local calendar date, formatted YYYY-MM-DD */
  date: string;
  completed_at: string;
}

export interface DayHistoryItem {
  date: string;
  completed: number;
  total: number;
  /** 0..1 */
  progress: number;
}

export type CategoryFilter = number | "all";
export type MoveDirection = "up" | "down";
