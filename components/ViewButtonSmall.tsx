import { Text, View } from "react-native";
import { Link, LinkProps } from "expo-router";

interface ButtonType {
  name?: string;
  lien?: LinkProps["href"]; 
}

export default function ViewButtonLarge({ name, lien }: ButtonType) {
  return (
    lien && (
      <Link href={lien} className="p-4">
        <View className="bg-blue-500 p-4 w-[15rem] h-15 rounded-lg">
          <Text className="text-center text-white font-semibold text-md">{name}</Text>
        </View>
      </Link>
    )
  );
}
