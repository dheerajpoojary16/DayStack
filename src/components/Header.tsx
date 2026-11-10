import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "./theme";
import { formatLongDate, toDateKey } from "../utils/date";

interface HeaderProps {
  onAddCategory: () => void;
}

export function Header({ onAddCategory }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.date}>{formatLongDate(toDateKey())}</Text>
        <Text style={styles.title}>DayStack</Text>
      </View>
      <Pressable
        onPress={onAddCategory}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Add category"
      >
        <Ionicons name="folder-outline" size={18} color={colors.accent} />
        <Ionicons name="add" size={14} color={colors.accent} style={styles.plus} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleBlock: { flex: 1 },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  plus: { marginLeft: -2, marginTop: -8 },
  pressed: { opacity: 0.7 },
});
