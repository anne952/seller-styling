import React from "react";
import { Text, View, Image } from "react-native";
import ViewButtonLarge from "@/components/ViewButtonLarge";


export default function OnboardingUn() {
  return (
    <View className="flex-1 bg-white p-6">
      <View className="h-full flex items-center justify-center">
        <Image
          source={require("../../../assets/images/onbording3.png")}
          className="w-62 -mt-20 object-contain"
        />
        <View className="mt-40">
        <Text className="text-center font-bold text-md">Cliquez sur ajouter un produit</Text>
        <Text className="text-center font-bold text-md"> et remplissez les informations</Text>
        <Text className="text-center font-bold text-md"> du produit que vous souhaitez vendre</Text>
        </View>
      </View>
      <View
       className="-mt-24"
       >
        <ViewButtonLarge name="Next" lien="/pages/login/login" />
      </View>
    </View>
  );
}