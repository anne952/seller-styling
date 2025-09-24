import Positionnement from "@/components/positionnement";
import { OrdersApi } from "@/utils/auth";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";

type OrderStatus = "validation" | "en_cours" | "livree" | "annulee";

type Order = {
  id: number;
  image: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: OrderStatus;
};

export default function Commande() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const my = await OrdersApi.myOrders();
        if (!mounted) return;
        const mapped: Order[] = (Array.isArray(my) ? my : []).map((o: any) => ({
          id: Number(o.id),
          image: Array.isArray(o.items) && o.items[0]?.image ? o.items[0].image : "https://via.placeholder.com/150",
          name: o.nom || o.items?.[0]?.name || `Commande #${o.id}`,
          quantity: Array.isArray(o.items) ? o.items.reduce((a: number, it: any) => a + (it.quantity ?? 0), 0) : 1,
          unitPrice: Number(o.items?.[0]?.price ?? 0),
          status: o.status as OrderStatus,
        }));
        setOrders(mapped);
      } catch {
        setOrders([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatFcfa = (n: number) => `${n.toLocaleString()} F`;

  const validateOrder = (id: number) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "en_cours" } : o)));
  };

  const deliverOrder = (id: number) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "livree" } : o)));
  };

  const cancelOrder = (id: number) => {
    Alert.alert(
      "Annuler la commande",
      "Êtes-vous sûr de vouloir annuler cette commande ?",
      [
        { text: "Non", style: "cancel" },
        { text: "Oui", style: "destructive", onPress: () => setOrders((prev) => prev.filter((o) => o.id !== id)) },
      ]
    );
  };

  const renderActions = (order: Order) => {
    if (order.status === "validation") {
      return (
        <View className="flex-row gap-2 mt-2">
          <Pressable onPress={() => validateOrder(order.id)}>
            <View className="bg-blue-500 px-3 py-2 rounded-lg">
              <Text className="text-white">Valider</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => cancelOrder(order.id)}>
            <View className="bg-red-500 px-3 py-2 rounded-lg">
              <Text className="text-white">Annuler</Text>
            </View>
          </Pressable>
        </View>
      );
    }
    if (order.status === "en_cours") {
      return (
        <View className="flex-row gap-2 mt-2">
          <Pressable onPress={() => deliverOrder(order.id)}>
            <View className="bg-green-600 px-3 py-2 rounded-lg">
              <Text className="text-white">Livrer</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => cancelOrder(order.id)}>
            <View className="bg-red-500 px-3 py-2 rounded-lg">
              <Text className="text-white">Annuler</Text>
            </View>
          </Pressable>
        </View>
      );
    }
    // delivered / annulee
    return (
      <View className="mt-2">
        <View className="bg-gray-400 px-3 py-2 rounded-lg">
          <Text className="text-white">Livré</Text>
        </View>
      </View>
    );
  };

  return (
    <Positionnement>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
        <Text className="text-lg font-bold text-center mb-4">Commandes</Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const total = item.unitPrice * item.quantity;
            return (
              <View className="bg-white rounded-xl p-4 mb-4 flex-row gap-3 items-center">
                <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg" />
                <View className="flex-1">
                  <Text className="font-semibold">{item.name}</Text>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">Qté: {item.quantity}</Text>
                    <Text className="text-gray-600">PU: {formatFcfa(item.unitPrice)}</Text>
                    <Text className="font-semibold">Prix: {formatFcfa(total)}</Text>
                  </View>
                  {renderActions(item)}
                </View>
              </View>
            );
          }}
        />
      </ScrollView>
    </Positionnement>
  );
}
