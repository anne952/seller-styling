import { Text, View } from "react-native";
import ViewButtonLarge from "@/components/ViewButtonLarge";
import Positionnement from "@/components/positionnement";
import InputText from "@/components/InputText";
import { useState } from "react";
import IconNext from "@/components/IconNext";


export default function Login() {
    const [tab, setTab] = useState("home");
  return (
    <Positionnement>
        <View className="p-4">
        <IconNext
         lien="/pages/login/login"
        />

        <View className="mt-28 mb-10 items-center">
            <Text className="text-2xl font-bold text-center ">Mot de passe oublié </Text>
        </View>
        <View className="gap-6">
            <InputText 
            placeholder="email" 
            name="mail-outline"
            />
            <InputText 
            placeholder="nouveau mot de passe" 
            name="key"
            />
            <InputText 
            placeholder="confirmer du mot de passe" 
            name="key"
            />
        </View>
        <View className="mt-4 ">
            <ViewButtonLarge name="Continuer" lien="/(tabs)/home" />
        </View>



        </View>
    </Positionnement>
  );
}