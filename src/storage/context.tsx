import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import type {
  Category,
  CategoryFilter,
  DayHistoryItem,
  MoveDirection,
  Task,
  TaskCompletion,
} from "../types";
import { getLastNDays, msUntilNextMidnight, toDateKey } from "../utils/date";
import { successFeedback, tapFeedback } from "../utils/haptics";
import { storage } from "./storage";

export interface DayStackContextValue {
  isReady: boolean;
  categories: Category[];
  tasks: Task[];
  visibleCategories: Category[];
  completedTaskIds: Set<number>;
  completedCount: number;
  /** 0..1 completion ratio for the active date and selected category */
  progress: number;
  historyDays: DayHistoryItem[];
  selectedCategory: CategoryFilter;
  setSelectedCategory: (filter: CategoryFilter) => void;
  todayDate: string;
  activeDate: string;
  isViewingToday: boolean;
  selectDate: (date: string) => void;
  goToToday: () => void;
  toggleTask: (taskId: number) => Promise<void>;
  addTask: (title: string, categoryId: number) => Promise<void>;
  editTask: (taskId: number, title: string, categoryId: number) => Promise<void>;
  removeTask: (taskId: number) => Promise<void>;
  moveTaskItem: (taskId: number, direction: MoveDirection) => Promise<void>;
  addCategoryItem: (name: string, color: string) => Promise<void>;
  editCategoryItem: (id: number, name: string, color: string) => Promise<void>;
  removeCategoryItem: (id: number) => Promise<void>;
  moveCategoryItem: (id: number, direction: MoveDirection) => Promise<void>;
}

export const DayStackContext = createContext<DayStackContextValue | null>(null);

const HISTORY_LENGTH = 7;

const byPosition = <T extends { position: number; id: number }>(a: T, b: T) =>
  a.position - b.position || a.id - b.id;

export function DayStackProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [todayDate, setTodayDate] = useState(() => toDateKey());
  const [activeDate, setActiveDate] = useState(() => toDateKey());
  const todayRef = useRef(todayDate);

  const reload = useCallback(async () => {
    const snapshot = await storage.loadAll();
    setCategories([...snapshot.categories].sort(byPosition));
    setTasks([...snapshot.tasks].sort(byPosition));
    setCompletions(snapshot.completions);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await storage.init();
        if (!cancelled) await reload();
      } catch (err) {
        console.warn("DayStack: failed to load storage", err);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Midnight reset: re-evaluate the calendar day on a timer, on app foreground and on window focus.
  const refreshToday = useCallback(() => {
    const now = toDateKey();
    if (now !== todayRef.current) {
      const previous = todayRef.current;
      todayRef.current = now;
      setTodayDate(now);
      setActiveDate((current) => (current === previous ? now : current));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(refreshToday, msUntilNextMidnight());
    return () => clearTimeout(timer);
  }, [todayDate, refreshToday]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshToday();
    });
    let removeWebListeners: (() => void) | undefined;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onVisible = () => {
        if (typeof document === "undefined" || document.visibilityState === "visible") {
          refreshToday();
        }
      };
      window.addEventListener("focus", onVisible);
      document.addEventListener("visibilitychange", onVisible);
      removeWebListeners = () => {
        window.removeEventListener("focus", onVisible);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }
    return () => {
      sub.remove();
      removeWebListeners?.();
    };
  }, [refreshToday]);

  const taskIdSet = useMemo(() => new Set(tasks.map((t) => t.id)), [tasks]);

  const completedTaskIds = useMemo(
    () =>
      new Set(
        completions
          .filter((c) => c.date === activeDate && taskIdSet.has(c.task_id))
          .map((c) => c.task_id)
      ),
    [completions, activeDate, taskIdSet]
  );

  const visibleCategories = useMemo(
    () =>
      selectedCategory === "all"
        ? categories
        : categories.filter((c) => c.id === selectedCategory),
    [categories, selectedCategory]
  );

  const visibleTasks = useMemo(
    () =>
      selectedCategory === "all"
        ? tasks
        : tasks.filter((t) => t.category_id === selectedCategory),
    [tasks, selectedCategory]
  );

  const completedCount = visibleTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const progress = visibleTasks.length === 0 ? 0 : completedCount / visibleTasks.length;

  const historyDays = useMemo<DayHistoryItem[]>(() => {
    const total = tasks.length;
    return getLastNDays(HISTORY_LENGTH, todayDate).map((date) => {
      const completed = completions.filter(
        (c) => c.date === date && taskIdSet.has(c.task_id)
      ).length;
      return { date, completed, total, progress: total === 0 ? 0 : completed / total };
    });
  }, [completions, tasks.length, taskIdSet, todayDate]);

  // If the selected category disappears, fall back to "all".
  useEffect(() => {
    if (selectedCategory !== "all" && !categories.some((c) => c.id === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const selectDate = useCallback(
    (date: string) => {
      if (date > todayRef.current) return;
      setActiveDate(date);
    },
    []
  );

  const goToToday = useCallback(() => {
    refreshToday();
    setActiveDate(todayRef.current);
  }, [refreshToday]);

  const toggleTask = useCallback(
    async (taskId: number) => {
      const willComplete = !completedTaskIds.has(taskId);
      if (willComplete) successFeedback();
      else tapFeedback();
      // Optimistic update
      setCompletions((prev) =>
        willComplete
          ? [...prev, { task_id: taskId, date: activeDate, completed_at: new Date().toISOString() }]
          : prev.filter((c) => !(c.task_id === taskId && c.date === activeDate))
      );
      try {
        await storage.setCompletion(taskId, activeDate, willComplete);
      } catch (err) {
        console.warn("DayStack: failed to save completion", err);
        await reload();
      }
    },
    [completedTaskIds, activeDate, reload]
  );

  const addTask = useCallback(
    async (title: string, categoryId: number) => {
      const siblings = tasks.filter((t) => t.category_id === categoryId);
      const position = siblings.reduce((max, t) => Math.max(max, t.position), -1) + 1;
      await storage.insertTask({ title: title.trim(), category_id: categoryId, position });
      await reload();
    },
    [tasks, reload]
  );

  const editTask = useCallback(
    async (taskId: number, title: string, categoryId: number) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      let position = task.position;
      if (task.category_id !== categoryId) {
        const siblings = tasks.filter((t) => t.category_id === categoryId);
        position = siblings.reduce((max, t) => Math.max(max, t.position), -1) + 1;
      }
      await storage.updateTask({ ...task, title: title.trim(), category_id: categoryId, position });
      await reload();
    },
    [tasks, reload]
  );

  const removeTask = useCallback(
    async (taskId: number) => {
      await storage.deleteTask(taskId);
      await reload();
    },
    [reload]
  );

  const moveTaskItem = useCallback(
    async (taskId: number, direction: MoveDirection) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const siblings = tasks.filter((t) => t.category_id === task.category_id);
      const index = siblings.findIndex((t) => t.id === taskId);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= siblings.length) return;
      tapFeedback();
      const reordered = [...siblings];
      [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
      await Promise.all(
        reordered.map((t, i) =>
          t.position === i ? Promise.resolve() : storage.updateTask({ ...t, position: i })
        )
      );
      await reload();
    },
    [tasks, reload]
  );

  const addCategoryItem = useCallback(
    async (name: string, color: string) => {
      const position = categories.reduce((max, c) => Math.max(max, c.position), -1) + 1;
      await storage.insertCategory({ name: name.trim(), color, position });
      await reload();
    },
    [categories, reload]
  );

  const editCategoryItem = useCallback(
    async (id: number, name: string, color: string) => {
      const category = categories.find((c) => c.id === id);
      if (!category) return;
      await storage.updateCategory({ ...category, name: name.trim(), color });
      await reload();
    },
    [categories, reload]
  );

  const removeCategoryItem = useCallback(
    async (id: number) => {
      await storage.deleteCategory(id);
      await reload();
    },
    [reload]
  );

  const moveCategoryItem = useCallback(
    async (id: number, direction: MoveDirection) => {
      const index = categories.findIndex((c) => c.id === id);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= categories.length) return;
      tapFeedback();
      const reordered = [...categories];
      [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
      await Promise.all(
        reordered.map((c, i) =>
          c.position === i ? Promise.resolve() : storage.updateCategory({ ...c, position: i })
        )
      );
      await reload();
    },
    [categories, reload]
  );

  const value: DayStackContextValue = {
    isReady,
    categories,
    tasks,
    visibleCategories,
    completedTaskIds,
    completedCount,
    progress,
    historyDays,
    selectedCategory,
    setSelectedCategory,
    todayDate,
    activeDate,
    isViewingToday: activeDate === todayDate,
    selectDate,
    goToToday,
    toggleTask,
    addTask,
    editTask,
    removeTask,
    moveTaskItem,
    addCategoryItem,
    editCategoryItem,
    removeCategoryItem,
    moveCategoryItem,
  };

  return <DayStackContext.Provider value={value}>{children}</DayStackContext.Provider>;
}
