import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

interface SellerProductCardProps {
  images: string[];
  name: string;
  prixPromo?: number;
  prix: number;
  onPress?: () => void;
  onDelete?: () => void;
  id?: number;
}

export default function SellerProductCard({ 
  prix, 
  name, 
  prixPromo, 
  images, 
  onPress, 
  onDelete, 
  id 
}: SellerProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <View className="flex flex-col m-2 bg-white rounded-lg w-44 justify-center items-center">
      <Pressable onPress={onPress} className="w-full items-center">
        {images && images.length > 0 && (
          <View className="relative">
            <Image 
              source={{ uri: images[currentImageIndex] }} 
              style={{ width: 150, height: 200, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} 
              resizeMode="cover" 
            />
            
            {/* Dots pour navigation entre images */}
            {images.length > 1 && (
              <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1">
                {images.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        
        <View className="flex flex-row gap-14 mt-2 w-full px-1">
          <View className="w-20 leading-3 ml-1">
            <Text className="font-bold text-lg">{name}</Text>
            {prixPromo && prixPromo > 0 && (
              <Text className="line-through text-gray-400">{prixPromo}F</Text>
            )}
          </View>
          <Pressable onPress={onDelete}>
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color="#ef4444" 
              className="right-3 border-red-500 border rounded-full w-10 h-10 text-center py-2"
              style={{ backgroundColor: "white" }}
            />
          </Pressable>
        </View>
      </Pressable>
      
      <View className="flex flex-row mt-2 p-2 px-3 gap-20 w-full">
        <Text className="font-semibold text-md w-[70%] leading-3">{prix}F</Text>
        <Pressable onPress={onPress}>
          <Ionicons 
            name="eye-outline" 
            size={20} 
            color="#3686F7" 
            className="right-16 border-blue-500 border rounded-full w-10 h-10 text-center py-2"
            style={{ backgroundColor: "white" }}
          />
        </Pressable>
      </View>
    </View>
  );
}
