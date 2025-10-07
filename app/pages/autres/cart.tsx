import { useActivity } from "@/components/activity-context";
import { useCart } from "@/components/cart-context";
import { OrdersApi } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";


export default function Cart(){
  const { items, increment, decrement, removeFromCart, totalPrice, totalCount, clearCart } = useCart();
  const { addActivity } = useActivity();
  const router = useRouter();

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles avant de passer au paiement.');
      return;
    }
    // Stocke temporairement les données du panier pour le paiement
    router.push('/pages/autres/payement');
  };

  return(
     <View className="flex-1 mt-16 ">
         <View className=" p-4">
             <View className="flex flex-row gap-20">
            <Link href="/(tabs)/home" className="bg-blue-500 w-10 p-2 rounded-lg">
             <Ionicons name="chevron-back-outline" size={24} color="black"/>
            </Link>
            <Text className="text-xl font-bold mt-2">Mon Panier</Text>            
            </View>    

            <ScrollView className="les_produit_ajouter flex flex-col mt-10 mb-48">
              {items.length === 0 && (
                <Text className="text-center text-gray-500 mt-10">Votre panier est vide.</Text>
              )}
              {items.map((it, idx) => (
                <View key={`${it.id}-${it.size ?? ""}-${it.color ?? ""}-${idx}`} className="flex flex-row items-center bg-white rounded-xl p-3 shadow shadow-gray-200 gap-6">
                  {it.image && (
                    <Image source={typeof it.image === 'string' ? { uri: it.image } : it.image} style={{ width: 72, height: 72, borderRadius: 8 }} />
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-lg">{it.name}</Text>
                    <Text className="font-semibold">{it.price * it.quantity} F</Text>
                    <View className="flex flex-row gap-3">
                      {it.size ? <Text className="text-gray-600">Taille: {it.size}</Text> : null}
                      {it.color ? <Text className="text-gray-600">Couleur: {it.color}</Text> : null}
                    </View>                 
                     </View>
                  <View className="items-center">
                    <View className="flex flex-row items-center gap-3">
                      <Pressable onPress={() => decrement(it.id, { size: it.size, color: it.color })} className="bg-gray-200 rounded-md p-1">
                        <Ionicons name="remove" size={20} color="black" />
                      </Pressable>
                      <Text className="w-6 text-center font-semibold">{it.quantity}</Text>
                      <Pressable onPress={() => increment(it.id, { size: it.size, color: it.color })} className="bg-gray-200 rounded-md p-1">
                        <Ionicons name="add" size={20} color="black" />
                      </Pressable>
                    </View>
                    <Pressable onPress={() => removeFromCart(it.id, { size: it.size, color: it.color })} className="mt-2">
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
            </View>
            <View className=" absolute w-full bottom-2 bg-white shadow shadow-gray-500 p-6 gap-7 rounded-3xl">
             <View className="en_bas flex flex-row justify-around">
                 <Text className="text-xl font-semibold"> TOTAL :</Text>
                 <Text className="total_produit text-xl font-semibold"> {totalPrice}F</Text>
             </View>
             {items.length > 0 ? (
               <Pressable onPress={handleCheckout} className="bg-blue-500 rounded-lg p-2 text-center">
                  <Text className="font-semibold text-2xl text-center text-white">Acheter</Text>
               </Pressable>
             ) : (
               <Pressable onPress={() => Alert.alert('Panier vide', 'Ajoutez des articles avant de passer au paiement.')} className="bg-gray-300 rounded-lg p-2 text-center">
                  <Text className="font-semibold text-2xl text-center text-white">Acheter</Text>
               </Pressable>
             )}
            </View>
          <View className="bottom-0 absolute w-full">
            
          </View>
            </View>
  )
}
