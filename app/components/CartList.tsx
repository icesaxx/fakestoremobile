import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ui } from '@/theme/ui';
import { IconButton, Button } from 'react-native-paper';

type CartDisplayItem = {
  productId: number;
  quantity: number;
  title: string;
  category: string;
  price: number;
  image: string;
  lineTotal: number;
};

const CartList = ({
  item,
  onRemove,
  onIncrease,
  onDecrease,
  removing,
  onOpenDetail,
  isDark,
}: {
  item: CartDisplayItem;
  onRemove: (item: CartDisplayItem) => void;
  onIncrease: (item: CartDisplayItem) => void;
  onDecrease: (item: CartDisplayItem) => void;
  removing: boolean;
  onOpenDetail: (item: CartDisplayItem) => void;
  isDark?: boolean;
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "#111827" : "#ffffff", borderColor: isDark ? "#374151" : "#e5e7eb" },
      ]}
    >
      <Pressable onPress={() => onOpenDetail(item)}>
        <Image source={{ uri: item.image }} style={[styles.image, { backgroundColor: isDark ? "#1f2937" : "#f9fafb" }]} />
      </Pressable>
      <View style={styles.info}>
        <Text style={[styles.category, { color: isDark ? "#94a3b8" : "#6b7280" }]}>{item.category}</Text>
        <Pressable onPress={() => onOpenDetail(item)}>
          <Text numberOfLines={2} style={[styles.title, { color: isDark ? "#f9fafb" : "#111827" }]}>{item.title}</Text>
        </Pressable>
        <View style={styles.metaRow}>
          <Text style={[styles.price, { color: isDark ? "#f9fafb" : "#111827" }]}>${item.price.toFixed(2)}</Text>
          <View style={[styles.qtyControl, { backgroundColor: isDark ? "#1f2937" : "#f3f4f6" }]}>
            <IconButton
              icon="minus"
              size={16}
              style={styles.qtyIcon}
              onPress={() => onDecrease(item)}
            />
            <Text style={[styles.qtyText, { color: isDark ? "#f9fafb" : "#111827" }]}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={16}
              style={styles.qtyIcon}
              onPress={() => onIncrease(item)}
            />
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.total, { color: isDark ? "#cbd5e1" : "#4b5563" }]}>Item Total: ${item.lineTotal.toFixed(2)}</Text>
          <Button
            mode="text"
            onPress={() => onRemove(item)}
            disabled={removing}
            textColor="#dc2626"
            labelStyle={styles.removeLabel}
            compact
          >
            {removing ? "Removing..." : "Remove"}
          </Button>
        </View>
      </View>
    </View>
  )
}

export default CartList

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  image: {
    width: 88,
    height: 88,
    resizeMode: "contain",
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    padding: 8,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  category: {
    fontFamily: ui.fontFamily,
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  title: {
    fontFamily: ui.fontFamily,
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontFamily: ui.fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 4,
  },
  qtyIcon: {
    margin: 0,
  },
  qtyText: {
    fontFamily: ui.fontFamily,
    fontWeight: "700",
    color: "#111827",
    minWidth: 20,
    textAlign: "center",
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  total: {
    fontFamily: ui.fontFamily,
    fontSize: 13,
    color: "#4b5563",
  },
  removeLabel: {
    fontFamily: ui.fontFamily,
    fontWeight: "700",
  },
})
