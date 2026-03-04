import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, SegmentedButtons, Switch } from "react-native-paper";
import { useRouter } from "expo-router";
import { typography, ui } from "@/theme/ui";
import useThemeStore from "@/stores/theme.store";

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, mode, setMode } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <IconButton icon="arrow-left" iconColor={isDark ? "#f9fafb" : "#111827"} onPress={() => router.back()} />
      <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>Settings</Text>

      <View style={[styles.row, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
        <Text style={[styles.label, { color: isDark ? "#f9fafb" : "#111827" }]}>Notifications</Text>
        <Switch value={true} disabled />
      </View>

      <View style={[styles.row, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
        <Text style={[styles.label, { color: isDark ? "#f9fafb" : "#111827" }]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={(value) => setMode(value ? "dark" : "light")} />
      </View>

      <Text style={[styles.sectionLabel, { color: isDark ? "#cbd5e1" : "#334155" }]}>Theme</Text>
      <SegmentedButtons
        value={mode}
        onValueChange={(value) => setMode(value as "light" | "dark" | "system")}
        style={styles.segment}
        buttons={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />

      <Text style={[styles.caption, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
        Theme mode applies app-wide and is saved on this device.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: ui.pageTop,
  },
  title: {
    ...typography.title,
    color: "#111827",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  label: {
    ...typography.body,
    color: "#111827",
    fontWeight: "600",
  },
  caption: {
    ...typography.subtitle,
    marginTop: 8,
  },
  sectionLabel: {
    ...typography.body,
    marginTop: 6,
    marginBottom: 8,
    fontWeight: "700",
  },
  segment: {
    marginBottom: 8,
  },
});
