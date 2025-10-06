import CartProduit from "@/components/cartProduit";
import Positionnement from "@/components/positionnement";
import { useSellerProducts } from "@/components/seller-products-context";
import { useUser } from "@/components/use-context";
import { ProductsApi } from "@/utils/auth";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";



export default function HomeScreen() {
  const router = useRouter();
  const { products: sellerProducts, replaceProducts } = useSellerProducts();
  const { user } = useUser();
  const [catalog, setCatalog] = useState<any[]>([]);

  const refreshProducts = useCallback(async () => {
    try {
      const apiProducts = await ProductsApi.list();
      const mapped = apiProducts
        .filter((p: any) => p.vendeurId !== user?.id) // Exclude own products
        .map((p: any) => {
          console.log("Produit backend:", p); // Log pour debug
          return {
            id: p.id,
            name: p.nom,           // Backend envoie `nom`
            Prix: Number(p.prix),          // Backend envoie `prix` comme Decimal
            prixPromo: p.prixPromotion ? Number(p.prixPromotion) : undefined,
            image: { uri: (p.productImages?.[0]?.url || null) }, // Images via productImages
            isSellerProduct: false,
          };
        });
      setCatalog(mapped);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Combiner les produits du vendeur (en premier) avec le catalogue backend
  const allProducts = [
    ...sellerProducts.map(product => ({
      id: product.id,
      name: product.name,
      Prix: product.price,
      prixPromo: product.promoPrice,
      image: { uri: product.images[0] },
      isSellerProduct: true,
    })),
    ...catalog
  ];

  return (
    <Positionnement>
       <View className="flex-row justify-center items-center -mt-32">
        <Image source={require("@/assets/fonts/mini logo.png")} style={{width: 80 ,marginTop: 90, height: 40, resizeMode: "contain"}} />
      </View>
       <ScrollView>


      <Text className=" mt-10 underline  rounded-lg m-5  font-bold">Pour tous</Text>
   
      <View className="">
        
        <FlatList 
        data={allProducts}
        scrollEnabled={false}
        numColumns={2}
        contentContainerStyle={{
          marginHorizontal: -8,
          marginLeft: 8
        }}
         keyExtractor={(item, index)=>
          item.id.toString() + '_' + index.toString()}
          renderItem={({item}) => (
          <CartProduit
          key={item.id}
          id={item.id}
          name={item.name}
          prixPromo={item.prixPromo?? 0}
          image={item.image}
          prix={item.Prix}
          onPress={() => router.push({ 
            pathname: item.isSellerProduct ? "/pages/autres/seller-view" : "/pages/autres/view", 
            params: { id: String(item.id) }
          })}
          onOpen={() => router.push({ 
            pathname: item.isSellerProduct ? "/pages/autres/seller-view" : "/pages/autres/view", 
            params: { id: String(item.id) }
          })}
          />
        )}        
        />
  
      </View>
      </ScrollView>
  
       <View className="p-10 h-10 "></View>
    
    </Positionnement>
  );
}
