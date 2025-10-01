import ColorSelector from '@/components/colors';
import InputText from '@/components/InputText';
import Positionnement from '@/components/positionnement';
import { useSellerProducts } from "@/components/seller-products-context";
import TaillesSelector from '@/components/tailles';

import { CategoriesApi, ColorsApi, ProductsApi } from '@/utils/auth';
import { uploadImageToCloudinary } from '@/utils/cloudinary';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';


export default function CreateProcess() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0 photos, 1 couleurs, 2 tailles, 3 nom, 4 prix, 5 promo, 6 description
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Array<{id: number, type: string}>>([]);
  const [availableColors, setAvailableColors] = useState<Array<{id: number, nom: string}>>([]);
  const router = useRouter();
  const { addProduct } = useSellerProducts();
  const isDataLoadedRef = useRef(false);

  // Récupérer les couleurs sélectionnées (objets)
  const validColors = availableColors.filter(c => selectedColorIds.includes(c.id));

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Veuillez autoriser l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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

  // Charger les données disponibles
  useEffect(() => {
    if (isDataLoadedRef.current) return;
    isDataLoadedRef.current = true;

    const loadData = async () => {
      try {
        const [categories, colors] = await Promise.allSettled([
          CategoriesApi.list(),
          ColorsApi.list(),
        ]);

        let cats: Array<{id: number, type: string}> = [];
        let cols: Array<{id: number, nom: string}> = [];

        if (categories.status === 'fulfilled') {
          cats = categories.value;
        } else {
          console.error('Erreur chargement categories:', categories.reason);
        }

        if (colors.status === 'fulfilled') {
          cols = colors.value;
        } else {
          console.error('Erreur chargement colors:', colors.reason);
        }

        setAvailableCategories(cats);
        setAvailableColors(cols);
      } catch (error) {
        console.error('Erreur générale chargement categories/colors:', error);
        // En cas d'erreur, définir des tableaux vides pour permettre la poursuite
        setAvailableCategories([]);
        setAvailableColors([]);
      }
    };
    loadData();
  }, []);

  // Ouvrir automatiquement le sélecteur d'images quand on arrive sur l'étape 0
  useEffect(() => {
    if (currentStep === 0 && selectedImages.length === 0) {
      // Ne pas bloquer l'UI si l'utilisateur refuse la permission
      pickImages();
    }
  }, [currentStep]);

  const goNext = () => {
    console.log(`➡️ GoNext: étape ${currentStep} vers ${currentStep + 1}`);

    // validations par étape avant d'avancer
    if (currentStep === 0) {
      if (selectedImages.length === 0) {
        Alert.alert("Erreur", "Veuillez sélectionner au moins une image.");
        console.log("❌ Validation étape 0: Aucune image");
        return;
      }
      console.log("✅ Validation étape 0: Images OK");
    }
    if (currentStep === 1) {
      if (!selectedCategory || selectedCategory === null) {
        if (availableCategories.length === 0) {
          console.log("ℹ️ Validation étape 1: Liste catégories vide, on passe à l'étape suivante");
        } else {
          Alert.alert("Erreur", "Veuillez sélectionner une catégorie.");
          console.log("❌ Validation étape 1: Catégorie non sélectionnée (selectedCategory =", selectedCategory, ")");
          return;
        }
      } else {
        console.log("✅ Validation étape 1: Catégorie =", selectedCategory);
      }
    }
    if (currentStep === 2) {
      if (selectedColorIds.length === 0) {
        Alert.alert("Erreur", "Veuillez sélectionner au moins une couleur.");
        console.log("❌ Validation étape 2: Aucune couleur sélectionnée");
        return;
      }
      console.log("✅ Validation étape 2: Couleurs sélectionnées =", selectedColorIds);
    }
    if (currentStep === 3) {
      if (selectedSizes.length === 0) {
        Alert.alert("Erreur", "Veuillez sélectionner au moins une taille.");
        console.log("❌ Validation étape 3: Aucune taille sélectionnée");
        return;
      }
      console.log("✅ Validation étape 3: Tailles sélectionnées =", selectedSizes);
    }
    if (currentStep === 4) {
      if (!name.trim()) {
        Alert.alert("Erreur", "Le nom du produit est requis.");
        console.log("❌ Validation étape 4: Nom vide");
        return;
      }
      console.log("✅ Validation étape 4: Nom =", name);
    }
    if (currentStep === 5) {
      if (!price.trim()) {
        Alert.alert("Erreur", "Le prix est requis.");
        console.log("❌ Validation étape 5: Prix manquant");
        return;
      }
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert("Erreur", "Veuillez entrer un prix valide.");
        console.log("❌ Validation étape 5: Prix invalide =", price);
        return;
      }
      console.log("✅ Validation étape 5: Prix =", priceNum);
    }
    if (currentStep === 6) {
      if (promoPrice.trim()) {
        const priceNum = parseFloat(price);
        const promoPriceNum = parseFloat(promoPrice);
        if (isNaN(promoPriceNum) || promoPriceNum <= 0) {
          Alert.alert("Erreur", "Veuillez entrer un prix de promotion valide.");
          console.log("❌ Validation étape 6: Prix promo invalide =", promoPrice);
          return;
        }
        if (!isNaN(priceNum) && promoPriceNum >= priceNum) {
          Alert.alert("Erreur", "Le prix de promotion doit être inférieur au prix normal.");
          console.log("❌ Validation étape 6: Promo >= prix normal");
          return;
        }
        console.log("✅ Validation étape 6: Prix promo =", promoPriceNum);
      } else {
        console.log("ℹ️ Validation étape 6: Pas de promo");
      }
    }

    if (currentStep < 7) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      console.log(`➡️ Passage à l'étape ${nextStep}`);
    } else {
      console.log("🎯 Lancement de la création du produit");
      handleCreateProduct();
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleCreateProduct = async () => {
    console.log("🚀 DÉBUT DE CRÉATION DU PRODUIT");
    console.log("📊 Données collectées:");
    console.log("- Nom:", name);
    console.log("- Prix:", price);
    console.log("- Prix promo:", promoPrice);
    console.log("- Description:", description);
    console.log("- Catégorie sélectionnée:", selectedCategory);
  console.log("- Couleurs sélectionnées:", selectedColorIds);
    console.log("- Tailles sélectionnées:", selectedSizes);
    console.log("- Images sélectionnées:", selectedImages.length);

    // Validation
    if (selectedImages.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins une image.");
      console.log("❌ Erreur: Aucune image sélectionnée");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom du produit est requis.");
      console.log("❌ Erreur: Nom manquant");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Erreur", "Le prix est requis.");
      console.log("❌ Erreur: Prix manquant");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un prix valide.");
      console.log("❌ Erreur: Prix invalide");
      return;
    }

    if (promoPrice.trim()) {
      const promoPriceNum = parseFloat(promoPrice);
      if (isNaN(promoPriceNum) || promoPriceNum <= 0) {
        Alert.alert("Erreur", "Veuillez entrer un prix de promotion valide.");
        console.log("❌ Erreur: Prix promo invalide");
        return;
      }
      if (promoPriceNum >= priceNum) {
        Alert.alert("Erreur", "Le prix de promotion doit être inférieur au prix normal.");
        console.log("❌ Erreur: Prix promo supérieur au prix normal");
        return;
      }
    }

    try {
      console.log("📤 UPLOAD DES IMAGES VERS CLOUDINARY");
      // Upload images to Cloudinary
      const uploadedImages: string[] = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const uri = selectedImages[i];
        console.log(`  📸 Upload de l'image ${i + 1}/${selectedImages.length}: ${uri}`);
        const uploadResult = await uploadImageToCloudinary(uri);
        const uploadedUrl = uploadResult.secure_url || uploadResult.url;
        console.log(`  ✅ Image ${i + 1} uploadée: ${uploadedUrl}`);
        uploadedImages.push(uploadedUrl);
      }
      console.log("🎉 Toutes les images uploadées:", uploadedImages);

      const categorieId = selectedCategory || undefined;
      console.log("🏷️ Catégorie sélectionnée ID:", categorieId);

      // couleurId dynamique : id de la première couleur sélectionnée si dispo
      let couleurId: number | undefined = undefined;
      if (selectedColorIds.length > 0 && availableColors.length > 0) {
        couleurId = selectedColorIds[0];
      }
      console.log("🎨 Couleur ID sélectionnée:", couleurId);

      const payload = {
        name: name.trim(),
        price: priceNum,
        promoPrice: promoPrice.trim() ? parseFloat(promoPrice) : undefined,
        images: uploadedImages,
        description: description.trim() || undefined,
  colors: validColors.map(c => c.nom),
        sizes: selectedSizes,
        categorieId,
        ...(couleurId !== undefined ? { couleurId } : {}),
      };

      if (selectedColorIds.length !== validColors.length) {
        console.warn('⚠️ Certaines couleurs sélectionnées ne sont pas valides et ont été ignorées:', selectedColorIds.filter(id => !validColors.some(c => c.id === id)));
      }

      console.log("📝 Payload envoyé à l'API:", JSON.stringify(payload, null, 2));

      console.log("🔗 CRÉATION DU PRODUIT VIA API");
      // Create product via API
      const created = await ProductsApi.create(payload);
      console.log("✅ Produit créé avec succès:", created);

      // Update local context for immediate UI feedback
      addProduct({
        name: created.name,
        price: created.price,
        promoPrice: created.promoPrice,
        images: created.images,
        description: created.description,
        isPromo: !!created.promoPrice,
        colors: created.colors,
        sizes: created.sizes,
        backendId: created.id,
      } as any);
      console.log("📱 Contexte local mis à jour");

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
      console.log("🎊 CRÉATION TERMINÉE AVEC SUCCÈS");
    } catch (e: any) {
      console.error("❌ ERREUR LORS DE LA CRÉATION:", e);
      console.error("📋 Message d'erreur:", e?.message);
      console.error("📋 Stack:", e?.stack);
      Alert.alert("Erreur", e?.message || "Échec de la création du produit");
    }
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
        <View className='flex gap-4 justify-center items-center'>
          <Text className="text-center font-semibold mb-2">Choisissez la catégorie</Text>
          <View className="flex-row flex-wrap justify-center gap-4">
            {availableCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg border ${selectedCategory === category.id ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`}
              >
                <Text className={`font-semibold ${selectedCategory === category.id ? "text-white" : "text-gray-700"}`}>
                  {category.type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {currentStep === 2 && (
        <View>
          <Text className="text-center font-semibold mb-2">Choisissez la ou les couleurs</Text>
          <ColorSelector colors={availableColors} selectedColorIds={selectedColorIds} onChangeSelectedColorIds={setSelectedColorIds} />
        </View>
      )}

      {currentStep === 3 && (
        <View>
          <Text className="text-center font-semibold mb-2">Choisissez la ou les tailles</Text>
          <TaillesSelector selectedSizes={selectedSizes} onChangeSelectedSizes={setSelectedSizes} />
        </View>
      )}

      {currentStep === 4 && (
        <View className='gap-4 flex justify-center items-center'>
          <Text className="text-center font-semibold mb-2">Nom du produit</Text>
          <InputText placeholder="Nom du produit" value={name} onChangeText={setName} />
        </View>
      )}

      {currentStep === 5 && (
        <View className='gap-4 flex justify-center items-center'>
          <Text className="text-center font-semibold mb-2">Prix du produit</Text>
          <InputText
            placeholder="Le prix de l'article"
            value={price}
            onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
            type="number"
            keyboardType="numeric"
          />
        </View>
      )}

      {currentStep === 6 && (
        <View className='gap-4 flex justify-center items-center'>
          <Text className="text-center font-semibold mb-2">Prix de promotion du produit</Text>
          <InputText
            placeholder="Si en promotion"
            value={promoPrice}
            onChangeText={(t) => setPromoPrice(t.replace(/[^0-9]/g, ''))}
            type="number"
            keyboardType="numeric"
          />
        </View>
      )}

      {currentStep === 7 && (
        <View className='gap-4 flex justify-center items-center'>
          <Text className="text-center font-semibold mb-2">Description du produit</Text>
          <InputText placeholder="Description (optionnel)" value={description} onChangeText={setDescription} type='comment' />
        </View>
      )}

      {/* Navigation */}
      <View className="flex-row justify-between items-center px-4 mt-8">
        <Pressable onPress={goBack} disabled={currentStep === 0}>
          <View className={`${currentStep === 0 ? "bg-gray-300" : "bg-gray-500"} p-3 rounded-lg`}>
            <Text className="text-white">Retour</Text>
          </View>
        </Pressable>

        <Text className="text-gray-600">Étape {currentStep + 1} / 8</Text>

        <Pressable onPress={goNext}>
          <View className="bg-blue-500 p-3 rounded-lg">
            <Text className="text-white font-semibold">{currentStep === 7 ? "Créer le produit" : "Suivant"}</Text>
          </View>
        </Pressable>
      </View>
       </ScrollView>
    </Positionnement>
  );
}
