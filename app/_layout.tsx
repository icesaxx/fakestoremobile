import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useUserStore, { type User } from "@/stores/user.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toaster } from 'sonner-native';
import { decodeTokenSafely, isLocalSessionToken, isTokenExpired, parseStoredUser } from "@/lib/auth";
import useThemeStore from "@/stores/theme.store";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = {
  initialRouteName: "/(tabs)",
};

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { token, hydrateSession, clearSession } = useUserStore();
  const router = useRouter();
  const segments = useSegments();

  const [loading, setLoading] = useState(true);

  // Load token + user on app start and validate token shape/expiry.
  useEffect(() => {
    const loadSession = async () => {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
      ]);

      if (!storedToken || isTokenExpired(storedToken)) {
        await AsyncStorage.multiRemove(["token", "user"]);
        clearSession();
        setLoading(false);
        return;
      }

      if (isLocalSessionToken(storedToken)) {
        const localUser = parseStoredUser(storedUser);
        if (!localUser?.sub) {
          await AsyncStorage.multiRemove(["token", "user"]);
          clearSession();
          setLoading(false);
          return;
        }

        hydrateSession(storedToken, { ...localUser, sub: localUser.sub });
        setLoading(false);
        return;
      }

      const decodedFromToken = decodeTokenSafely(storedToken);
      if (!decodedFromToken?.sub) {
        await AsyncStorage.multiRemove(["token", "user"]);
        clearSession();
        setLoading(false);
        return;
      }

      const hydratedUser = parseStoredUser(storedUser);
      const nextUser: User = hydratedUser?.sub
        ? { ...hydratedUser, sub: hydratedUser.sub }
        : { ...decodedFromToken, sub: decodedFromToken.sub };
      hydrateSession(storedToken, nextUser);
      setLoading(false);
    };

    loadSession();
  }, [clearSession, hydrateSession]);

  // Redirect based on token
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, segments, loading, router]);

  if (loading) return null; // or simple loading text

  return <>{children}</>;
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const systemColorScheme = useColorScheme();
  const isDark = useThemeStore((state) => state.isDark);
  const syncSystemMode = useThemeStore((state) => state.syncSystemMode);
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  useEffect(() => {
    syncSystemMode(systemColorScheme === "dark");
  }, [systemColorScheme, syncSystemMode]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <RouteGuard>
              <StatusBar style={isDark ? "light" : "dark"} />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="wishlist" options={{ headerShown: false }} />
                <Stack.Screen name="orders" options={{ headerShown: false }} />
                <Stack.Screen name="checkout" options={{ headerShown: false }} />
                <Stack.Screen name="order-success" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
              </Stack>
              <Toaster />
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
