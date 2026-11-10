import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DayStackProvider } from "./src/storage/context";
import { useDayStack } from "./src/hooks/useDayStack";
import type { Category, Task } from "./src/types";
import { Header } from "./src/components/Header";
import { ProgressCard } from "./src/components/ProgressCard";
import { CategoryFilterBar } from "./src/components/CategoryFilterBar";
import { CategorySection } from "./src/components/CategorySection";
import { TaskModal } from "./src/components/TaskModal";
import { CategoryModal } from "./src/components/CategoryModal";
import { CategoryOptionsMenu } from "./src/components/CategoryOptionsMenu";
import { showConfirmDialog, showInfoDialog } from "./src/utils/alert";

function AppContent() {
  const {
    categories,
    tasks,
    visibleCategories,
    completedTaskIds,
    completedCount,
    progress,
    historyDays,
    selectedCategory,
    setSelectedCategory,
    activeDate,
    isViewingToday,
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
  } = useDayStack();

  // Modals state
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetCategoryIdForNewTask, setTargetCategoryIdForNewTask] = useState<number | undefined>();

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [activeCategoryForOptions, setActiveCategoryForOptions] = useState<Category | null>(null);
  const [reorderingCategoryId, setReorderingCategoryId] = useState<number | null>(null);

  // Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalVisible(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async (name: string, color: string) => {
    try {
      if (editingCategory) {
        await editCategoryItem(editingCategory.id, name, color);
      } else {
        await addCategoryItem(name, color);
      }
    } catch (err) {
      showInfoDialog("Error", "Could not save category.");
    }
  };

  const handleDeleteCategoryPrompt = (category: Category) => {
    showConfirmDialog(
      "Delete Category?",
      `Are you sure you want to delete "${category.name}" and all its tasks? This action cannot be undone.`,
      () => removeCategoryItem(category.id),
      "Delete"
    );
  };

  // Task Actions
  const handleOpenAddTask = (categoryId?: number) => {
    if (categories.length === 0) {
      showConfirmDialog(
        "No Categories",
        "Create a category first before adding tasks.",
        handleOpenAddCategory,
        "Create Category"
      );
      return;
    }
    setEditingTask(null);
    setTargetCategoryIdForNewTask(
      categoryId ?? (selectedCategory !== "all" ? selectedCategory : categories[0]?.id)
    );
    setTaskModalVisible(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalVisible(true);
  };

  const handleSaveTask = async (title: string, categoryId: number) => {
    try {
      if (editingTask) {
        await editTask(editingTask.id, title, categoryId);
      } else {
        await addTask(title, categoryId);
      }
    } catch (err) {
      showInfoDialog("Error", "Could not save task.");
    }
  };

  const handleDeleteTaskPrompt = (task: Task) => {
    showConfirmDialog(
      "Delete Task?",
      `Are you sure you want to delete "${task.title}"?`,
      () => removeTask(task.id),
      "Delete"
    );
  };

  const handleToggleReorderMode = (catId: number) => {
    setReorderingCategoryId((prev) => (prev === catId ? null : catId));
  };

  const visibleTasksCount = tasks.filter((t) =>
    selectedCategory === "all" ? true : t.category_id === selectedCategory
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Header onAddCategory={handleOpenAddCategory} />

          <ProgressCard
            progress={progress}
            completedCount={completedCount}
            totalCount={visibleTasksCount}
            historyDays={historyDays}
            activeDate={activeDate}
            isViewingToday={isViewingToday}
            onSelectDate={selectDate}
            onGoToToday={goToToday}
          />

          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalTaskCount={tasks.length}
          />

          <FlatList
            data={visibleCategories}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Ionicons name="folder-open-outline" size={40} color="#2A352C" />
                <Text style={styles.emptyStateTitle}>No Categories</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Create your first category to start organizing your daily habits.
                </Text>
                <Pressable
                  style={styles.emptyStateButton}
                  onPress={handleOpenAddCategory}
                >
                  <Text style={styles.emptyStateButtonText}>＋ Add Category</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item: category }) => {
              const categoryTasks = tasks.filter(
                (t) => t.category_id === category.id
              );
              return (
                <CategorySection
                  category={category}
                  tasks={categoryTasks}
                  completedTaskIds={completedTaskIds}
                  onToggleTask={toggleTask}
                  onEditTask={handleOpenEditTask}
                  onDeleteTask={handleDeleteTaskPrompt}
                  onMoveTask={moveTaskItem}
                  onOptionsPress={(cat) => setActiveCategoryForOptions(cat)}
                  isReorderMode={reorderingCategoryId === category.id}
                  onToggleReorderMode={() => handleToggleReorderMode(category.id)}
                  onAddTaskToCategory={() => handleOpenAddTask(category.id)}
                />
              );
            }}
          />
        </View>

        {/* Floating Add Task Button */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.addTaskButton,
              pressed && styles.addTaskButtonPressed,
            ]}
            onPress={() => handleOpenAddTask()}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#0B1208" />
            <Text style={styles.addTaskText}>Add Task</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Task Modal (Add/Edit) */}
      <TaskModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categories}
        defaultCategoryId={targetCategoryIdForNewTask}
      />

      {/* Category Modal (Add/Edit) */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
        initialCategory={editingCategory}
      />

      {/* Category Options Menu */}
      <CategoryOptionsMenu
        visible={Boolean(activeCategoryForOptions)}
        category={activeCategoryForOptions}
        onClose={() => setActiveCategoryForOptions(null)}
        onEdit={handleOpenEditCategory}
        onToggleReorder={(cat) => handleToggleReorderMode(cat.id)}
        onDelete={handleDeleteCategoryPrompt}
        canMoveUp={
          activeCategoryForOptions
            ? categories.findIndex((c) => c.id === activeCategoryForOptions.id) > 0
            : false
        }
        canMoveDown={
          activeCategoryForOptions
            ? categories.findIndex((c) => c.id === activeCategoryForOptions.id) <
              categories.length - 1
            : false
        }
        onMoveUp={(cat) => moveCategoryItem(cat.id, "up")}
        onMoveDown={(cat) => moveCategoryItem(cat.id, "down")}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <DayStackProvider>
      <AppContent />
    </DayStackProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080A09",
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emptyStateTitle: {
    color: "#EFF3F0",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    color: "#67756B",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: "#151B17",
    borderWidth: 1,
    borderColor: "#253027",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  emptyStateButtonText: {
    color: "#C2F970",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 22 : 16,
    left: 20,
    right: 20,
  },
  addTaskButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#C2F970",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  addTaskButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  addTaskText: {
    color: "#0B1208",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});
