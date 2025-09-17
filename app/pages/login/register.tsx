import InputText from "@/components/InputText";
import PressableIcon from "@/components/PressableIcon";
import ViewButtonLarge from "@/components/ViewButtonLarge";
import Positionnement from "@/components/positionnement";
import { useUser } from "@/components/use-context";
import { signInWithApple, signInWithFacebook } from "@/utils/auth";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";

export default function Login() {
    const [tab, setTab] = useState("home");
    const { updateUser } = useUser();
    WebBrowser.maybeCompleteAuthSession();
    const extra: any = (Constants?.expoConfig as any)?.extra || {};
    const expoClientId = extra.googleExpoClientId || extra.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    const androidClientId = extra.googleAndroidClientId;
    const iosClientId = extra.googleIosClientId;
    const [request, response, promptAsync] = Google.useAuthRequest({
      expoClientId,
      androidClientId,
      iosClientId,
      scopes: ["openid", "profile", "email"],
      responseType: "token",
      usePKCE: false,
    } as any);
    const handleGoogleSignIn = async () => {
      try {
        const res = await promptAsync();
        if (res?.type !== "success" || !res.authentication?.accessToken) {
          throw new Error("Connexion Google annulée ou échouée");
        }
        const accessToken = res.authentication.accessToken;
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user = await userInfoRes.json();
        updateUser({ name: user?.name || "Utilisateur", email: user?.email || "" });
        Alert.alert("Succès", "Connecté avec Google");
      } catch (e: any) {
        Alert.alert("Google", e?.message || "Échec de la connexion");
      }
    };
    const handleFacebookSignIn = async () => {
      try {
        const profile = await signInWithFacebook();
        updateUser({ name: profile.name || "Utilisateur", email: profile.email || "" });
        Alert.alert("Succès", "Connecté avec Facebook");
      } catch (e: any) {
        Alert.alert("Facebook", e?.message || "Échec de la connexion");
      }
    };
    const handleAppleSignIn = async () => {
      try {
        const profile = await signInWithApple();
        updateUser({ name: profile.name || "Utilisateur", email: profile.email || "" });
        Alert.alert("Succès", "Connecté avec Apple");
      } catch (e: any) {
        Alert.alert("Apple", e?.message || "Échec de la connexion");
      }
    };
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
        </View>
    </Positionnement>
  );
}