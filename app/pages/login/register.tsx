import InputText from "@/components/InputText";
import Positionnement from "@/components/positionnement";
import { useUser } from "@/components/use-context";
import { AuthApi, UsersApi } from "@/utils/auth";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Register() {
    const router = useRouter();
    const { updateUser } = useUser();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localisation, setLocalisation] = useState("");
    const [telephone, setTelephone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const TYPE_COUTURE_OPTIONS = ["HOMME", "FEMME", "ENFANT", "MIXTE"] as const;
    const SPECIALITE_OPTIONS = ["HauteCouture", "PretAPorter", "SurMesure", "Retouche"] as const;
    const [selectedTypeCouture, setSelectedTypeCouture] = useState<string[]>([]);
    const [selectedSpecialite, setSelectedSpecialite] = useState<string[]>([]);

    const afterRegister = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try { await UsersApi.postExpoPushToken({ expoPushToken: token }); } catch {}
      }
    };

    const handleSubmit = async () => {
      if (!name || !email || !password || !localisation || !telephone) {
        Alert.alert("Inscription", "Veuillez renseigner tous les champs obligatoires.");
        return;
      }
      if (selectedTypeCouture.length === 0 || selectedSpecialite.length === 0) {
        Alert.alert("Inscription", "Sélectionnez au moins un type de couture et une spécialité.");
        return;
      }
      setSubmitting(true);
      try {
        const res = await AuthApi.register({ 
          name, 
          email, 
          password, 
          role: "vendeur",
          localisation,
          telephone,
          typeCouture: selectedTypeCouture,
          specialite: selectedSpecialite
        });
        updateUser({ name: res.user.name, email: res.user.email });
        await afterRegister();
        router.replace("/(tabs)/home");
      } catch (e: any) {
        Alert.alert("Inscription", e?.message || "Échec de l'inscription");
      } finally {
        setSubmitting(false);
      }
    };
  return (
    <Positionnement>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <Text className="text-right font-bold text-md">Ignorer</Text>

        <View className="mt-28 mb-10 items-center">
            <Text className="text-2xl font-bold text-center ">S'inscrire</Text>
            <Text className="text-md text-center">Veuillez entrer vos identifiants</Text>
        </View>
        <View className="gap-6 ml-4">
            <InputText 
              placeholder="Nom" 
              name="person"
              value={name}
              onChangeText={setName}
            />
            <InputText 
              placeholder="Email" 
              name="mail-outline"
              type="email"
              value={email}
              onChangeText={setEmail}
            />
            <InputText 
              placeholder="Mot de passe (min 6 caractères)" 
              name="key"
              type="password"
              value={password}
              onChangeText={setPassword}
            />
            <InputText 
              placeholder="Localisation" 
              name="location"
              value={localisation}
              onChangeText={setLocalisation}
            />
            <InputText 
              placeholder="Téléphone (ex: +228XXXXXXXX)" 
              name="call"
              type="number"
              value={telephone}
              onChangeText={setTelephone}
            />
            <View className="mt-2">
              <Text className="font-semibold mb-2">Types de couture</Text>
              <View className="flex-row flex-wrap gap-2">
                {TYPE_COUTURE_OPTIONS.map((opt) => {
                  const active = selectedTypeCouture.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setSelectedTypeCouture((prev) =>
                          prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                        );
                      }}
                      className={`px-3 py-2 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-200'}`}
                    >
                      <Text className={`${active ? 'text-white' : 'text-gray-800'}`}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View className="mt-2">
              <Text className="font-semibold mb-2">Spécialités</Text>
              <View className="flex-row flex-wrap gap-2">
                {SPECIALITE_OPTIONS.map((opt) => {
                  const active = selectedSpecialite.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setSelectedSpecialite((prev) =>
                          prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                        );
                      }}
                      className={`px-3 py-2 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-200'}`}
                    >
                      <Text className={`${active ? 'text-white' : 'text-gray-800'}`}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
        </View>
        <View className="mt-14 ml-4">
            <TouchableOpacity disabled={submitting} onPress={handleSubmit} className="">
              <View className="bg-blue-500 p-4 w-[23rem] h-15 rounded-lg">
                <Text className="text-center text-white font-semibold text-xl">{submitting ? "Inscription..." : "Continuer"}</Text>
              </View>
            </TouchableOpacity>
        </View>
        <View className="mt-14 flex-row justify-between ml-4 m-2">
            <Text>Vous avez déjà un compte ?</Text>
            <Link href='/pages/login/login' className="text-blue-500">Se connecter</Link>
        </View>        
        </ScrollView>
    </Positionnement>
  );
}