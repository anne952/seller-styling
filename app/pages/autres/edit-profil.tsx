import { useUser } from "@/components/use-context";
import { AuthApi } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function edit(){
 const { user, updateUser } = useUser();
 const [name, setName] = useState<string>(user.name);
 const [email, setEmail] = useState<string>(user.email);
 const [types, setTypes] = useState<string>(user.types || "");
 const [speciality, setSpeciality] = useState<string>(user.speciality || "");
 const [contact, setContact] = useState<string>(user.contact || "");
 const [location, setLocation] = useState<string>(user.location || "");
 const [comment, setComment] = useState<string>(user.comment || "");
 const [submitting, setSubmitting] = useState(false);
 const router = useRouter();
 return(
    <View className="mt-20 p-6">
         <View className="flex flex-row gap-20">
            <Link href="/(tabs)/user" className="bg-blue-500 w-10 p-2 rounded-lg">
            <Ionicons name="chevron-back-outline" size={24} color="black"/>
            </Link>
            <Text className="text-xl font-bold mt-2">Modifier Profil</Text>            
         </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mt-20 gap-10">
            <TextInput placeholder="Nom"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            style={{ width: 300, height: 50, borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10 }}
            keyboardType="default"
            />
            <TextInput placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ width: 300, height: 50, borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10 }}
            keyboardType="email-address"
            />
            <TextInput 
            placeholder="Type couture (Homme, Femme, Enfant)" 
            value={types}
            onChangeText={setTypes}
            style={{ width: 300, height: 50, borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10 }}
            />
            <TextInput 
            placeholder="Spécialité (Couture sur mesure, Retouche)" 
            value={speciality}
            onChangeText={setSpeciality}
            style={{ width: 300, height: 50, borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10 }}
            />
            <TextInput 
            placeholder="Contact (+228 90 00 00 00)" 
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
            style={{ width: 300, height: 50, borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10 }}
            />
            <TextInput 
            placeholder="Localisation (Lomé, agoué...)" 
            value={location}
            onChangeText={setLocation}
            style={{ width: 300, height: 50, borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10 }}
            />
            <TextInput 
            placeholder="Commentaire / Description" 
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={{ width: 300, minHeight: 100, textAlignVertical: 'top', borderColor: "black", borderWidth: 1, borderRadius: 10, paddingLeft: 10, paddingTop: 10 }}
            />
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={async () => {
            const trimmedName = name.trim();
            const trimmedEmail = email.trim();
            const trimmedTypes = types.trim();
            const trimmedSpeciality = speciality.trim();
            const trimmedContact = contact.trim();
            const trimmedLocation = location.trim();
            const trimmedComment = comment.trim();
            
            if (!trimmedName) {
              Alert.alert("Nom requis", "Veuillez saisir votre nom.");
              return;
            }
            if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
              Alert.alert("Email invalide", "Veuillez saisir un email valide.");
              return;
            }
            
            setSubmitting(true);
            try {
              // Sauvegarder sur le backend (sans mot de passe)
              const updateData: any = {
                name: trimmedName,
                email: trimmedEmail,
                location: trimmedLocation || undefined,
                contact: trimmedContact || undefined,
                types: trimmedTypes || undefined,
                speciality: trimmedSpeciality || undefined,
                comment: trimmedComment || undefined,
              };
              
              const updated = await AuthApi.updateProfile(updateData);
              // Mettre à jour le contexte avec les données RENVOYÉES par le serveur
              updateUser({ 
                name: updated.name, 
                email: updated.email,
                types: updated.types,
                speciality: updated.speciality,
                contact: updated.contact,
                location: updated.location,
                comment: updated.comment,
              });
              
              Alert.alert("Succès", "Profil mis à jour avec succès !");
              router.back();
            } catch (error: any) {
              console.error('Erreur mise à jour profil:', error);
              Alert.alert("Erreur", error?.message || "Échec de la mise à jour du profil");
            } finally {
              setSubmitting(false);
            }
          }}
          className=" bg-blue-500 w-full rounded-lg mt-20"
        >
          <Text className="p-4 text-center text-white text-lg">
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </Pressable>
        </ScrollView>
    </View>
 )
}