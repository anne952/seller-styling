import React from "react";
import { Text, View, Image } from "react-native";
import { Link } from "expo-router";
import ViewButtonLarge from "@/components/ViewButtonLarge";


export default function OnboardingUn() {
  return (
    <View className="flex-1 bg-white p-6">
      <View className="h-full flex items-center justify-center">
        <Image
          source={require("../../../assets/images/onboarding2.png")}
          className="w-62 -mt-20 object-contain"
        />
        <View className="mt-40">
        <Text className="text-center font-bold text-md">Toucher plus de client grâce</Text>
        <Text className="text-center font-bold text-md"> à votre boutique en ligne</Text>
        </View>
      </View>
      <View
       className="-mt-24"
       >
        <ViewButtonLarge name="Next" lien="/pages/onbording/onbordingThree" />
      </View>
    </View>
  );
}