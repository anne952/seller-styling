import { useSellerProducts } from "@/components/seller-products-context";
import { ProductsApi, ReviewsApi } from "@/utils/auth";
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

  const [backendProduct, setBackendProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données complètes depuis l'API backend
  useEffect(() => {
    const loadBackendProduct = async () => {
      if (!idNumeric) return;
      
      try {
        setLoading(true);
        console.log('🔄 Chargement produit backend pour seller-view:', idNumeric);
        const allProducts = await ProductsApi.list();
        const foundProduct = allProducts.find((p: any) => Number(p.id) === idNumeric);
        
        if (foundProduct) {
          console.log('✅ Produit backend trouvé:', foundProduct);
          setBackendProduct(foundProduct);
        } else {
          console.log('❌ Produit backend non trouvé');
        }
      } catch (error) {
        console.error('❌ Erreur chargement produit backend:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBackendProduct();
  }, [idNumeric]);

  // Charger les reviews pour le produit
  useEffect(() => {
    const loadReviews = async () => {
      if (!idNumeric) return;
      try {
        const productReviews = await ReviewsApi.byProduct(String(idNumeric));
        setReviews(productReviews || []);
      } catch (error) {
        console.error('❌ Erreur chargement reviews:', error);
        setReviews([]);
      }
    };
    loadReviews();
  }, [idNumeric]);

  // Utiliser les données backend si disponibles, sinon fallback sur le contexte local
  const localProduct = idNumeric ? products.find((p) => p?.id === idNumeric) : undefined;
  const produit = backendProduct || localProduct;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Gérer les tailles (backend vs local)
  const sizes = (() => {
    if (backendProduct) {
      // Données backend : utiliser taillesList ou mapper tailles
      return backendProduct.taillesList || 
             (backendProduct.tailles && Array.isArray(backendProduct.tailles) 
               ? backendProduct.tailles.map((t: any) => t.taille) 
               : ["S", "M", "XL"]);
    } else if (localProduct) {
      // Données locales
      return localProduct.sizes && localProduct.sizes.length > 0 ? localProduct.sizes : ["S", "M", "XL"];
    }
    return ["S", "M", "XL"];
  })();
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // Gérer les couleurs (backend vs local)
  const colors = (() => {
    if (backendProduct) {
      // Données backend : mapper couleurs
      const couleursData = backendProduct.couleursList || 
                          (backendProduct.couleurs && Array.isArray(backendProduct.couleurs) 
                            ? backendProduct.couleurs.map((c: any) => c.couleur) 
                            : []);
      return couleursData.map((c: any) => ({ 
        key: c.nom, 
        hex: c.hex,
        className: "" 
      }));
    } else if (localProduct) {
      // Données locales
      return (localProduct.colors || []).map((hex) => ({ key: hex, className: "" }));
    }
    return [];
  })();

  // Gérer les images (backend vs local)
  const images = (() => {
    if (backendProduct) {
      // Données backend : utiliser productImages
      return backendProduct.productImages && Array.isArray(backendProduct.productImages) 
        ? backendProduct.productImages.map((img: any) => img.url)
        : [];
    } else if (localProduct) {
      // Données locales
      return localProduct.images || [];
    }
    return [];
  })();
  const [carouselWidth, setCarouselWidth] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollRef = useRef<ScrollView | null>(null);

  // Logs de debug
  console.log('🔍 Seller-view - Données produit:', {
    id: produit?.id,
    nom: produit?.nom,
    sizes,
    colors,
    images: images.length,
    backendProduct: !!backendProduct,
    localProduct: !!localProduct
  });

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
          onPress: async () => {
            try {
              if (produit.backendId) {
                await ProductsApi.remove(produit.backendId);
              }
            } catch (e: any) {
              Alert.alert("Erreur", e?.message || "Suppression distante échouée");
              return;
            }
            removeProduct(produit.id);
            router.push("/(tabs)/user");
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-500">Chargement du produit...</Text>
        <Text className="text-sm text-gray-400 mt-2">⏳</Text>
      </View>
    );
  }

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
            {images.map((img: any, index: number) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width: carouselWidth || 1, height: 450 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View className="absolute bottom-3 w-full flex flex-row justify-center items-center">
            {images.map((_: any, idx: number) => (
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
              <Text className="text-xl font-bold">{produit.nom || produit.name}</Text>
              {produit.prixPromotion && (
                <Text className="line-through text-gray-500">{Number(produit.prixPromotion).toLocaleString()} F</Text>
              )}
              <Text className="font-semibold text-lg">{Number(produit.prix || produit.price).toLocaleString()} F</Text>
            </View>
            <Pressable onPress={handleDeleteProduct}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </Pressable>
          </View>
          
          <View className="-mt-6">
            {sizes.length > 0 && (
              <View className="taille flex flex-row flex-wrap justify-center p-4 gap-3">
                        {sizes.map((size: string) => {
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
            )}
            
            {colors.length > 0 && (
              <View className="couleur px-6 py-2 flex flex-row flex-wrap gap-3 justify-center">
                          {colors.map((c: any) => {
                  const isSelected = selectedColor === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      accessibilityRole="button"
                      onPress={() => setSelectedColor(c.key)}
                      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? '#3b82f6' : '#e5e7eb' }}
                    >
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.hex || c.key || '#cccccc' }} />
                    </Pressable>
                  );
                })}
              </View>
            )}
            
            <Text className="p-6">
              {produit.description || "Aucune description disponible."}
            </Text>

            <Text className="text-lg font-bold p-4">Commentaires</Text>
            {reviews.length > 0 ? reviews.map((r: any) => (
              <View key={r.id} className="px-6 pb-2">
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="font-semibold">{r.rating} étoile{r.rating !== 1 ? 's' : ''}</Text>
                  <Text className="text-gray-600 mt-1">{r.comment || "Aucun commentaire textuel."}</Text>
                  <Text className="text-sm text-gray-400 mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Date inconnue"}</Text>
                </View>
              </View>
            )) : <Text className="text-gray-500 p-6">Aucun commentaire pour ce produit.</Text>}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
