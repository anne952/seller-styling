import Positionnement from "@/components/positionnement";
import React, { useState } from "react";
import { Alert, FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";

type OrderStatus = "pending" | "validated" | "delivered";

type Order = {
  id: number;
  image: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: OrderStatus;
};

export default function Commande() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      image: "https://via.placeholder.com/150",
      name: "Chemise homme",
      quantity: 2,
      unitPrice: 7500,
      status: "pending",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/150",
      name: "Robe femme",
      quantity: 1,
      unitPrice: 12500,
      status: "validated",
    },
  ]);

  const formatFcfa = (n: number) => `${n.toLocaleString()} F`;

  const validateOrder = (id: number) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "validated" } : o)));
  };

  const deliverOrder = (id: number) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "delivered" } : o)));
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
    if (order.status === "pending") {
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
    if (order.status === "validated") {
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
    // delivered
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
