import InputText from "@/components/InputText";
import Positionnement from "@/components/positionnement";
import { useUser } from "@/components/use-context";
import { AuthApi, UsersApi } from "@/utils/auth";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { Link, useRouter } from "expo-router";
 
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
 

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { updateUser } = useUser();
    

    const afterLogin = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try { await UsersApi.postExpoPushToken({ expoPushToken: token }); } catch {}
      }
    };

    const handleSubmit = async () => {
      if (!email || !password) {
        Alert.alert("Connexion", "Veuillez renseigner l'email et le mot de passe.");
        return;
      }
      setSubmitting(true);
      try {
        const res = await AuthApi.login({ email, password });
        // Mettre à jour tout le profil depuis la réponse serveur
        updateUser({
          id: res.user.id, // Ajouter l'id et le role
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          types: res.user.types,
          speciality: res.user.speciality,
          contact: res.user.contact,
          location: res.user.location,
          comment: res.user.comment,
          avatarUrl: res.user.avatarUrl,
        });
        await afterLogin();
        router.replace("/(tabs)/home");
      } catch (e: any) {
        Alert.alert("Connexion", e?.message || "Échec de la connexion");
      } finally {
        setSubmitting(false);
      }
    };
  return (
    <Positionnement>
        <View className="p-4">
        <Text className="text-right font-bold text-md">Ignorer</Text>

        <View className="mt-32 mb-10 items-center">
            <Text className="text-2xl font-bold text-center ">Connexion</Text>
            <Text className="text-md text-center">Bienvenue !!</Text>
        </View>
        <View className="gap-6">
            <InputText 
              placeholder="Email"
              name="mail"
              type="email"
              value={email}
              onChangeText={setEmail}
            />
            <InputText 
              placeholder="Mot de passe"
              name="key"
              type="password"
              value={password}
              onChangeText={setPassword}
            />
        </View>
        <View className="mt-4 flex-row justify-between">
            <Link href='/pages/login/forgetPassword'>Mot de passe oublié ?</Link>
            <Link href='/pages/login/register' className="text-blue-500">S'inscrire</Link>
        </View>
        <View className="mt-4">
            <TouchableOpacity disabled={submitting} onPress={handleSubmit} className="">
              <View className="bg-blue-500 p-4 w-[23rem] h-15 rounded-lg opacity-100">
                <Text className="text-center text-white font-semibold text-xl">{submitting ? "Connexion..." : "Continuer"}</Text>
              </View>
            </TouchableOpacity>
        </View>
        </View>
    </Positionnement>
  );
}
