import { Text, View } from "react-native";
import ViewButtonLarge from "@/components/ViewButtonLarge";
import Positionnement from "@/components/positionnement";
import InputText from "@/components/InputText";
import PressableIcon from "@/components/PressableIcon";
import { useState } from "react";
import { Link } from "expo-router";

export default function Login() {
    const [tab, setTab] = useState("home");
  return (
    <Positionnement>
        <View className="p-4">
        <Text className="text-right font-bold text-md">Ignorer</Text>

        <View className="mt-28 mb-10 items-center">
            <Text className="text-2xl font-bold text-center ">S'inscrire</Text>
            <Text className="text-md text-center">Veuillez entrer vos identifiants</Text>
        </View>
        <View className="gap-6">
            <InputText 
            placeholder="Nom" 
            name="person"
            />
            <InputText 
            placeholder="email" 
            name="mail-outline"
            />
            <InputText 
            placeholder="Mot de passe" 
            name="key"
            />
        </View>
        <View className="mt-4 flex-row justify-between">
            <Text>Vous avez déjà un compte ?</Text>
            <Link href='/pages/login/login' className="text-blue-500">Se connecter</Link>
        </View>
        <View className="mt-4 ">
            <ViewButtonLarge name="Continuer" lien="/(tabs)/home" />
        </View>

        <View className="gap-6 flex flex-row ml-20 mt-32 w-60">
            <View className=" bg-white w-14 shadow-slate-400 shadow-md h-14 p-2 rounded-lg  ">
            <PressableIcon 
            name="logo-google" 
            size={24} 
            active={tab === "home"}
            onPress={() => setTab("home")}
             activeColor="#2563eb"
            />
            </View>
            <View className=" bg-white w-14 shadow-slate-400 shadow-md h-14 p-2 rounded-lg  ">
            <PressableIcon 
            name="logo-facebook" 
            size={24} 
                active={tab === "home"}
                onPress={() => setTab("home")}
                activeColor="#2563eb"
            />
            </View>

            <View className=" bg-white w-14 shadow-slate-400 shadow-md h-14 p-2 rounded-lg  ">
            <PressableIcon 
            name="logo-apple" 
            size={24} 
            active={tab === "home"}
             onPress={() => setTab("apple")}
             activeColor="#2563eb"
            />
            </View>

        </View>

        </View>
    </Positionnement>
  );
}