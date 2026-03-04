import AsyncStorage from "@react-native-async-storage/async-storage";

export type CartEntry = {
  productId: number;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: string;
  userId: string;
  items: CartEntry[];
  total: number;
  address: string;
  paymentMethod: "card" | "cod";
  status: "placed";
};

const cartKey = (userId: string) => `local_cart_${userId}`;
const wishlistKey = (userId: string) => `local_wishlist_${userId}`;
const ordersKey = (userId: string) => `local_orders_${userId}`;

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getCart = async (userId: string): Promise<CartEntry[]> => {
  const raw = await AsyncStorage.getItem(cartKey(userId));
  const parsed = safeParse<CartEntry[]>(raw, []);
  return parsed.filter(
    (item) => typeof item?.productId === "number" && typeof item?.quantity === "number"
  );
};

export const setCart = async (userId: string, items: CartEntry[]) => {
  await AsyncStorage.setItem(cartKey(userId), JSON.stringify(items));
};

export const addToCart = async (
  userId: string,
  productId: number,
  quantity = 1
): Promise<CartEntry[]> => {
  const current = await getCart(userId);
  const existing = current.find((item) => item.productId === productId);

  const next = existing
    ? current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    : [...current, { productId, quantity }];

  await setCart(userId, next);
  return next;
};

export const updateCartQuantity = async (
  userId: string,
  productId: number,
  quantity: number
): Promise<CartEntry[]> => {
  const current = await getCart(userId);
  const next =
    quantity <= 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
  await setCart(userId, next);
  return next;
};

export const removeFromCart = async (
  userId: string,
  productId: number
): Promise<CartEntry[]> => {
  const current = await getCart(userId);
  const next = current.filter((item) => item.productId !== productId);
  await setCart(userId, next);
  return next;
};

export const clearCart = async (userId: string) => {
  await setCart(userId, []);
};

export const getWishlist = async (userId: string): Promise<number[]> => {
  const raw = await AsyncStorage.getItem(wishlistKey(userId));
  const parsed = safeParse<number[]>(raw, []);
  return parsed.filter((id) => typeof id === "number");
};

export const toggleWishlist = async (
  userId: string,
  productId: number
): Promise<number[]> => {
  const current = await getWishlist(userId);
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  await AsyncStorage.setItem(wishlistKey(userId), JSON.stringify(next));
  return next;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const raw = await AsyncStorage.getItem(ordersKey(userId));
  const parsed = safeParse<Order[]>(raw, []);
  return parsed.filter((order) => typeof order?.id === "string");
};

export const addOrder = async (
  userId: string,
  payload: Omit<Order, "id" | "createdAt" | "status" | "userId">
): Promise<Order> => {
  const current = await getOrders(userId);
  const order: Order = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "placed",
    userId,
    ...payload,
  };
  const next = [order, ...current];
  await AsyncStorage.setItem(ordersKey(userId), JSON.stringify(next));
  return order;
};
