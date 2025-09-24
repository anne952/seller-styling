import { useLikes } from "@/components/likes-context";
import Positionnement from "@/components/positionnement";
import { useSellerProducts } from "@/components/seller-products-context";
import SellerProductCard from "@/components/SellerProductCard";
import { useUser } from "@/components/use-context";
import { ProductsApi, UsersApi } from "@/utils/auth";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";




export default function HomeScreen() {




  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { user } = useUser();
  const { products, removeProduct, replaceProducts } = useSellerProducts();
  const { likedIds } = useLikes();
  const totalLikes = useMemo(() => products.reduce((acc, p) => acc + (likedIds.has(p.id) ? 1 : 0), 0), [products, likedIds]);
  const router = useRouter();
  const contactPhoneDisplay = user.contact || "";
  const contactPhoneRaw = (user.contact || "").replace(/\D/g, "");

  useEffect(() => {
    (async () => {
      try {
        const apiProducts = await ProductsApi.list();
        const mapped = apiProducts.map((p: any) => ({
          id: Date.now() + Math.random(),
          name: p.name,
          price: p.price,
          promoPrice: p.promoPrice,
          images: (p.images || []).map((u: string) => u),
          description: p.description,
          isPromo: !!p.promoPrice,
          colors: p.colors || [],
          sizes: p.sizes || [],
          createdAt: new Date(),
          isSellerProduct: true as const,
          backendId: p.id,
        }));
        replaceProducts(mapped);
      } catch {}
    })();
  }, [replaceProducts]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const localUri = result.assets[0].uri;
        setAvatarUri(localUri);
        const uploadedUrl = await uploadImageToCloudinary(localUri);
        await UsersApi.meUpdate({ avatarUrl: uploadedUrl });
        setAvatarUri(uploadedUrl);
        Alert.alert("Succès", "Photo de profil mise à jour.");
      } catch (e: any) {
        Alert.alert("Erreur", e?.message || "Échec de l'upload de l'image");
      }
    }
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      "Supprimer le produit",
      "Êtes-vous sûr de vouloir supprimer ce produit ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeProduct(productId)
        }
      ]
    );
  };

  const callPhone = async (phone: string) => {
    const url = `tel:${phone}`;
    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    } else {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone.");
    }
  };

  const openWhatsApp = async (phone: string) => {
    const waUrl = `whatsapp://send?phone=${phone}`;
    const webUrl = `https://wa.me/${phone}`;
    if (await Linking.canOpenURL(waUrl)) {
      Linking.openURL(waUrl);
    } else if (await Linking.canOpenURL(webUrl)) {
      Linking.openURL(webUrl);
    } else {
      Alert.alert("Erreur", "WhatsApp n'est pas installé.");
    }
  };

  const sendEmail = async (email: string) => {
    const url = `mailto:${email}`;
    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    } else {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application e-mail.");
    }
  };

  const showContactOptions = () => {
    Alert.alert(
      "Contacter",
      "Choisissez une option",
      [
        { text: "Appel direct", onPress: () => callPhone(contactPhoneRaw) },
        { text: "Appel WhatsApp", onPress: () => openWhatsApp(contactPhoneRaw) },
        { text: "Annuler", style: "cancel" },
      ]
    );
  };
  return (
    <Positionnement>
      <View className="flex-row absolute right-0 items-center px-6 mb-1 p-6 gap-6 -mt-12" style={{ zIndex: 10 }}>
        <Link href="/pages/autres/create-process" asChild>
          <Pressable>
            <Ionicons name="add-circle-outline" size={24} color="black" className="p-4" />
          </Pressable>
        </Link>
        <Link href="/pages/autres/parametre" asChild>
          <Pressable>
            <Ionicons name="cog-outline" size={24} color="black" className="p-4" />
          </Pressable>
        </Link>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
      <View className="scroll mt-14 p-4 gap-6">

        <View>
        {user.name ? (
          <Text className="text-center font-bold text-xl">{user.name}</Text>
        ) : null}
        {user.email ? (
          <Pressable onPress={() => sendEmail(user.email)}>
            <Text className="text-center text-blue-500">{user.email}</Text>
          </Pressable>
        ) : null}
        {(!user.location || !user.contact || !user.types || !user.speciality || !user.comment) ? (
          <View className="items-center mt-2">
            <Link href="/pages/autres/edit-profil" className="bg-blue-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">Compléter mon profil</Text>
            </Link>
          </View>
        ) : null}

        <View className="flex-row justify-between items-start ">
          <Pressable onPress={pickImage} className="mt-2 ml-2">
            <View>
              <Image source={avatarUri ? { uri: avatarUri } : { uri: "https://via.placeholder.com/150" }} className="w-16 h-16 rounded-full border-2 border-blue-500" />
              <View className="absolute -bottom-1 -right-1 bg-blue-500 w-6 h-6 rounded-full items-center justify-center border border-white">
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </View>
          </Pressable>
          <View className="p-6">
            <Text className="font-bold text-blue-500 text-center">{products.length}</Text>
            <Text className="text-md">Publication</Text>
          </View>

          <View className="p-6">
            <Text className="font-bold text-blue-500 text-center">{totalLikes}</Text>
            <Text className="text-md">Like</Text>
          </View>
                  
        </View>
          <View className="">
            {/* Localisation */}
            {user.location ? (
              <View className="bg-gray-100  rounded-lg">
                <Text className="text-blue-500">{user.location}</Text>
              </View>
            ) : null}

            {/* Téléphone */}
            {user.contact ? (
              <Pressable onPress={showContactOptions} className="bg-gray-100  rounded-lg">
                <Text className="text-blue-500">{contactPhoneDisplay}</Text>
              </Pressable>
            ) : null}

            {/* Types de couture */}
            {user.types ? (
              <View className="bg-gray-100 rounded-lg">
                <Text className="text-blue-500">{user.types}</Text>
              </View>
            ) : null}

            {/* Spécialités */}
            {user.speciality ? (
              <View className="bg-gray-100 rounded-lg">
                <Text className="text-blue-500">{user.speciality}</Text>
              </View>
            ) : null}

            {/* Commentaire */}
            {user.comment ? (
              <View className="bg-gray-100 rounded-lg">
                <Text className="text-gray-800">{user.comment}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View className="bg-blue-500 h-1 -mt-6"></View>
        

              <View className="flex-row flex-wrap justify-between">
              {products.length > 0 ? (
          <View className="flex-1 mt-4">
            <Text className="text-lg font-bold text-center mb-4">Mes produits</Text>
            <FlatList
              data={products}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="w-[48%]">
                  <SellerProductCard
                    id={item.id}
                    name={item.name}
                    prix={item.price}
                    prixPromo={item.promoPrice}
                    images={item.images}
                    onPress={() => router.push({
                      pathname: "/pages/autres/seller-view",
                      params: { id: String(item.id) }
                    })}
                    onDelete={() => handleDeleteProduct(item.id)}
                  />
                </View>
              )}
            />
          </View>
        ) : (
          <View className="flex">
            <Text className="text-md text-blue-500 mt-32 text-center ml-28">Ajouter un produit</Text>
          </View>
        )}
      </View>
      </View>
      </ScrollView>
    </Positionnement>
  );
}
  
