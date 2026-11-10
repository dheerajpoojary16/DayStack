import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Category } from "../types";
import { CATEGORY_COLORS, colors } from "./theme";
import { ModalSheet, modalStyles } from "./ModalSheet";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void | Promise<void>;
  initialCategory: Category | null;
}

export function CategoryModal({ visible, onClose, onSave, initialCategory }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (!visible) return;
    setName(initialCategory?.name ?? "");
    setColor(initialCategory?.color ?? CATEGORY_COLORS[0]);
  }, [visible, initialCategory]);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    await onSave(name.trim(), color);
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      title={initialCategory ? "Edit Category" : "New Category"}
      onClose={onClose}
    >
      <Text style={modalStyles.label}>Name</Text>
      <TextInput
        style={modalStyles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Fitness"
        placeholderTextColor={colors.textMuted}
        autoFocus
        maxLength={40}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      <Text style={modalStyles.label}>Color</Text>
      <View style={styles.swatches}>
        {CATEGORY_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}
            accessibilityLabel={`Color ${c}`}
          >
            {color === c && <Ionicons name="checkmark" size={16} color={colors.accentInk} />}
          </Pressable>
        ))}
      </View>

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
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchActive: { borderColor: colors.text },
});
