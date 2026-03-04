import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import React, { useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { typography, ui } from '@/theme/ui'
import { Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import useThemeStore from '@/stores/theme.store'

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
};

export default function Home() {
  const router = useRouter();
  const isDark = useThemeStore((state) => state.isDark);
  const { width } = useWindowDimensions();
  const sliderGap = 12;
  const sliderCardWidth = width - (ui.pageHorizontal * 2);

  const { data: items = [] } = useQuery<Product[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get("/products");
      return response.data;
    }
  })

  const featured = useMemo(() => items.slice(0, 5), [items]);
  const trending = useMemo(() => items.slice(5, 10), [items]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}
    >
      <Text style={[styles.subtitle, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>Discover today’s highlights</Text>

      <FlatList
        data={featured}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `featured-${item.id}`}
        contentContainerStyle={styles.sliderList}
        snapToInterval={sliderCardWidth + sliderGap}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.sliderCard,
              {
                width: sliderCardWidth,
                marginRight: index === featured.length - 1 ? 0 : sliderGap,
                backgroundColor: isDark ? "#111827" : "#ffffff",
                borderColor: isDark ? "#374151" : "#e5e7eb",
              },
            ]}
          >
            <Image source={{ uri: item.image }} style={[styles.sliderImage, { backgroundColor: isDark ? "#1f2937" : "#f9fafb" }]} />
            <Text style={[styles.sliderCategory, { color: isDark ? "#94a3b8" : "#6b7280" }]}>{item.category}</Text>
            <Text style={[styles.sliderTitle, { color: isDark ? "#f9fafb" : "#111827" }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.sliderPrice, { color: isDark ? "#f9fafb" : "#111827" }]}>${item.price}</Text>
            <Button
              mode="contained"
              style={[styles.shopNowButton, { backgroundColor: isDark ? "#2563eb" : "#111827" }]}
              labelStyle={{ color: "#ffffff", fontFamily: ui.fontFamily, fontWeight: "700" }}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              Shop Now
            </Button>
          </View>
        )}
      />

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>Trending Picks</Text>
        <Button
          mode="text"
          textColor={isDark ? "#93c5fd" : "#2563eb"}
          labelStyle={{ fontFamily: ui.fontFamily, fontWeight: "700" }}
          onPress={() => router.push("/(tabs)/shop")}
        >
          View All
        </Button>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
        {trending.map((item) => (
          <View
            key={item.id}
            style={[
              styles.trendingCard,
              { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" },
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.trendingImage} />
            <Text numberOfLines={1} style={[styles.trendingTitle, { color: isDark ? "#f9fafb" : "#111827" }]}>{item.title}</Text>
            <Text style={[styles.trendingPrice, { color: isDark ? "#e2e8f0" : "#111827" }]}>${item.price}</Text>
          </View>
        ))}
      </ScrollView>

      <Button
        mode="contained-tonal"
        style={styles.shopButton}
        buttonColor={isDark ? "#1f2937" : "#e5e7eb"}
        textColor={isDark ? "#f9fafb" : "#111827"}
        labelStyle={{ fontFamily: ui.fontFamily, fontWeight: "700" }}
        onPress={() => router.push("/(tabs)/shop")}
      >
        Go to Shop
      </Button>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: 10,
    paddingBottom: 12,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 2,
    marginBottom: 12,
  },
  sliderList: {
    paddingBottom: 8,
  },
  sliderCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 14,
  },
  sliderImage: {
    width: "100%",
    height: 170,
    resizeMode: "contain",
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  sliderCategory: {
    ...typography.subtitle,
    marginTop: 10,
    textTransform: "capitalize",
  },
  sliderTitle: {
    ...typography.body,
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },
  sliderPrice: {
    ...typography.body,
    color: "#111827",
    marginTop: 6,
    fontWeight: "700",
  },
  shopNowButton: {
    marginTop: 10,
    backgroundColor: "#111827",
    borderRadius: 10,
  },
  sectionRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.body,
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  trendingRow: {
    paddingBottom: 10,
    gap: 10,
  },
  trendingCard: {
    width: 150,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
  },
  trendingImage: {
    width: "100%",
    height: 90,
    resizeMode: "contain",
  },
  trendingTitle: {
    ...typography.body,
    marginTop: 8,
    color: "#111827",
    fontWeight: "600",
    fontSize: 13,
  },
  trendingPrice: {
    ...typography.subtitle,
    marginTop: 6,
    color: "#111827",
    fontWeight: "700",
  },
  shopButton: {
    marginTop: 4,
  },
});
