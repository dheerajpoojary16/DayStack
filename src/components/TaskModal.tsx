import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Category, Task } from "../types";
import { colors } from "./theme";
import { ModalSheet, modalStyles } from "./ModalSheet";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, categoryId: number) => void | Promise<void>;
  initialTask: Task | null;
  categories: Category[];
  defaultCategoryId?: number;
}

export function TaskModal({
  visible,
  onClose,
  onSave,
  initialTask,
  categories,
  defaultCategoryId,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();

  useEffect(() => {
    if (!visible) return;
    setTitle(initialTask?.title ?? "");
    setCategoryId(initialTask?.category_id ?? defaultCategoryId ?? categories[0]?.id);
  }, [visible, initialTask, defaultCategoryId, categories]);

  const canSave = title.trim().length > 0 && categoryId !== undefined;

  const handleSave = async () => {
    if (!canSave || categoryId === undefined) return;
    await onSave(title.trim(), categoryId);
    onClose();
  };

  return (
    <ModalSheet visible={visible} title={initialTask ? "Edit Task" : "New Task"} onClose={onClose}>
      <Text style={modalStyles.label}>Task</Text>
      <TextInput
        style={modalStyles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Morning run"
        placeholderTextColor={colors.textMuted}
        autoFocus
        maxLength={120}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      <Text style={modalStyles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}
      >
        {categories.map((cat) => {
          const active = cat.id === categoryId;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={[styles.chip, active && { borderColor: cat.color }]}
            >
              <View style={[styles.swatch, { backgroundColor: cat.color }]} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={modalStyles.buttons}>
        <Pressable style={modalStyles.cancel} onPress={onClose}>
          <Text style={modalStyles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[modalStyles.save, !canSave && modalStyles.saveDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={modalStyles.saveText}>Save</Text>
        </Pressable>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  chipScroll: { marginBottom: 16, flexGrow: 0 },
  chips: { gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatch: { width: 8, height: 8, borderRadius: 4 },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.text },
});
