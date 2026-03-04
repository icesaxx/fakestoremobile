import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/stores/user.store";
import { getOrders, Order } from "@/lib/local-data";
import { typography, ui } from "@/theme/ui";
import useThemeStore from "@/stores/theme.store";

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const isDark = useThemeStore((state) => state.isDark);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["orders", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => getOrders(String(user?.sub)),
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <IconButton icon="arrow-left" iconColor={isDark ? "#f9fafb" : "#111827"} onPress={() => router.back()} />
      <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
            <Text style={[styles.orderId, { color: isDark ? "#f9fafb" : "#111827" }]}>Order #{item.id}</Text>
            <Text style={[styles.meta, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <Text style={[styles.meta, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>
              {item.items.reduce((sum, entry) => sum + entry.quantity, 0)} items
            </Text>
            <Text style={[styles.total, { color: isDark ? "#f9fafb" : "#111827" }]}>${item.total.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>No orders yet.</Text>}
      />
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
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 10,
  },
  orderId: {
    ...typography.body,
    color: "#111827",
    fontWeight: "800",
  },
  meta: {
    ...typography.subtitle,
    marginTop: 2,
  },
  total: {
    ...typography.body,
    color: "#111827",
    fontWeight: "800",
    marginTop: 6,
  },
  empty: {
    ...typography.body,
    color: "#6b7280",
    marginTop: 16,
  },
});
