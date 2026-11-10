import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MoveDirection, Task } from "../types";
import { colors } from "./theme";

interface TaskRowProps {
  task: Task;
  accentColor: string;
  completed: boolean;
  isReorderMode: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: MoveDirection) => void;
}

export function TaskRow({
  task,
  accentColor,
  completed,
  isReorderMode,
  isFirst,
  isLast,
  onToggle,
  onEdit,
  onDelete,
  onMove,
}: TaskRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && !isReorderMode && styles.pressed]}
        onPress={isReorderMode ? undefined : onToggle}
        onLongPress={isReorderMode ? undefined : onEdit}
        disabled={isReorderMode}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={task.title}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: completed ? accentColor : colors.border },
            completed && { backgroundColor: accentColor },
          ]}
        >
          {completed && <Ionicons name="checkmark" size={15} color={colors.accentInk} />}
        </View>
        <Text style={[styles.title, completed && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
      </Pressable>

      {isReorderMode ? (
        <View style={styles.actions}>
          <IconButton icon="chevron-up" disabled={isFirst} onPress={() => onMove("up")} />
          <IconButton icon="chevron-down" disabled={isLast} onPress={() => onMove("down")} />
          <IconButton icon="trash-outline" color={colors.danger} onPress={onDelete} />
        </View>
      ) : (
        <IconButton icon="create-outline" color={colors.textMuted} onPress={onEdit} />
      )}
    </View>
  );
}

function IconButton({
  icon,
  onPress,
  disabled,
  color = colors.textSecondary,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, (pressed || disabled) && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={disabled ? colors.border : color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  pressed: { opacity: 0.55 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "500" },
  titleDone: { color: colors.textMuted, textDecorationLine: "line-through" },
  actions: { flexDirection: "row", alignItems: "center" },
  iconButton: { padding: 6 },
});
