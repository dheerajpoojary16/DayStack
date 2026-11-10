import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Category, MoveDirection, Task } from "../types";
import { colors } from "./theme";
import { TaskRow } from "./TaskRow";

interface CategorySectionProps {
  category: Category;
  tasks: Task[];
  completedTaskIds: Set<number>;
  onToggleTask: (taskId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (taskId: number, direction: MoveDirection) => void;
  onOptionsPress: (category: Category) => void;
  isReorderMode: boolean;
  onToggleReorderMode: () => void;
  onAddTaskToCategory: () => void;
}

export function CategorySection({
  category,
  tasks,
  completedTaskIds,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onOptionsPress,
  isReorderMode,
  onToggleReorderMode,
  onAddTaskToCategory,
}: CategorySectionProps) {
  const done = tasks.filter((t) => completedTaskIds.has(t.id)).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.swatch, { backgroundColor: category.color }]} />
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.count}>
          {done}/{tasks.length}
        </Text>
        {isReorderMode ? (
          <Pressable onPress={onToggleReorderMode} hitSlop={8} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onOptionsPress(category)}
            hitSlop={8}
            style={styles.optionsButton}
            accessibilityLabel={`${category.name} options`}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.empty}>No tasks in this category yet.</Text>
      ) : (
        tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            accentColor={category.color}
            completed={completedTaskIds.has(task.id)}
            isReorderMode={isReorderMode}
            isFirst={index === 0}
            isLast={index === tasks.length - 1}
            onToggle={() => onToggleTask(task.id)}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task)}
            onMove={(direction) => onMoveTask(task.id, direction)}
          />
        ))
      )}

      {!isReorderMode && (
        <Pressable
          onPress={onAddTaskToCategory}
          style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={16} color={colors.textMuted} />
          <Text style={styles.addText}>Add task</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  count: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  optionsButton: { padding: 4 },
  doneButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  doneText: { color: colors.accentInk, fontSize: 12, fontWeight: "800" },
  empty: { color: colors.textMuted, fontSize: 13, paddingVertical: 10 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10 },
  addText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  pressed: { opacity: 0.6 },
});
