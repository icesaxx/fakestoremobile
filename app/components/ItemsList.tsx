import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, IconButton } from 'react-native-paper'
import useUserStore from '@/stores/user.store'
import { toast } from 'sonner-native'
import { typography, ui } from '@/theme/ui'
import { addToCart, getWishlist, toggleWishlist } from '@/lib/local-data'
import { useRouter } from 'expo-router'
import useThemeStore from '@/stores/theme.store'

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
};

const ItemsList = ({ item }: { item: Product }) => {
  const { user } = useUserStore();
  const isDark = useThemeStore((state) => state.isDark);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: wishlistIds = [] } = useQuery<number[]>({
    queryKey: ["wishlist", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => getWishlist(String(user?.sub)),
  });

  const addCartMutation = useMutation({
    mutationFn: async () => {
      if (!user?.sub) {
        throw new Error("No authenticated user")
      }
      return addToCart(String(user.sub), item.id, 1);
    },
    onSuccess: (nextCart) => {
      queryClient.setQueryData(["local-cart", user?.sub], nextCart);
      setJustAdded(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setJustAdded(false), 1800);
      toast("Added to cart")
    },
    onError: () => {
      toast("Failed to add to cart")
    }
  })

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user?.sub) throw new Error("No authenticated user");
      return toggleWishlist(String(user.sub), item.id);
    },
    onSuccess: (nextWishlist) => {
      queryClient.setQueryData(["wishlist", user?.sub], nextWishlist);
    },
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isWishlisted = wishlistIds.includes(item.id);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" },
      ]}
    >
      <Pressable onPress={() => router.push(`/product/${item.id}`)} style={styles.topRow}>
        <Image source={{ uri: item.image }} style={[styles.image, { backgroundColor: isDark ? "#1f2937" : "#f9fafb" }]} />
      </Pressable>
      <View style={styles.actionsRow}>
        <Pressable onPress={() => router.push(`/product/${item.id}`)} style={styles.textWrap}>
          <Text style={[styles.category, { color: isDark ? "#94a3b8" : "#6b7280" }]}>{item.category}</Text>
          <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>{item.title}</Text>
          <Text style={[styles.price, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>${item.price}</Text>
        </Pressable>
        <View style={styles.actions}>
          <IconButton
            icon={isWishlisted ? "heart" : "heart-outline"}
            iconColor={isWishlisted ? "#dc2626" : "#6b7280"}
            size={22}
            style={styles.wishlistButton}
            onPress={() => wishlistMutation.mutate()}
          />
          <Button
            onPress={() => addCartMutation.mutate()}
            mode='contained'
            disabled={addCartMutation.isPending}
            style={{ backgroundColor: justAdded ? "#166534" : "black" }}
            labelStyle={[styles.buttonLabel, { color: "#ffffff" }]}
          >
            {addCartMutation.isPending ? "Adding..." : justAdded ? "Added" : "Add to Cart"}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default ItemsList;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    padding: 8,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  actions: {
    alignItems: "flex-end",
  },
  wishlistButton: {
    margin: 0,
    marginBottom: 8,
  },
  title: {
    ...typography.body,
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  category: {
    ...typography.subtitle,
    color: "#6b7280",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  price: {
    ...typography.body,
    color: "#6b7280",
    marginTop: 5,
    fontWeight: "600",
  },
  buttonLabel: {
    fontFamily: ui.fontFamily,
  },
});
