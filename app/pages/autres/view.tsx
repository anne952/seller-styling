import { useCart } from "@/components/cart-context";
import { useLikes } from "@/components/likes-context";
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
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNumeric = idParam ? Number(idParam) : undefined;

  const produitsArray = (List as unknown) as any[];
  const produit = idNumeric ? produitsArray.find((p) => p?.id === idNumeric) : undefined;

  const produitName = produit?.name ?? (Array.isArray(params.name) ? params.name[0] : (params.name as string)) ?? "";
  const produitPrix = (produit?.Prix ?? Number(Array.isArray(params.prix) ? params.prix[0] : (params.prix as string))) ?? 0;
  const prixPromoParam = Array.isArray(params.prixPromo) ? params.prixPromo[0] : (params.prixPromo as string | undefined);
  const produitPrixPromo = produit?.prixPromo ?? (prixPromoParam !== undefined ? Number(prixPromoParam) : undefined);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const sizes = ["S", "M", "XL"];
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
        <View className="flex-1 bg-white  p-6">
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
                      source={img}
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
            <View className=" rounded-3xl  bg-white ">
                <ScrollView
                horizontal={ false}
                className="h-96"
                >
                  <Link href="/">
                    <Text className="text-lg font-semibold p-8 text-blue-500">Shooda fashion</Text>
                  </Link>
                <View className=" p-4 flex flex-row justify-between m-4">
                    <View>
                        <Text className=" text-xl font-bold ">{produitName} </Text>
                        {typeof produitPrixPromo !== "undefined" && (
                          <Text className="line-through">{produitPrixPromo} F</Text>
                        )}
                        <Text className=" font-semibold">{produitPrix} F</Text>
                    </View>
                  <Pressable onPress={() => produit?.id && toggleLike(produit.id)}>
                    <Ionicons name={produit?.id && isLiked(produit.id) ? "heart" : "heart-outline"} size={20} color={produit?.id && isLiked(produit.id) ? "#ef4444" : "#3686F7"} className="fixed right-2 border-blue-500 border rounded-full w-10 h-10 text-center py-2" />
                  </Pressable>
                </View>
                <View className="-mt-6">
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
                              <Text className={`  text-2xl text-center -mt-1 ${textClass}`}>{size}</Text>
                            </Pressable>
                          );
                        })}
                        </View>
                        <View className="couleur p-2 flex flex-row gap-10 justify-center">
                          {colors.map((c) => {
                            const isSelected = selectedColor === c.key;
                            return (
                              <Pressable
                                key={c.key}
                                accessibilityRole="button"
                                onPress={() => setSelectedColor(c.key)}
                                className={`${c.className} w-10 h-10 rounded-full ${isSelected ? "border-2 border-blue-500" : ""}`}
                              />
                            );
                          })}
                        </View>
                    <Text className="p-6">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magnam nam cumque non, odit magni consequatur, sed expedita enim esse quo minus illum, veniam vitae aspernatur rerum autem beatae blanditiis.</Text>
                    <View className="h-20 "></View>
                </View>
                <View className="h-32"></View>
                </ScrollView>
                <View className="bg-white h-32 w-full -mt-52"></View>
                <View style={{backgroundColor: '#FFFFFF', height: 100}}>
                  
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
                    className="bg-blue-500 p-4 rounded-xl w-full -mt-32"
                  >
                    <Text className="text-xl text-white font-bold text-center">Ajouter au panier</Text>
                  </Pressable> 
                                
                </View>

            </View>
           
        </View>
    );
}