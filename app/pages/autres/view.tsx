import { useCart } from "@/components/cart-context";
import { useLikes } from "@/components/likes-context";
import Positionnement from "@/components/positionnement";
import { useSellerProducts } from "@/components/seller-products-context";
import List from "@/scripts/listProduit";
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";



export default function Vu(){
  const params = useLocalSearchParams();
  const { isLiked, toggleLike } = useLikes();
  const { addToCart } = useCart();
  const router = useRouter();
  const { products: sellerProducts } = useSellerProducts();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNumeric = idParam ? Number(idParam) : undefined;

  // If this id corresponds to a seller-created product, redirect to the seller view to respect dynamic sizes/colors
  useEffect(() => {
    if (!idNumeric) return;
    const isSellerProduct = sellerProducts.some(p => p.id === idNumeric);
    if (isSellerProduct) {
      router.replace({ pathname: "/pages/autres/seller-view", params: { id: String(idNumeric) } });
    }
  }, [idNumeric, sellerProducts, router]);

  const produitsArray = (List as unknown) as any[];
  const produit = idNumeric ? produitsArray.find((p) => p?.id === idNumeric) : undefined;

  const produitName = produit?.name ?? (Array.isArray(params.name) ? params.name[0] : (params.name as string)) ?? "";
  const produitPrix = (produit?.Prix ?? Number(Array.isArray(params.prix) ? params.prix[0] : (params.prix as string))) ?? 0;
  const prixPromoParam = Array.isArray(params.prixPromo) ? params.prixPromo[0] : (params.prixPromo as string | undefined);
  const produitPrixPromo = produit?.prixPromo ?? (prixPromoParam !== undefined ? Number(prixPromoParam) : undefined);

  const discountPercent = typeof produitPrixPromo !== "undefined" && produitPrixPromo > 0
    ? Math.max(0, Math.round(((produitPrixPromo - produitPrix) / produitPrix) * -100))
    : undefined;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const sizes = ["S", "M", "XL"]; // Static sizes for catalog demo products
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const colors = [
    { key: "black", className: "bg-black" },
    { key: "slate-500", className: "bg-slate-500" },
    { key: "blue-400", className: "bg-blue-400" },
 
  ];

  const images: any[] = (produit?.images && Array.isArray(produit.images) && produit.images.length > 0)
    ? produit.images.slice(0, 5)
    : (produit?.image ? [produit.image] : []);

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

  return(
    <Positionnement>
        <View className="flex-1   p-6">
            <View className="absolute left-4 top-12 z-10 -mt-20">
              <Link href="/(tabs)/home" className="bg-black/60 w-10 h-10 p-2  rounded-full items-center justify-center">
                <Ionicons name="chevron-back-outline" size={22} color="white"/>
              </Link>
            </View>
            {images.length > 0 && (
              <View
                onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
                style={{ width: "100%", height: 420 }}
                className="rounded-2xl overflow-hidden bg-gray-100"
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
                      source={img}
                      style={{ width: carouselWidth || 1, height: 420 }}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                {!!discountPercent && (
                  <View className="absolute left-3 top-3 bg-red-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">-{discountPercent}%</Text>
                  </View>
                )}
                <View className="absolute bottom-3 w-full flex flex-row justify-center items-center">
                  {images.map((_, idx) => (
                    <View
                      key={`dot-${idx}`}
                      style={{
                        width: idx === currentIndex ? 16 : 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 4,
                        backgroundColor: idx === currentIndex ? "#111827" : "#9ca3af",
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
            <View className=" rounded-3xl  ici flex-1">
                <ScrollView
                horizontal={ false}
                className="flex-1"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 24 }}
                >
                  <View className="px-1 pt-5">
                    <Text className="text-lg font-semibold text-gray-500">Shooda fashion</Text>
                  </View>
                <View className=" px-1 pt-2 flex flex-row justify-between items-start">
                    <View className="flex-1 pr-4">
                        <Text className=" text-2xl font-extrabold ">{produitName} </Text>
                        {typeof produitPrixPromo !== "undefined" && (
                          <Text className="line-through text-gray-400 mt-1">{produitPrixPromo} F</Text>
                        )}
                        <View className="flex-row items-center mt-1 gap-2">
                          <Text className=" text-2xl font-black text-blue-600">{produitPrix} F</Text>
                          {!!discountPercent && (
                            <View className="bg-red-100 px-2 py-0.5 rounded-full">
                              <Text className="text-red-600 text-xs font-bold">-{discountPercent}%</Text>
                            </View>
                          )}
                        </View>
                    </View>
                  <Pressable onPress={() => produit?.id && toggleLike(produit.id)} className="mt-1">
                    <View className="w-10 h-10 rounded-full items-center justify-center border border-gray-300">
                      <Ionicons name={produit?.id && isLiked(produit.id) ? "heart" : "heart-outline"} size={20} color={produit?.id && isLiked(produit.id) ? "#ef4444" : "#111827"} />
                    </View>
                  </Pressable>
                </View>
                <View className="mt-4">
                     <View className="taille flex flex-row justify-center p-4 gap-3">
                        {sizes.map((size) => {
                          const isSelected = selectedSize === size;
                          const containerClass = isSelected ? "bg-blue-600 border border-blue-600" : "bg-white border border-gray-300";
                          const textClass = isSelected ? "text-white" : "text-gray-800";
                          return (
                            <Pressable
                              key={size}
                              accessibilityRole="button"
                              onPress={() => setSelectedSize(size)}
                              className={`${containerClass} px-4 h-10 rounded-full items-center justify-center`}
                            >
                              <Text className={` text-sm font-semibold ${textClass}`}>{size}</Text>
                            </Pressable>
                          );
                        })}
                        </View>
                        <View className="couleur px-6 py-2 flex flex-row gap-4 justify-center">
                          {colors.map((c) => {
                            const isSelected = selectedColor === c.key;
                            return (
                              <Pressable
                                key={c.key}
                                accessibilityRole="button"
                                onPress={() => setSelectedColor(c.key)}
                                className={`w-10 h-10 rounded-full items-center justify-center ${isSelected ? "border-2 border-blue-600" : "border border-gray-300"}`}
                              >
                                <View className={`w-8 h-8 rounded-full ${c.className}`} />
                              </Pressable>
                            );
                          })}
                        </View>
                    <View className="px-4 mt-2">
                      <Text className="text-base leading-6 text-gray-700">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magnam nam cumque non, odit magni consequatur, sed expedita enim esse quo minus illum, veniam vitae aspernatur rerum autem beatae blanditiis.</Text>
                    </View>
                    <View className="h-44 "></View>
                </View>
                <View className="bg-white"></View>
                <View style={{backgroundColor: '#FFFFFF'}} className=" border-t border-gray-200 pt-3 pb-6 px-1 -mt-32">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-gray-500">Total</Text>
                      <Text className="text-xl font-extrabold text-blue-600">{produitPrix} F</Text>
                    </View>
                  
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      if (!selectedSize) {
                        Alert.alert("Taille requise", "Veuillez sélectionner une taille avant d'ajouter au panier.");
                        return;
                      }
                      if (!selectedColor) {
                        Alert.alert("Couleur requise", "Veuillez sélectionner une couleur avant d'ajouter au panier.");
                        return;
                      }
                      if (!produit || !idNumeric) return;
                      addToCart({
                        id: idNumeric,
                        name: produitName,
                        price: produitPrix,
                        image: produit.image,
                        size: selectedSize,
                        color: selectedColor,
                      });
                      router.push("/pages/autres/cart");
                    }}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                  >
                    <Text className="text-base text-white font-bold">Ajouter au panier</Text>
                  </Pressable>
                  </View>
                </View>  
                <View className="h-4 "></View>
                </ScrollView>
 
            </View>
           
        </View>
    </Positionnement>
    );
}