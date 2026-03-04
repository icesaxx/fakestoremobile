import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import useUserStore from '@/stores/user.store'
import { useQueryClient } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import { typography, ui } from '@/theme/ui'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import useThemeStore from '@/stores/theme.store'

const accountItems = [
  { id: "orders", label: "My Orders", icon: "bag-handle-outline", route: "/orders" },
  { id: "wishlist", label: "Wishlist", icon: "heart-outline", route: "/wishlist" },
  { id: "address", label: "Shipping Address", icon: "location-outline" },
  { id: "payment", label: "Payment Methods", icon: "card-outline" },
];

const supportItems = [
  { id: "help", label: "Help Center", icon: "help-circle-outline" },
  { id: "privacy", label: "Privacy Policy", icon: "shield-checkmark-outline" },
  { id: "about", label: "App Version 1.0.0", icon: "information-circle-outline" },
];

const Profile = () => {

  const router = useRouter()
  const { user, clearSession } = useUserStore()
  const isDark = useThemeStore((state) => state.isDark)
  const queryClient = useQueryClient()

  const handleLogout = async () => {

    await AsyncStorage.multiRemove(['token', 'user'])

    clearSession()
    queryClient.clear()

    // 3️⃣ Redirect
    router.replace("/(auth)/login")
  }

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileCard, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? "#2563eb" : "#111827" }]}>
            <Text style={styles.avatarText}>
              {(user?.user?.[0] ?? "U").toUpperCase()}
            </Text>
          </View>
          <View style={styles.userTextWrap}>
            <Text style={[styles.userName, { color: isDark ? "#f9fafb" : "#111827" }]}>{user?.user ?? "User"}</Text>
            <Text style={[styles.userMeta, { color: isDark ? "#94a3b8" : "#6b7280" }]}>User ID: {user?.sub ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Account</Text>
          {accountItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.rowItem, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={20} color={isDark ? "#cbd5e1" : "#374151"} />
                <Text style={[styles.rowText, { color: isDark ? "#f9fafb" : "#111827" }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Support</Text>
          {supportItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.rowItem, { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" }]}
            >
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={20} color={isDark ? "#cbd5e1" : "#374151"} />
                <Text style={[styles.rowText, { color: isDark ? "#f9fafb" : "#111827" }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Button
        onPress={handleLogout}
        mode='contained'
        style={[styles.logoutButton, { backgroundColor: isDark ? "#2563eb" : "black" }]}
        labelStyle={[styles.buttonLabel, { color: "#ffffff" }]}
      >
        Logout
      </Button>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: 0,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 12,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily: ui.fontFamily,
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 20,
  },
  userTextWrap: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
  },
  userMeta: {
    ...typography.subtitle,
    marginTop: 2,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 8,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowText: {
    ...typography.body,
    color: "#111827",
  },
  logoutButton: {
    backgroundColor: "black",
    marginBottom: 10,
  },
  buttonLabel: {
    fontFamily: ui.fontFamily,
  },
});
