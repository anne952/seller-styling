import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import Positionnement from "@/components/positionnement";

export default function ReceiptScreen() {
  const params = useLocalSearchParams<{ id?: string; title?: string; quantity?: string; price?: string; date?: string }>();
  // Exemple de données produits
  const products = params.id
    ? [
        {
          id: String(params.id),
          name: String(params.title ?? 'Produit'),
          quantity: Number(params.quantity ?? '1'),
          price: Number((params.price ?? '0').toString().replace(/[^0-9]/g, '')),
          image: "https://via.placeholder.com/60",
          originalPrice: undefined,
        },
      ]
    : [
        {
          id: "1",
          name: "Produit A",
          quantity: 2,
          price: 1500,
          image: "https://via.placeholder.com/60",
          originalPrice: 2000,
        },
        {
          id: "2",
          name: "Produit B",
          quantity: 1,
          price: 2000,
          image: "https://via.placeholder.com/60",
          originalPrice: undefined,
        },
      ];

  // Calcul du total
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const total = subtotal;

  const orderId = params.id ?? '—';
  const orderDate = params.date ?? '';

  return (
    <Positionnement>
      <View className="mt-16 p-4">
        <View className="flex flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">Reçu</Text>
          <View className="flex flex-row items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <Ionicons name="receipt-outline" size={16} color="#374151" />
            <Text className="text-gray-700 font-semibold text-sm">#{orderId}</Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow shadow-gray-200">
          <View className="flex flex-row justify-between items-center mb-2">
            <View className="flex flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">  {orderDate || '—'}</Text>
            </View>
            <View className="flex flex-row items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
              <Ionicons name="card-outline" size={14} color="#065F46" />
              <Text className="text-green-700 font-semibold text-sm">Flooz</Text>
            </View>
          </View>
          <View className="flex flex-row justify-between items-center">
            <Text className="text-gray-600">Total</Text>
            <Text className="text-xl font-bold text-blue-600">{total} F</Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow shadow-gray-200">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="font-semibold">Produits</Text>
            <Text className="text-gray-600">{products.length} article{products.length > 1 ? 's' : ''}</Text>
          </View>
          <View className="space-y-4">
            {products.map((item, index) => (
              <View key={item.id}>
                <View className="flex flex-row items-center">
                  <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg mr-4" />
                  <View className="flex-1">
                    <Text className="font-semibold text-lg">{item.name}</Text>
                    <Text className="text-gray-600">Quantité : {item.quantity}</Text>
                    {('originalPrice' in item && item.originalPrice) ? (
                      <Text className="line-through text-gray-400">{item.originalPrice} F</Text>
                    ) : null}
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 font-bold">{item.price * item.quantity} F</Text>
                  </View>
                </View>
                {index < products.length - 1 && <View className="h-px bg-gray-200 my-4" />}
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow shadow-gray-200">
          <Text className="font-semibold mb-3">Récapitulatif</Text>
          <View className="flex flex-row justify-between mb-2">
            <Text className="text-gray-600">Sous-total</Text>
            <Text className="font-semibold">{subtotal} F</Text>
          </View>
          <View className="h-px bg-gray-200 mb-2" />
          <View className="flex flex-row justify-between">
            <Text className="font-semibold">Total</Text>
            <Text className="text-xl font-bold text-blue-600">{total} F</Text>
          </View>
        </View>
      </View>
    </Positionnement>
  );
}
