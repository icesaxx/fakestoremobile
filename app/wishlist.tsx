import { StyleSheet, Text } from "react-native";
import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/stores/user.store";
import { getWishlist } from "@/lib/local-data";
import api from "@/lib/api";
import ItemsList from "./components/ItemsList";
import { typography, ui } from "@/theme/ui";
import useThemeStore from "@/stores/theme.store";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const isDark = useThemeStore((state) => state.isDark);

  const { data: wishlistIds = [] } = useQuery<number[]>({
    queryKey: ["wishlist", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => getWishlist(String(user?.sub)),
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get("/products");
      return response.data;
    },
  });

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlistIds.includes(product.id)),
    [products, wishlistIds]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <IconButton icon="arrow-left" iconColor={isDark ? "#f9fafb" : "#111827"} onPress={() => router.back()} />
      <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>Wishlist</Text>
      <FlatList
        data={wishlistProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ItemsList item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.empty, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>Your wishlist is empty.</Text>}
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
  empty: {
    ...typography.body,
    color: "#6b7280",
    marginTop: 16,
  },
});
