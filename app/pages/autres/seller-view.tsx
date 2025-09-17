import { useSellerProducts } from "@/components/seller-products-context";
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

export default function SellerView() {
  const params = useLocalSearchParams();
  const { products, removeProduct } = useSellerProducts();
  const router = useRouter();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNumeric = idParam ? Number(idParam) : undefined;

  const produit = idNumeric ? products.find((p) => p?.id === idNumeric) : undefined;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const sizes = produit?.sizes && produit.sizes.length > 0 ? produit.sizes : ["S", "M", "XL"];
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const colors = (produit?.colors || []).map((hex) => ({ key: hex, className: "" }));

  const images = produit?.images || [];
  const [carouselWidth, setCarouselWidth] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!carouselWidth || images.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollRef.current?.scrollTo({ x: nextIndex * carouselWidth, animated: true });
      setCurrentIndex(nextIndex);
    }, 2200);
    return () => clearInterval(interval);
  }, [carouselWidth, images.length, currentIndex]);

  const handleMomentumEnd = (event: any) => {
    if (!carouselWidth) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / carouselWidth);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  const handleDeleteProduct = () => {
    if (!produit) return;
    
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
          onPress: () => {
            removeProduct(produit.id);
            router.push("/(tabs)/user");
          }
        }
      ]
    );
  };

  if (!produit) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-500">Produit non trouvé</Text>
        <Link href="/(tabs)/home">
          <Pressable className="bg-blue-500 px-6 py-3 rounded-lg mt-4">
            <Text className="text-white font-semibold">Retour à l'accueil</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Link href="/(tabs)/home" className="bg-blue-500 w-10 h-10 m-5 p-1 rounded-md mt-10">
        <Ionicons name="chevron-back-outline" size={24} color="white"/>
      </Link>
      
      {images.length > 0 && (
        <View
          onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
          style={{ width: "100%", height: 450 }}
        >
          <ScrollView
            ref={scrollRef}
            horizontal={true}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            style={{ width: "100%", height: "100%" }}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width: carouselWidth || 1, height: 450 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View className="absolute bottom-3 w-full flex flex-row justify-center items-center">
            {images.map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: idx === currentIndex ? "#3686F7" : "#d1d5db",
                }}
              />
            ))}
          </View>
        </View>
      )}
      
      <View className="rounded-3xl bg-white">
        <ScrollView
          horizontal={false}
          className="h-96"
        >
          <Link href="/">
            <Text className="text-lg font-semibold p-4 mt-6 text-blue-500">Votre produit</Text>
          </Link>
          
          <View className="p-4 flex flex-row justify-between m-4">
            <View>
              <Text className="text-xl font-bold">{produit.name}</Text>
              {produit.promoPrice && (
                <Text className="line-through">{produit.promoPrice} F</Text>
              )}
              <Text className="font-semibold">{produit.price} F</Text>
            </View>
            <Pressable onPress={handleDeleteProduct}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </Pressable>
          </View>
          
          <View className="-mt-6">
            {sizes.length > 0 && (
              <View className="taille flex flex-row justify-center p-4 gap-10">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const containerClass = isSelected ? "border border-blue-500 bg-blue-500" : "border border-blue-500";
                  const textClass = isSelected ? "text-white" : "text-black";
                  return (
                    <Pressable
                      key={size}
                      accessibilityRole="button"
                      onPress={() => setSelectedSize(size)}
                      className={`${containerClass} p-2 w-10 h-10 rounded-lg`}
                    >
                      <Text className={`text-2xl text-center -mt-1 ${textClass}`}>{size}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            
            {colors.length > 0 && (
              <View className="couleur p-2 flex flex-row gap-4 justify-center">
                {colors.map((c) => {
                  const isSelected = selectedColor === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      accessibilityRole="button"
                      onPress={() => setSelectedColor(c.key)}
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.key as string, borderWidth: isSelected ? 2 : 0, borderColor: isSelected ? '#3b82f6' : 'transparent' }}
                    />
                  );
                })}
              </View>
            )}
            
            <Text className="p-6">
              {produit.description || "Aucune description disponible."}
            </Text>
            <View className="h-20"></View>
          </View>
          
          <View className="h-32"></View>
        </ScrollView>
        
        <View className="bg-white w-full h-32">
          <View className="flex-row gap-3 p-4">
            <Pressable
              onPress={() => router.push({
                pathname: "/pages/autres/edit-product",
                params: { id: String(produit.id) }
              })}
              className="bg-green-500 p-4 rounded-xl flex-1"
            >
              <Text className="text-xl text-white font-bold text-center">Modifier</Text>
            </Pressable>
            
            <Pressable
              onPress={handleDeleteProduct}
              className="bg-red-500 p-4 rounded-xl flex-1"
            >
              <Text className="text-xl text-white font-bold text-center">Supprimer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
