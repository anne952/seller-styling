import { useSellerProducts } from "@/components/seller-products-context";
import { ProductsApi } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const { addProduct } = useSellerProducts();

  const images = params.images ? JSON.parse(params.images as string) : [];

  const handleCreateProduct = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom du produit est requis.");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Erreur", "Le prix est requis.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un prix valide.");
      return;
    }

    if (isPromo) {
      if (!promoPrice.trim()) {
        Alert.alert("Erreur", "Veuillez entrer un prix de promotion.");
        return;
      }
      const promoPriceNum = parseFloat(promoPrice);
      if (isNaN(promoPriceNum) || promoPriceNum <= 0) {
        Alert.alert("Erreur", "Veuillez entrer un prix de promotion valide.");
        return;
      }
      if (promoPriceNum >= priceNum) {
        Alert.alert("Erreur", "Le prix de promotion doit être inférieur au prix normal.");
        return;
      }
    }

    setIsCreating(true);

    try {
      // Création du produit via l'API
      const createdProduct = await ProductsApi.create({
        nom: name.trim(),
        prix: priceNum,
        promoPrice: isPromo && promoPrice.trim() ? parseFloat(promoPrice) : undefined,
        images,
        description: description.trim() || undefined,
        tailles: [], // Pas de tailles définies
        couleurIds: [], // Pas de couleurs définies
      });

      const localProduct = {
        id: Number(createdProduct.id),
        name: name.trim(),
        price: priceNum,
        promoPrice: isPromo && promoPrice.trim() ? parseFloat(promoPrice) : undefined,
        images,
        description: description.trim() || undefined,
        isPromo: isPromo && promoPrice.trim() ? true : false,
        createdAt: new Date(),
        isSellerProduct: true,
        backendId: createdProduct.id,
      };

      addProduct(localProduct);

      // Message + redirection
      Alert.alert("Succès", "Produit créé avec succès !");
      router.replace("/(tabs)/home");

    } catch (error: any) {
      console.error("Erreur création produit:", error);
      Alert.alert("Erreur", error?.message || "Échec de la création du produit");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* En-tête */}
      <View className="flex-row items-center justify-between p-4 mt-12">
        <Link href="/pages/autres/create-process">
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">Détails du produit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="gap-4">
          {/* Nom du produit */}
          <View>
            <Text className="text-lg font-semibold mb-2">Nom du produit *</Text>
            <TextInput
              placeholder="Entrez le nom du produit"
              value={name}
              onChangeText={setName}
              className="border border-gray-300 rounded-lg p-3 text-base"
            />
          </View>

          {/* Prix normal */}
          <View>
            <Text className="text-lg font-semibold mb-2">Prix (FCFA) *</Text>
            <TextInput
              placeholder="Entrez le prix"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 text-base"
            />
          </View>

          {/* Switch promotion */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">En promotion</Text>
            <Switch
              value={isPromo}
              onValueChange={setIsPromo}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isPromo ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          {/* Prix promo */}
          {isPromo && (
            <View>
              <Text className="text-lg font-semibold mb-2">Prix de promotion (FCFA)</Text>
              <TextInput
                placeholder="Entrez le prix de promotion"
                value={promoPrice}
                onChangeText={setPromoPrice}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>
          )}

          {/* Description */}
          <View>
            <Text className="text-lg font-semibold mb-2">Description</Text>
            <TextInput
              placeholder="Décrivez votre produit (optionnel)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg p-3 text-base"
              textAlignVertical="top"
            />
          </View>

          {/* Images */}
          <View>
            <Text className="text-lg font-semibold mb-2">Images ({images.length})</Text>
            <View className="flex-row flex-wrap gap-2">
              {images.map((uri: string, index: number) => (
                <View
                  key={index}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300"
                >
                  <Text className="text-xs text-center p-1 bg-gray-100">
                    Image {index + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Boutons */}
          <View className="gap-3 mt-6">
            <Pressable
              onPress={handleCreateProduct}
              disabled={isCreating}
              className={`flex-row justify-center items-center py-4 rounded-lg ${
                isCreating ? "bg-gray-400" : "bg-blue-500"
              }`}
            >
              {isCreating && <ActivityIndicator size="small" color="#fff" className="mr-2" />}
              <Text className="text-center text-white font-semibold text-lg">
                {isCreating ? "Création en cours..." : "Créer le produit"}
              </Text>
            </Pressable>

            <Link href="/pages/autres/create-process">
              <Pressable className="bg-gray-200 py-4 rounded-lg">
                <Text className="text-center font-semibold text-lg">
                  Modifier les images
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
