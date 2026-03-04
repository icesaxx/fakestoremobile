import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Icon } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { typography, ui } from "@/theme/ui";
import useThemeStore from "@/stores/theme.store";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const isDark = useThemeStore((state) => state.isDark);
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <View style={[styles.card, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
        <Icon source="check-circle" size={68} color="#166534" />
        <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>Order Placed</Text>
        <Text style={[styles.meta, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Order ID: {id}</Text>
        <Text style={[styles.meta, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Thank you for shopping with us.</Text>
      </View>
      <Button
        mode="contained"
        style={[styles.button, { backgroundColor: isDark ? "#2563eb" : "#111827" }]}
        labelStyle={styles.buttonLabel}
        onPress={() => router.replace("/orders")}
      >
        View Orders
      </Button>
      <Button
        mode="text"
        textColor={isDark ? "#93c5fd" : "#2563eb"}
        labelStyle={styles.secondaryLabel}
        onPress={() => router.replace("/(tabs)")}
      >
        Continue Shopping
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: ui.pageTop,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    ...typography.title,
    color: "#111827",
    fontSize: 28,
    marginTop: 10,
  },
  meta: {
    ...typography.body,
    color: "#4b5563",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#111827",
    marginBottom: 8,
  },
  buttonLabel: {
    fontFamily: ui.fontFamily,
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryLabel: {
    fontFamily: ui.fontFamily,
    fontWeight: "700",
  },
});
