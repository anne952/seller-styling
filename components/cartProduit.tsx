import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { useLikes } from "./likes-context";


interface CartProduitProps{
    image: any,
    name: string;
    prixPromo: number,
    prix: number,
    onPress?: ()=> void,
    onOpen?: ()=> void,
    id?: number
}

export default function CartProduit({prix,name,prixPromo, image, onPress, onOpen, id}: CartProduitProps){
    const { isLiked, toggleLike } = useLikes();
    const liked = id ? isLiked(id) : false;
    return(
                <View className="flex flex-col m-2 bg-white rounded-lg w-44 justify-center items-center ">
                  <Pressable onPress={onOpen} className="w-full items-center">
                    {image &&
                      <Image 
                        source={image} 
                        style={{width: 150 , height: 200 , borderTopLeftRadius:5, borderTopRightRadius:5}} 
                        resizeMode="cover" />
                    }
                    <View className="flex flex-row gap-14 mt-2 w-full px-1">
                      <View className="w-20 leading-3 ml-1">
                        <Text className="font-bold text-lg">{name}</Text>
                        <Text className="line-through text-gray-400">{prixPromo}F </Text>
                      </View>
                      <Pressable onPress={() => id && toggleLike(id)}>
                        <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#ef4444" : "#3686F7"}  
                        className=" right-3  border-blue-500 border rounded-full w-10 h-10 text-center py-2"
                        style={{backgroundColor:"white"}}
                         />
                      </Pressable>
                    </View>
                  </Pressable>
                  <View className="flex flex-row mt-2 p-2 px-3 gap-20 w-full">
                    <Text className="font-semibold  text-md w-[70%] leading-3 ">{prix}F</Text>
                    <Pressable>
                      {({pressed})=>(
                        <Ionicons name="add" size={20} 
                          color={pressed ? 'red' : '#3686F7'} 
                          onPress={onPress}
                          className=" right-16 border-blue-500 border rounded-full w-10 h-10 text-center py-2" />
                      )}
                    </Pressable>
                  </View>  
                </View>
    )
}