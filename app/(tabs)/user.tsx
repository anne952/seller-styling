import { useLikes } from "@/components/likes-context";
import Positionnement from "@/components/positionnement";
import { useSellerProducts } from "@/components/seller-products-context";
import CartProduit from "@/components/SellerProductCard";
import { useUser } from "@/components/use-context";
import { ProductsApi, UsersApi } from "@/utils/auth";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { user } = useUser();
  const { products = [], removeProduct, replaceProducts } = useSellerProducts(); // ✅ toujours un tableau
  const { likedIds } = useLikes();
  const router = useRouter();

  // Likes
  const totalLikes = useMemo(
    () => products.reduce((acc, p) => acc + (likedIds.has(p.id) ? 1 : 0), 0),
    [products, likedIds]
  );

  const contactPhoneDisplay = user?.contact || "";
  const contactPhoneRaw = (user?.contact || "").replace(/\D/g, "");

  // Charger les produits du vendeur
  const loadUserProducts = useCallback(async () => {
    console.log("🚀 loadUserProducts appelée, user:", user);
    console.log("🚀 user?.id:", user?.id, "user?.role:", user?.role);

    if (!user?.id) {
      console.log("⛔ user?.id undefined, skip");
      return;
    }

    if (user.role !== 'vendeur') {
      console.log("⛔ Utilisateur n'est pas vendeur (role:", user.role, "), skip chargement produits");
      return;
    }

    try {
      console.log("🔍 Chargement produits pour user ID:", user?.id, "type:", typeof user?.id);
      const apiProducts = await ProductsApi.list();
      console.log("📦 Produits de l'API:", apiProducts.length);
    console.log("📦 Exemples produits API:", apiProducts.slice(0, 3).map(p => ({
        id: p.id,
        nom: (p as any).nom,
        vendeurId: (p as any).vendeurId,
        vendeurIdType: typeof (p as any).vendeurId
      })));

      const filtered = (apiProducts as any[]).filter(
        (p) => p && p.vendeurId && Number(p.vendeurId) === Number(user?.id)
      );
      console.log("filtrés par vendeurId:", filtered.length, "produits pour vendeur", user.id);

      const mapped = filtered
        .filter((p: any) => p.id && p.nom && p.prix) // produits valides
        .map((p: any) => ({
          id: Number(p.id),
          name: p.nom || "",
          price: Number(p.prix) || 0,
          promoPrice: p.prixPromotion ? Number(p.prixPromotion) : undefined,
          images: Array.isArray(p.productImages)
            ? p.productImages.filter((img: any) => img?.url).map((img: any) => img.url)
            : [],
          description: p.description || "",
          isPromo: p.enPromotion || false,
          colors: Array.isArray(p.couleurs)
            ? p.couleurs.filter((c: any) => c?.couleur?.nom).map((c: any) => c.couleur.nom)
            : [],
          sizes: p.taille ? [p.taille] : [],
          createdAt: new Date(p.createdAt || Date.now()),
          isSellerProduct: true as const,
          backendId: String(p.id),
        }))
        .filter((product: any) => product.id && product.name && product.price > 0);

      console.log("✅ Produits mappés pour affichage:", mapped.length);
      console.log("✅ Produits:", mapped.map(p => ({ id: p.id, name: p.name, price: p.price })));
      // Fusionner avec les produits locaux existants pour éviter de perdre les nouveaux produits
      replaceProducts(mapped);
    } catch (error) {
      console.error("❌ Erreur chargement produits utilisateur:", error);
      // En cas d'erreur API, garder les produits locaux existants
    }
  }, [replaceProducts, user?.id]);

  useEffect(() => {
    // Réinitialiser les produits quand l'utilisateur change (changement de compte)
    if (user?.id) {
      console.log("👤 Utilisateur détecté, chargement de ses produits...");
      loadUserProducts();
    } else {
      // Si pas d'utilisateur connecté, vider les produits
      console.log("🚫 Aucun utilisateur connecté, vidage des produits locaux");
      replaceProducts([]);
    }
  }, [loadUserProducts, user?.id, replaceProducts]);

  // Charger avatar actuel
  useEffect(() => {
    console.log("📸 Avatar utilisateur:", user?.avatarUrl);
    if (user?.avatarUrl) {
      setAvatarUri(user.avatarUrl);
    } else {
      setAvatarUri(null); // Reset si pas d'avatar
    }
  }, [user?.avatarUrl]);

  // Changer la photo de profil
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      try {
        const localUri = result.assets[0].uri;
        setAvatarUri(localUri);
        const uploadResult = await uploadImageToCloudinary(localUri);
        const finalUrl = uploadResult.secure_url || uploadResult.url;
        await UsersApi.meUpdate({ avatarUrl: finalUrl });
        setAvatarUri(finalUrl);
        Alert.alert("Succès", "Photo de profil mise à jour.");
      } catch (e: any) {
        Alert.alert("Erreur", e?.message || "Échec de l'upload de l'image");
      }
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = (productId: number) => {
    Alert.alert("Supprimer le produit", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await ProductsApi.remove(String(productId));
            await loadUserProducts();
            Alert.alert("Succès", "Produit supprimé avec succès.");
          } catch (error: any) {
            console.error("Erreur suppression produit:", error);
            Alert.alert("Erreur", error?.message || "Échec de la suppression");
          }
        },
      },
    ]);
  };

  // Contact
  const callPhone = async (phone: string) => {
    const url = `tel:${phone}`;
    if (await Linking.canOpenURL(url)) Linking.openURL(url);
    else Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone.");
  };

  const openWhatsApp = async (phone: string) => {
    const waUrl = `whatsapp://send?phone=${phone}`;
    const webUrl = `https://wa.me/${phone}`;
    if (await Linking.canOpenURL(waUrl)) Linking.openURL(waUrl);
    else if (await Linking.canOpenURL(webUrl)) Linking.openURL(webUrl);
    else Alert.alert("Erreur", "WhatsApp n'est pas installé.");
  };

  const sendEmail = async (email: string) => {
    const url = `mailto:${email}`;
    if (await Linking.canOpenURL(url)) Linking.openURL(url);
    else Alert.alert("Erreur", "Impossible d'ouvrir l'application e-mail.");
  };

  const showContactOptions = () => {
    Alert.alert("Contacter", "Choisissez une option", [
      { text: "Appel direct", onPress: () => callPhone(contactPhoneRaw) },
      { text: "Appel WhatsApp", onPress: () => openWhatsApp(contactPhoneRaw) },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  return (
    <Positionnement>
      {/* Boutons haut */}
      <View
        className="flex-row absolute right-0 items-center px-6 mb-1 p-6 gap-6 -mt-12"
        style={{ zIndex: 10 }}
      >
        <Link href="/pages/autres/create-process" asChild>
          <Pressable>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="black"
              className="p-4"
            />
          </Pressable>
        </Link>
        <Link href="/pages/autres/parametre" asChild>
          <Pressable>
            <Ionicons name="cog-outline" size={24} color="black" className="p-4" />
          </Pressable>
        </Link>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View className="scroll mt-14 p-4 gap-6">
          {/* Infos utilisateur */}
          <View>
            {user?.name && (
              <Text className="text-center font-bold text-xl">{user.name}</Text>
            )}
            {user?.email && (
              <Pressable onPress={() => sendEmail(user.email)}>
                <Text className="text-center text-blue-500">{user.email}</Text>
              </Pressable>
            )}

            {(!user?.location ||
              !user?.contact ||
              !user?.types ||
              !user?.speciality ||
              !user?.comment) && (
              <View className="items-center mt-2">
                <Link
                  href="/pages/autres/edit-profil"
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">
                    Compléter mon profil
                  </Text>
                </Link>
              </View>
            )}

            {/* Avatar + stats */}
            <View className="flex-row justify-between items-start ">
              <Pressable onPress={pickImage} className="mt-2 ml-2">
                <View>
                  <Image
                    source={
                      avatarUri
                        ? { uri: avatarUri }
                        : { uri: "https://via.placeholder.com/150" }
                    }
                    className="w-16 h-16 rounded-full border-2 border-blue-500"
                  />
                  <View className="absolute -bottom-1 -right-1 bg-blue-500 w-6 h-6 rounded-full items-center justify-center border border-white">
                    <Ionicons name="camera" size={12} color="#fff" />
                  </View>
                </View>
              </Pressable>

              <View className="p-6">
                <Text className="font-bold text-blue-500 text-center">
                  {products.length}
                </Text>
                <Text className="text-md">Publication</Text>
              </View>

              <View className="p-6">
                <Text className="font-bold text-blue-500 text-center">
                  {totalLikes}
                </Text>
                <Text className="text-md">Like</Text>
              </View>
            </View>

            {/* Infos profil */}
            <View>
              {user?.location && (
                <View className="bg-gray-100  rounded-lg">
                  <Text className="text-blue-500">{user.location}</Text>
                </View>
              )}

              {user?.contact && (
                <Pressable
                  onPress={showContactOptions}
                  className="bg-gray-100 rounded-lg"
                >
                  <Text className="text-blue-500">{contactPhoneDisplay}</Text>
                </Pressable>
              )}

              {user?.types && (
                <View className="bg-gray-100 rounded-lg">
                  <Text className="text-blue-500">{user.types}</Text>
                </View>
              )}

              {user?.speciality && (
                <View className="bg-gray-100 rounded-lg">
                  <Text className="text-blue-500">{user.speciality}</Text>
                </View>
              )}

              {user?.comment && (
                <View className="bg-gray-100 rounded-lg">
                  <Text className="text-gray-800">{user.comment}</Text>
                </View>
              )}
            </View>
          </View>

          <View className="bg-blue-500 h-1 -mt-6"></View>

          {/* Produits */}
          <View className="flex-row flex-wrap justify-between">
            {products.length > 0 ? (
              <View className="flex-1 mt-4">
                <Text className="text-lg font-bold text-center mb-4">
                  Mes produits
                </Text>
                <FlatList
                  data={products}
                  numColumns={2}
                  keyExtractor={(item, index) => String(item.backendId || item.id) + '_' + index.toString()}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View className="w-[48%]">
                      <CartProduit
                        name={item.name}
                        prix={item.price}
                        prixPromo={item.promoPrice || 0}
                        images={item.images}
                        onPress={() =>
                          router.push({
                            pathname: "/pages/autres/seller-view",
                            params: { id: String(item.id) },
                          })
                        }
                        onDelete={() => handleDeleteProduct(item.id)}
                        id={item.id}
                      />
                    </View>
                  )}
                />

              </View>
            ) : (
              <View className="flex">
                <Text className="text-md text-blue-500 mt-32 text-center ml-28">
                  Ajouter un produit
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Positionnement>
  );
}
