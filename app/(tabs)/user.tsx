import Positionnement from "@/components/positionnement";
import { useSellerProducts } from "@/components/seller-products-context";
import SellerProductCard from "@/components/SellerProductCard";
import { useUser } from "@/components/use-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";




export default function HomeScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { user } = useUser();
  const { products, removeProduct } = useSellerProducts();
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      "Supprimer le produit",
      "Êtes-vous sûr de vouloir supprimer ce produit ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeProduct(productId)
        }
      ]
    );
  };
  return (
    <Positionnement>
      <View className="flex-row absolute right-0 items-center px-6 mb-1 p-6 gap-6">
        <Link href="/pages/autres/create-process">
        <Ionicons name="add-circle-outline" size={24} color="black" className="p-4" />
        </Link>
        <Link href="/pages/autres/parametre">
          <Ionicons name="cog-outline" size={24} color="black" className="p-4" />
        </Link>
      </View>
      <View className="mt-16 p-4 gap-6">

        <View>
        <Text className="text-center font-bold">{user.name}</Text>
        <Text className="text-center">{user.email}</Text>
        <View className="items-center mt-2">
          <Link href="/pages/autres/edit-profil">
          </Link>
        </View>

        <View className="flex-row justify-between items-start mt-6">
          <Pressable onPress={pickImage} className="mt-2 ml-2">
            <View>
              <Image source={avatarUri ? { uri: avatarUri } : { uri: "https://via.placeholder.com/150" }} className="w-16 h-16 rounded-full border-2 border-blue-500" />
              <View className="absolute -bottom-1 -right-1 bg-blue-500 w-6 h-6 rounded-full items-center justify-center border border-white">
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </View>
          </Pressable>
          <View className="p-6">
            <Text className="font-bold text-blue-500 text-center">{products.length}</Text>
            <Text className="text-md">Publication</Text>
          </View>

          <View className="p-6">
            <Text className="font-bold text-blue-500 text-center">0</Text>
            <Text className="text-md">Like</Text>
          </View>          
        </View>

        </View>
        <View className="bg-blue-500 h-1 -mt-6"></View>
        
        {products.length > 0 ? (
          <View className="flex-1 mt-4">
            <Text className="text-lg font-bold text-center mb-4">Mes produits</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
            >
              <View className="flex-row">
                {products.map((product) => (
                  <SellerProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    prix={product.price}
                    prixPromo={product.promoPrice}
                    images={product.images}
                    onPress={() => router.push({
                      pathname: "/pages/autres/seller-view",
                      params: { id: String(product.id) }
                    })}
                    onDelete={() => handleDeleteProduct(product.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View className="flex">
            <Text className="text-md text-blue-500 mt-32 text-center">Ajouter un produit</Text>
          </View>
        )}
      </View>
    </Positionnement>
  );
}
  
