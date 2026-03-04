import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/stores/user.store";
import { useMemo } from "react";
import { CartEntry, getCart } from "@/lib/local-data";
import { ui } from "@/theme/ui";
import { Alert } from "react-native";
import { IconButton } from "react-native-paper";
import useThemeStore from "@/stores/theme.store";

export default function TabsLayout() {
  const { user } = useUserStore();
  const router = useRouter();
  const isDark = useThemeStore((state) => state.isDark);

  const { data: cartProducts = [] } = useQuery<CartEntry[]>({
    queryKey: ["local-cart", user?.sub],
    enabled: !!user?.sub,
    queryFn: async () => {
      return getCart(String(user?.sub));
    },
  });

  const cartCount = useMemo(
    () => cartProducts.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [cartProducts]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? "#111827" : "#ffffff",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: ui.fontFamily,
          fontWeight: "800",
          color: isDark ? "#f9fafb" : "#111827",
        },
        tabBarStyle: {
          backgroundColor: isDark ? "#111827" : "#ffffff",
          borderTopColor: isDark ? "#374151" : "#e5e7eb",
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: isDark ? "#d1d5db" : "#9ca3af",
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          headerRight: () => (
            <IconButton
              icon="filter-variant"
              onPress={() =>
                Alert.alert(
                  "Filters",
                  "Use search, category chips, and sort controls on this page."
                )
              }
            />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerRight: () => (
            <IconButton
              icon="cog-outline"
              onPress={() => router.push("/settings")}
            />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
