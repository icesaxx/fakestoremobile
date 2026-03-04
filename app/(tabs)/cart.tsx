import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useUserStore from '@/stores/user.store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList } from 'react-native-gesture-handler'
import CartList from '../components/CartList'
import api from '@/lib/api'
import { Button } from 'react-native-paper'
import { typography, ui } from '@/theme/ui'
import { CartEntry, getCart, removeFromCart, updateCartQuantity } from '@/lib/local-data'
import { useRouter } from 'expo-router'
import useThemeStore from '@/stores/theme.store'

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
};

type CartItem = {
  productId: number;
  quantity: number;
  title: string;
  category: string;
  price: number;
  image: string;
  lineTotal: number;
};

const Cart = () => {
  const { user } = useUserStore();
  const isDark = useThemeStore((state) => state.isDark);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const { data: cartProducts = [], isLoading } = useQuery<CartEntry[]>({
    queryKey: ["local-cart", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => getCart(String(user?.sub)),
  })

  const { data: products = [], isLoading: productsLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data ?? [];
    },
  });

  const cartItems = useMemo<CartItem[]>(() => {
    const productsById = new Map(products.map((product) => [product.id, product]));

    return cartProducts
      .map((entry): CartItem | null => {
        const product = productsById.get(entry.productId);
        if (!product) return null;
        const quantity = entry.quantity ?? 1;

        return {
          productId: entry.productId,
          quantity,
          title: product.title,
          category: product.category,
          price: product.price,
          image: product.image,
          lineTotal: product.price * quantity,
        };
      })
      .filter((item): item is CartItem => item !== null);
  }, [cartProducts, products]);

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!user?.sub) throw new Error("No user");
      return removeFromCart(String(user.sub), productId);
    },
    onMutate: (productId) => {
      setRemovingKey(String(productId));
    },
    onSuccess: (nextCart) => {
      queryClient.setQueryData(["local-cart", user?.sub], nextCart);
      setRemovingKey(null);
    },
    onError: () => {
      setRemovingKey(null);
    }
  });

  const qtyMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!user?.sub) throw new Error("No user");
      return updateCartQuantity(String(user.sub), productId, quantity);
    },
    onSuccess: (nextCart) => {
      queryClient.setQueryData(["local-cart", user?.sub], nextCart);
    },
  });

  const handleRemoveItem = (item: { productId: number }) => {
    Alert.alert(
      "Remove item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeItemMutation.mutate(item.productId),
        },
      ]
    );
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const isBusy = isLoading || productsLoading;
  const hasItems = cartItems.length > 0;

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}
    >
      <Text style={[styles.headerSub, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>{itemCount} items</Text>

      {isBusy && <Text style={[styles.infoText, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Loading your cart...</Text>}
      {isError && <Text style={[styles.infoText, { color: isDark ? "#fca5a5" : "#4b5563" }]}>Error loading cart.</Text>}

      <FlatList
        data={cartItems}
        keyExtractor={(item) => `${item.productId}`}
        renderItem={({ item }) => (
          <CartList
            item={item}
            onRemove={handleRemoveItem}
            onDecrease={(current) =>
              qtyMutation.mutate({ productId: current.productId, quantity: current.quantity - 1 })
            }
            onIncrease={(current) =>
              qtyMutation.mutate({ productId: current.productId, quantity: current.quantity + 1 })
            }
            onOpenDetail={(current) => router.push(`/product/${current.productId}`)}
            removing={removingKey === String(item.productId)}
            isDark={isDark}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isBusy ? <Text style={[styles.infoText, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>No items in cart.</Text> : null}
      />

      <View style={[styles.summary, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6", borderTopColor: isDark ? "#374151" : "#e5e7eb" }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: isDark ? "#f9fafb" : "#111827" }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: isDark ? "#f9fafb" : "#111827" }]}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: isDark ? "#f9fafb" : "#111827" }]}>Total</Text>
          <Text style={[styles.totalValue, { color: isDark ? "#f9fafb" : "#111827" }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <Button
          mode="contained"
          style={[styles.checkoutButton, { backgroundColor: isDark ? "#2563eb" : "#111827" }]}
          contentStyle={styles.checkoutContent}
          labelStyle={[styles.checkoutLabel, { color: "#ffffff" }]}
          disabled={!hasItems}
          onPress={() => router.push("/checkout")}
        >
          {hasItems ? "Proceed to Checkout" : "Add items to continue"}
        </Button>
        {!hasItems ? (
          <>
            <Text style={[styles.emptySummaryText, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>
              Your cart is empty. Add products from Shop to checkout.
            </Text>
            <Button
              mode="outlined"
              style={[styles.shopActionButton, { borderColor: isDark ? "#64748b" : "#9ca3af" }]}
              textColor={isDark ? "#cbd5e1" : "#334155"}
              onPress={() => router.push("/(tabs)/shop")}
            >
              Go to Shop
            </Button>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

export default Cart

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: 0,
  },
  headerSub: {
    ...typography.subtitle,
    marginBottom: 10,
  },
  infoText: {
    ...typography.body,
    color: "#4b5563",
    marginVertical: 8,
  },
  listContent: {
    paddingBottom: 14,
  },
  summary: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 2,
    marginBottom: 12,
  },
  summaryLabel: {
    ...typography.body,
    color: "#4b5563",
  },
  summaryValue: {
    ...typography.body,
    color: "#111827",
    fontWeight: "600",
  },
  totalLabel: {
    fontFamily: ui.fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  totalValue: {
    fontFamily: ui.fontFamily,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  checkoutButton: {
    backgroundColor: "#111827",
    borderRadius: 12,
  },
  checkoutContent: {
    height: 48,
  },
  checkoutLabel: {
    fontFamily: ui.fontFamily,
    fontWeight: "700",
  },
  emptySummaryText: {
    ...typography.subtitle,
    marginTop: 10,
    textAlign: "center",
    color: "#6b7280",
  },
  shopActionButton: {
    marginTop: 8,
    borderColor: "#9ca3af",
  },
})
