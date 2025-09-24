import CartProduit from "@/components/cartProduit";
import Positionnement from "@/components/positionnement";
import { useSellerProducts } from "@/components/seller-products-context";
import { ProductsApi } from "@/utils/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";



export default function HomeScreen() {
  const router = useRouter();
  const { products: sellerProducts } = useSellerProducts();
  const [catalog, setCatalog] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const apiProducts = await ProductsApi.list();
        const mapped = apiProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          Prix: p.price,
          prixPromo: p.promoPrice,
          image: { uri: (p.images?.[0] || null) },
          isSellerProduct: false,
        }));
        setCatalog(mapped);
      } catch {}
    })();
  }, []);

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


      <Text className=" mt-1p-2 underline  rounded-lg m-5  font-bold">Pour tous</Text>
   
      <View className="">
        
        <FlatList 
        data={allProducts}
        scrollEnabled={false}
        contentContainerStyle={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          marginHorizontal: -8, 
          marginLeft: 8
        }}
         keyExtractor={(item)=>
          item.id.toString()}
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
 
