import ColorSelector from '@/components/colors';
import InputText from '@/components/InputText';
import Positionnement from '@/components/positionnement';
import { useSellerProducts } from "@/components/seller-products-context";
import TaillesSelector from '@/components/tailles';

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';


export default function CreateProcess() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0 photos, 1 couleurs, 2 tailles, 3 nom, 4 prix, 5 promo, 6 description
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
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

  // Ouvrir automatiquement le sélecteur d'images quand on arrive sur l'étape 0
  useEffect(() => {
    if (currentStep === 0 && selectedImages.length === 0) {
      // Ne pas bloquer l'UI si l'utilisateur refuse la permission
      pickImages();
    }
  }, [currentStep]);

  const goNext = () => {
    // validations par étape avant d'avancer
    if (currentStep === 0) {
      if (selectedImages.length === 0) {
        Alert.alert("Erreur", "Veuillez sélectionner au moins une image.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!name.trim()) {
        Alert.alert("Erreur", "Le nom du produit est requis.");
        return;
      }
    }
    if (currentStep === 4) {
      if (!price.trim()) {
        Alert.alert("Erreur", "Le prix est requis.");
        return;
      }
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert("Erreur", "Veuillez entrer un prix valide.");
        return;
      }
    }
    if (currentStep === 5) {
      if (promoPrice.trim()) {
        const priceNum = parseFloat(price);
        const promoPriceNum = parseFloat(promoPrice);
        if (isNaN(promoPriceNum) || promoPriceNum <= 0) {
          Alert.alert("Erreur", "Veuillez entrer un prix de promotion valide.");
          return;
        }
        if (!isNaN(priceNum) && promoPriceNum >= priceNum) {
          Alert.alert("Erreur", "Le prix de promotion doit être inférieur au prix normal.");
          return;
        }
      }
    }

    if (currentStep < 6) {
      setCurrentStep((s) => s + 1);
    } else {
      handleCreateProduct();
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
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
      colors: selectedColors,
      sizes: selectedSizes,
    });

    Alert.alert(
      "Succès", 
      "Produit créé avec succès !",
      [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/user")
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
      {/* Etapes */}
      {currentStep === 0 && (
        <>
          <View className='flex items-center justify-center'>
            <View className="relative">
              <Pressable onPress={pickImages}>
                <Image 
                  source={{ uri: selectedImages.length > 0 ? selectedImages[currentImageIndex] : "https://via.placeholder.com/150" }} 
                  className="w-96 h-96 rounded-sm border-2" 
                />
              </Pressable>
              {selectedImages.length > 0 && (
                <Pressable
                  onPress={() => removeImage(currentImageIndex)}
                  className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center"
                >
                  <Text className="text-white font-bold text-lg">×</Text>
                </Pressable>
              )}
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
        </>
      )}

      {currentStep === 1 && (
        <View>
          <Text className="text-center font-semibold mb-2">Choisissez la ou les couleurs</Text>
          <ColorSelector selectedColors={selectedColors} onChangeSelectedColors={setSelectedColors} />
        </View>
      )}

      {currentStep === 2 && (
        <View>
          <Text className="text-center font-semibold mb-2">Choisissez la ou les tailles</Text>
          <TaillesSelector selectedSizes={selectedSizes} onChangeSelectedSizes={setSelectedSizes} />
        </View>
      )}

      {currentStep === 3 && (
        <View className='gap-4 flex justify-center items-center'>
          <InputText placeholder="Nom du produit" value={name} onChangeText={setName} />
        </View>
      )}

      {currentStep === 4 && (
        <View className='gap-4 flex justify-center items-center'>
          <InputText placeholder="Le prix de l'article" value={price} onChangeText={setPrice} keyboardType="numeric" />
        </View>
      )}

      {currentStep === 5 && (
        <View className='gap-4 flex justify-center items-center'>
          <InputText placeholder="Si en promotion" value={promoPrice} onChangeText={setPromoPrice} keyboardType="numeric" />
        </View>
      )}

      {currentStep === 6 && (
        <View className='gap-4 flex justify-center items-center'>
          <InputText placeholder="Description (optionnel)" value={description} onChangeText={setDescription} type='comment' />
        </View>
      )}

      {/* Navigation */}
      <View className="flex-row justify-between items-center px-4 mt-8">
        <Pressable onPress={goBack} disabled={currentStep === 0}>
          <View className={`p-3 rounded-lg ${currentStep === 0 ? "bg-gray-300" : "bg-gray-500"}`}>
            <Text className="text-white">Retour</Text>
          </View>
        </Pressable>

        <Text className="text-gray-600">Étape {currentStep + 1} / 7</Text>

        <Pressable onPress={goNext}>
          <View className="bg-blue-500 p-3 rounded-lg">
            <Text className="text-white font-semibold">{currentStep === 6 ? "Créer le produit" : "Suivant"}</Text>
          </View>
        </Pressable>
      </View>
       </ScrollView>
    </Positionnement>
  );
}