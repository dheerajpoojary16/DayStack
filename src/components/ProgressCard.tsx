import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DayHistoryItem } from "../types";
import { colors } from "./theme";
import { formatLongDate, formatWeekdayShort, fromDateKey } from "../utils/date";

interface ProgressCardProps {
  progress: number;
  completedCount: number;
  totalCount: number;
  historyDays: DayHistoryItem[];
  activeDate: string;
  isViewingToday: boolean;
  onSelectDate: (date: string) => void;
  onGoToToday: () => void;
}

export function ProgressCard({
  progress,
  completedCount,
  totalCount,
  historyDays,
  activeDate,
  isViewingToday,
  onSelectDate,
  onGoToToday,
}: ProgressCardProps) {
  const percent = Math.round(progress * 100);
  const remaining = Math.max(totalCount - completedCount, 0);

  let subtitle: string;
  if (totalCount === 0) subtitle = "No tasks yet";
  else if (remaining === 0) subtitle = "All done — nice work";
  else subtitle = `${remaining} task${remaining === 1 ? "" : "s"} remaining`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.label}>
            {isViewingToday ? "Today's progress" : formatLongDate(activeDate)}
          </Text>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.subtitle}>
            {completedCount}/{totalCount} · {subtitle}
          </Text>
        </View>
        {!isViewingToday && (
          <Pressable onPress={onGoToToday} style={styles.todayButton} hitSlop={6}>
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.history}>
        {historyDays.map((day) => {
          const isActive = day.date === activeDate;
          const isFull = day.total > 0 && day.completed >= day.total;
          return (
            <Pressable
              key={day.date}
              onPress={() => onSelectDate(day.date)}
              style={styles.day}
              accessibilityLabel={`${formatLongDate(day.date)}: ${day.completed} of ${day.total} done`}
            >
              <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                {formatWeekdayShort(day.date)}
              </Text>
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isFull && styles.dotFull,
                ]}
              >
                <View
                  style={[
                    styles.dotFill,
                    { height: `${Math.round(day.progress * 100)}%` },
                    isFull && styles.dotFillFull,
                  ]}
                />
                <Text style={[styles.dayNumber, isFull && styles.dayNumberFull]}>
                  {fromDateKey(day.date).getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 18,
    marginBottom: 14,
  },
  flex: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  percent: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1.2,
    marginTop: 2,
  },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  todayButton: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  todayButtonText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceRaised,
    overflow: "hidden",
    marginTop: 14,
  },
  fill: { height: "100%", backgroundColor: colors.accent, borderRadius: 4 },
  history: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  day: { alignItems: "center", flex: 1 },
  dayLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 6 },
  dayLabelActive: { color: colors.text },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dotActive: { borderColor: colors.accent, borderWidth: 2 },
  dotFull: { backgroundColor: colors.accent },
  dotFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(194, 249, 112, 0.22)",
  },
  dotFillFull: { backgroundColor: "transparent" },
  dayNumber: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  dayNumberFull: { color: colors.accentInk },
});
