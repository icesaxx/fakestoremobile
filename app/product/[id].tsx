import { Image, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { typography, ui } from "@/theme/ui";
import { Button, IconButton } from "react-native-paper";
import useUserStore from "@/stores/user.store";
import { addToCart, getWishlist, toggleWishlist } from "@/lib/local-data";
import { toast } from "sonner-native";
import useThemeStore from "@/stores/theme.store";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const isDark = useThemeStore((state) => state.isDark);
  const productId = Number(id);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    enabled: Number.isFinite(productId),
    queryFn: async () => {
      const res = await api.get(`/products/${productId}`);
      return res.data;
    },
  });

  const { data: wishlistIds = [] } = useQuery<number[]>({
    queryKey: ["wishlist", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => getWishlist(String(user?.sub)),
  });

  const isWishlisted = useMemo(
    () => wishlistIds.includes(productId),
    [wishlistIds, productId]
  );

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user?.sub) throw new Error("No user");
      return addToCart(String(user.sub), productId, 1);
    },
    onSuccess: (nextCart) => {
      queryClient.setQueryData(["local-cart", user?.sub], nextCart);
      toast("Added to cart");
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user?.sub) throw new Error("No user");
      return toggleWishlist(String(user.sub), productId);
    },
    onSuccess: (nextWishlist) => {
      queryClient.setQueryData(["wishlist", user?.sub], nextWishlist);
    },
  });

  if (isLoading || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
        <Text style={[styles.infoText, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <IconButton icon="arrow-left" iconColor={isDark ? "#f9fafb" : "#111827"} onPress={() => router.back()} />
      <Image source={{ uri: product.image }} style={[styles.image, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]} />
      <View style={styles.body}>
        <Text style={[styles.category, { color: isDark ? "#94a3b8" : "#6b7280" }]}>{product.category}</Text>
        <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>{product.title}</Text>
        <Text style={[styles.price, { color: isDark ? "#f9fafb" : "#111827" }]}>${product.price.toFixed(2)}</Text>
        <Text style={[styles.description, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>{product.description}</Text>
      </View>
      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon={isWishlisted ? "heart" : "heart-outline"}
          onPress={() => wishlistMutation.mutate()}
          style={[styles.wishButton, { borderColor: isDark ? "#64748b" : "#d1d5db" }]}
          textColor={isDark ? "#cbd5e1" : "#334155"}
        >
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </Button>
        <Button
          mode="contained"
          onPress={() => addMutation.mutate()}
          loading={addMutation.isPending}
          style={[styles.addButton, { backgroundColor: isDark ? "#2563eb" : "#111827" }]}
          labelStyle={{ color: "#ffffff", fontFamily: ui.fontFamily, fontWeight: "700" }}
        >
          Add to Cart
        </Button>
      </View>
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
  infoText: {
    ...typography.body,
    color: "#4b5563",
  },
  image: {
    width: "100%",
    height: 280,
    resizeMode: "contain",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  body: {
    marginTop: 12,
  },
  category: {
    ...typography.subtitle,
    textTransform: "capitalize",
  },
  title: {
    ...typography.title,
    color: "#111827",
    fontSize: 26,
  },
  price: {
    ...typography.body,
    color: "#111827",
    fontWeight: "800",
    fontSize: 20,
    marginTop: 8,
  },
  description: {
    ...typography.body,
    color: "#4b5563",
    marginTop: 8,
    lineHeight: 22,
  },
  actions: {
    marginTop: "auto",
    paddingBottom: 12,
    gap: 10,
  },
  wishButton: {
    borderRadius: 10,
  },
  addButton: {
    borderRadius: 10,
    backgroundColor: "#111827",
  },
});
