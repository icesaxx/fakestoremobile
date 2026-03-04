import { StyleSheet, Text, View } from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useUserStore from "@/stores/user.store";
import { addOrder, clearCart, getCart } from "@/lib/local-data";
import api from "@/lib/api";
import { Button, IconButton, RadioButton, TextInput } from "react-native-paper";
import { typography, ui } from "@/theme/ui";
import { useRouter } from "expo-router";
import useThemeStore from "@/stores/theme.store";

type Product = {
  id: number;
  title: string;
  price: number;
};

export default function CheckoutScreen() {
  const { user } = useUserStore();
  const isDark = useThemeStore((state) => state.isDark);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [error, setError] = useState("");

  const { data: cart = [] } = useQuery({
    queryKey: ["local-cart", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => getCart(String(user?.sub)),
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  const total = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p.price]));
    return cart.reduce((sum, item) => sum + (byId.get(item.productId) ?? 0) * item.quantity, 0);
  }, [cart, products]);

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user?.sub) throw new Error("No user");
      const created = await addOrder(String(user.sub), {
        items: cart,
        total,
        address,
        paymentMethod,
      });
      await clearCart(String(user.sub));
      return created;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(["local-cart", user?.sub], []);
      queryClient.invalidateQueries({ queryKey: ["orders", user?.sub] });
      router.replace(`/order-success?id=${order.id}`);
    },
  });

  const handlePlaceOrder = () => {
    setError("");
    if (!address.trim()) {
      setError("Address is required");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }
    placeOrder.mutate();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}>
      <IconButton icon="arrow-left" iconColor={isDark ? "#f9fafb" : "#111827"} onPress={() => router.back()} />
      <Text style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>Checkout</Text>
      <Text style={[styles.sectionLabel, { color: isDark ? "#f9fafb" : "#111827" }]}>Shipping Address</Text>
      <TextInput
        mode="outlined"
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your shipping address"
        textColor={isDark ? "#f9fafb" : "#111827"}
        placeholderTextColor={isDark ? "#94a3b8" : "#6b7280"}
        multiline
      />
      <Text style={[styles.sectionLabel, { color: isDark ? "#f9fafb" : "#111827" }]}>Payment Method</Text>
      <RadioButton.Group onValueChange={(v) => setPaymentMethod(v as "card" | "cod")} value={paymentMethod}>
        <View style={styles.radioRow}>
          <RadioButton value="card" />
          <Text style={[styles.radioText, { color: isDark ? "#e2e8f0" : "#111827" }]}>Card</Text>
        </View>
        <View style={styles.radioRow}>
          <RadioButton value="cod" />
          <Text style={[styles.radioText, { color: isDark ? "#e2e8f0" : "#111827" }]}>Cash on Delivery</Text>
        </View>
      </RadioButton.Group>
      <View style={styles.summary}>
        <Text style={[styles.summaryText, { color: isDark ? "#f9fafb" : "#111827" }]}>Total: ${total.toFixed(2)}</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={handlePlaceOrder}
        loading={placeOrder.isPending}
        style={[styles.placeButton, { backgroundColor: isDark ? "#2563eb" : "#111827" }]}
        labelStyle={styles.placeButtonLabel}
      >
        Place Order
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
  },
  title: {
    ...typography.title,
    color: "#111827",
    marginBottom: 14,
  },
  sectionLabel: {
    ...typography.body,
    color: "#111827",
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioText: {
    ...typography.body,
    color: "#111827",
  },
  summary: {
    marginTop: 16,
    marginBottom: 10,
  },
  summaryText: {
    ...typography.body,
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },
  placeButton: {
    marginTop: 8,
    backgroundColor: "#111827",
  },
  placeButtonLabel: {
    fontFamily: ui.fontFamily,
    color: "#ffffff",
    fontWeight: "700",
  },
  error: {
    ...typography.body,
    color: "#dc2626",
  },
});
