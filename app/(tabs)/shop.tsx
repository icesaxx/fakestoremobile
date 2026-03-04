import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import ItemsList from '../components/ItemsList';
import { useQuery } from '@tanstack/react-query';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import api from '@/lib/api';
import { typography, ui } from '@/theme/ui';
import React, { useMemo, useState } from 'react';
import { Chip, SegmentedButtons, TextInput } from 'react-native-paper';
import useThemeStore from '@/stores/theme.store';

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

const categoryLabelMap: Record<string, string> = {
  all: "All",
  electronics: "Electronics",
  jewelery: "Jewelry",
  "men's clothing": "Men",
  "women's clothing": "Women",
};

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonLineLarge} />
    <View style={styles.skeletonLineSmall} />
  </View>
);

export default function Shop() {
  const isDark = useThemeStore((state) => state.isDark);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const { data: items = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get("/products");
      return response.data;
    }
  })

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category)));
    return ["all", ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    let next = [...items];

    if (selectedCategory !== "all") {
      next = next.filter((item) => item.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      next = next.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    if (sortBy === "price_asc") {
      next.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      next.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name_asc") {
      next.sort((a, b) => a.title.localeCompare(b.title));
    }

    return next;
  }, [items, search, selectedCategory, sortBy]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f3f4f6" }]}
    >
      <View style={styles.controls}>
        <TextInput
          mode="outlined"
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          left={<TextInput.Icon icon="magnify" />}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
              styles.chip,
              selectedCategory === category ? styles.chipSelected : null,
              isDark ? styles.chipDark : null,
            ]}
              textStyle={[
              styles.chipText,
              selectedCategory === category ? styles.chipTextSelected : null,
              isDark && selectedCategory !== category ? styles.chipTextDark : null,
            ]}
            >
              {categoryLabelMap[category] ?? category}
            </Chip>
          ))}
        </ScrollView>

        <SegmentedButtons
          value={sortBy}
          onValueChange={setSortBy}
          style={styles.segment}
          buttons={[
            { value: "default", label: "Default" },
            { value: "price_asc", label: "Price +" },
            { value: "price_desc", label: "Price -" },
            { value: "name_asc", label: "Name" },
          ]}
        />
      </View>

      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : null}

      {isError ? (
        <Text style={[styles.bodyText, { color: isDark ? "#f9fafb" : "#111827" }]}>Could not load products. Pull to retry.</Text>
      ) : null}

      {!isLoading && !isError ? (
        filteredItems.length === 0 ? (
          <Text style={[styles.emptyCompact, { color: isDark ? "#cbd5e1" : "#6b7280" }]}>No products match this filter.</Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ItemsList item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: 0,
  },
  bodyText: {
    ...typography.body,
    color: "#111827",
    marginTop: 12,
  },
  controls: {
    gap: 6,
    marginBottom: 6,
  },
  chipContainer: {
    paddingTop: 2,
    paddingBottom: 2,
    gap: 8,
    alignItems: "center",
  },
  chipScroll: {
    minHeight: 36,
  },
  chip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 34,
    justifyContent: "center",
    marginVertical: 2,
  },
  chipSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  chipDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  chipText: {
    color: "#111827",
    fontSize: 12,
  },
  chipTextSelected: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  chipTextDark: {
    color: "#e5e7eb",
  },
  segment: {
    marginTop: 0,
    marginBottom: 0,
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyCompact: {
    ...typography.body,
    color: "#6b7280",
    marginTop: 2,
  },
  skeletonCard: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 12,
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  skeletonLineLarge: {
    height: 16,
    borderRadius: 8,
    marginTop: 12,
    width: "80%",
    backgroundColor: "#e5e7eb",
  },
  skeletonLineSmall: {
    height: 14,
    borderRadius: 7,
    marginTop: 8,
    width: "40%",
    backgroundColor: "#e5e7eb",
  },
});
