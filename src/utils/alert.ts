import { Alert, Platform } from "react-native";

export function showInfoDialog(title: string, message: string): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "OK"
): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: confirmLabel.toLowerCase() === "delete" ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
