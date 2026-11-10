import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Category, CategoryFilter } from "../types";
import { colors } from "./theme";

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategory: CategoryFilter;
  onSelectCategory: (filter: CategoryFilter) => void;
  totalTaskCount: number;
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  totalTaskCount,
}: CategoryFilterBarProps) {
  if (categories.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Chip
          label={`All · ${totalTaskCount}`}
          active={selectedCategory === "all"}
          onPress={() => onSelectCategory("all")}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            color={cat.color}
            active={selectedCategory === cat.id}
            onPress={() => onSelectCategory(cat.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {color ? <View style={[styles.swatch, { backgroundColor: color }]} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12, marginHorizontal: -20 },
  content: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  chipActive: { backgroundColor: colors.surfaceRaised, borderColor: colors.accent },
  swatch: { width: 8, height: 8, borderRadius: 4 },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600", maxWidth: 160 },
  chipTextActive: { color: colors.text },
});
