import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Category } from "../types";
import { colors } from "./theme";
import { ModalSheet } from "./ModalSheet";

interface CategoryOptionsMenuProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onEdit: (category: Category) => void;
  onToggleReorder: (category: Category) => void;
  onDelete: (category: Category) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: (category: Category) => void;
  onMoveDown: (category: Category) => void;
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export function CategoryOptionsMenu({
  visible,
  category,
  onClose,
  onEdit,
  onToggleReorder,
  onDelete,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: CategoryOptionsMenuProps) {
  if (!category) return null;

  const run = (action: (c: Category) => void) => () => {
    onClose();
    action(category);
  };

  const items: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; danger?: boolean }[] = [
    { icon: "create-outline", label: "Edit category", onPress: run(onEdit) },
    { icon: "swap-vertical-outline", label: "Reorder / manage tasks", onPress: run(onToggleReorder) },
    { icon: "arrow-up-outline", label: "Move category up", onPress: run(onMoveUp), disabled: !canMoveUp },
    { icon: "arrow-down-outline", label: "Move category down", onPress: run(onMoveDown), disabled: !canMoveDown },
    { icon: "trash-outline", label: "Delete category", onPress: run(onDelete), danger: true },
  ];

  return (
    <ModalSheet visible={visible} title={category.name} onClose={onClose}>
      <View>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            disabled={item.disabled}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.pressed,
              item.disabled && styles.disabled,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.danger ? colors.danger : colors.textSecondary}
            />
            <Text style={[styles.label, item.danger && styles.danger]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.cancel} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.35 },
  label: { color: colors.text, fontSize: 15, fontWeight: "500" },
  danger: { color: colors.danger },
  cancel: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: "600" },
});
