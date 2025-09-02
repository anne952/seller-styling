import ColorSelector from '@/components/colors';
import InputText from '@/components/InputText';
import Positionnement from '@/components/positionnement';
import { useSellerProducts } from "@/components/seller-products-context";
import TaillesSelector from '@/components/tailles';

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';


export default function CreateProcess() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const { addProduct } = useSellerProducts();

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Veuillez autoriser l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const imageUris = result.assets.map(asset => asset.uri);
      setSelectedImages(imageUris);
      setCurrentImageIndex(0);
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleCreateProduct = () => {
    // Validation
    if (selectedImages.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins une image.");
      return;
    }
    
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
    
    if (promoPrice.trim()) {
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

    // Créer le produit
    addProduct({
      name: name.trim(),
      price: priceNum,
      promoPrice: promoPrice.trim() ? parseFloat(promoPrice) : undefined,
      images: selectedImages,
      description: description.trim() || undefined,
      isPromo: promoPrice.trim() ? true : false,
    });

    Alert.alert(
      "Succès", 
      "Produit créé avec succès !",
      [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)/user")
        }
      ]
    );
  };

  return (
    <Positionnement>
        <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 70 }}
        >
      <View className='flex items-center justify-center'>
        <View className="relative">
          <Pressable onPress={pickImages}>
            <Image 
              source={{ uri: selectedImages.length > 0 ? selectedImages[currentImageIndex] : "https://via.placeholder.com/150" }} 
              className="w-96 h-96 rounded-sm border-2 border-blue-500" 
            />
          </Pressable>
          
          {/* Bouton supprimer l'image actuelle */}
          {selectedImages.length > 0 && (
            <Pressable
              onPress={() => removeImage(currentImageIndex)}
              className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold text-lg">×</Text>
            </Pressable>
          )}

          {/* Dots indicateurs */}
          {selectedImages.length > 1 && (
            <View className="flex-row justify-center mt-4 gap-2">
              {selectedImages.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Miniatures de toutes les images */}
      {selectedImages.length > 1 && (
        <View className="mb-4">
          <Text className="text-center text-gray-600 mb-2">Toutes les images ({selectedImages.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <View className="flex-row gap-3">
              {selectedImages.map((uri, index) => (
                <Pressable
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  className={`relative ${
                    index === currentImageIndex ? "border-2 border-blue-500" : "border border-gray-300"
                  } rounded-lg`}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                  >
                    <Text className="text-white font-bold text-xs">×</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      <View>
        <ColorSelector />
      </View>
      <View>
        <TaillesSelector />
      </View>
      <View className='gap-4 flex justify-center items-center'>
        <InputText placeholder="Nom du produit" value={name} onChangeText={setName} />
        <InputText placeholder="Le prix de l'article" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <InputText placeholder="Si en promotion" value={promoPrice} onChangeText={setPromoPrice} keyboardType="numeric" />
        <InputText placeholder="Description (optionnel)" value={description} onChangeText={setDescription} type='comment' />
      </View>
      <View>
      </View>
      <View>
        <Pressable onPress={handleCreateProduct} className="p-4">
          <View className="bg-blue-500 p-4 w-[23rem] h-15 rounded-lg">
            <Text className="text-center text-white font-semibold text-xl">Créer le produit</Text>
          </View>
        </Pressable>
      </View>
       </ScrollView>
    </Positionnement>
  );
}