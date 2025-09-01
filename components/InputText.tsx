import { Text, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";


interface InputTextProps {
  placeholder: string;
  name?: keyof typeof Ionicons.glyphMap;
}


export default function InputText({ placeholder , name }: InputTextProps) {
  return (
  <View className="relative w-[23rem]">
      <TextInput
        placeholder={placeholder}
        className="bg-gray-300 h-14 rounded-lg p-4 pr-12 text-gray-700"
      />
         {name && (
      <View className="absolute right-3 top-0 bottom-0 items-center justify-center">
       <Ionicons name={name} size={24} color="black" />
      </View>
    )}
    </View>
  );
}
