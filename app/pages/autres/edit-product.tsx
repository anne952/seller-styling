import { useSellerProducts } from "@/components/seller-products-context";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

export default function EditProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, updateProduct } = useSellerProducts();
  
  const productId = params.id ? Number(params.id) : undefined;
  const product = productId ? products.find(p => p.id === productId) : undefined;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setPromoPrice(product.promoPrice?.toString() || "");
      setDescription(product.description || "");
      setIsPromo(product.isPromo || false);
    }
  }, [product]);

  const handleUpdateProduct = () => {
    if (!product) return;

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
    
    if (isPromo && promoPrice.trim()) {
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

    // Mettre à jour le produit
    updateProduct(product.id, {
      name: name.trim(),
      price: priceNum,
      promoPrice: isPromo && promoPrice.trim() ? parseFloat(promoPrice) : undefined,
      description: description.trim() || undefined,
      isPromo: isPromo && promoPrice.trim() ? true : false,
    });

    Alert.alert(
      "Succès", 
      "Produit modifié avec succès !",
      [
        {
          text: "OK",
          onPress: () => router.push({
            pathname: "/pages/autres/seller-view",
            params: { id: String(product.id) }
          })
        }
      ]
    );
  };

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-500">Produit non trouvé</Text>
        <Link href="/(tabs)/user">
          <Pressable className="bg-blue-500 px-6 py-3 rounded-lg mt-4">
            <Text className="text-white font-semibold">Retour au profil</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 mt-12">
        <Link href={{
          pathname: "/pages/autres/seller-view",
          params: { id: String(product.id) }
        }}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">Modifier le produit</Text>
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

          {/* Promotion */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">En promotion</Text>
            <Switch
              value={isPromo}
              onValueChange={setIsPromo}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isPromo ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          {/* Prix de promotion */}
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

          {/* Images (lecture seule) */}
          <View>
            <Text className="text-lg font-semibold mb-2">Images ({product.images.length})</Text>
            <Text className="text-gray-500 text-sm">
              Les images ne peuvent pas être modifiées. Créez un nouveau produit pour changer les images.
            </Text>
          </View>

          {/* Boutons */}
          <View className="gap-3 mt-6">
            <Pressable
              onPress={handleUpdateProduct}
              className="bg-blue-500 py-4 rounded-lg"
            >
              <Text className="text-center text-white font-semibold text-lg">
                Sauvegarder les modifications
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
