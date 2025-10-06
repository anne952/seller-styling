import Positionnement from "@/components/positionnement";
import { useUser } from "@/components/use-context";
import { OrdersApi, ProductsApi } from "@/utils/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";

type OrderStatus = "validation" | "en_cours" | "livree" | "annulee";

type Order = {
  id: number;
  image: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: OrderStatus;
  users?: {
    id: number;
    email: string;
    telephone?: string;
    localisation?: string;
    nom?: string;
  };
};

export default function Commande() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingActions, setLoadingActions] = useState<Record<string, 'validate' | 'deliver' | 'cancel'>>({});
  const { user } = useUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("🔄 Chargement des commandes...");
        console.log("👤 Utilisateur connecté:", user?.id, "role:", user?.role);

        let relevantOrders: any[] = [];

        // Ventes pour tout le monde (vendeurs peuvent avoir ventes)
        relevantOrders = await OrdersApi.sellerOrders();
        console.log("📦 Commandes récupérées:", relevantOrders?.length || 0);

        // Récupérer tous les produits si nécessaire pour mapper les infos
        let allProducts: any[] = [];
        try {
          allProducts = await ProductsApi.list();
          console.log("🛒 Tous les produits récupérés:", allProducts?.length || 0);
        } catch (error) {
          console.log("❌ Erreur récupération produits:", error);
        }

        console.log("✅ Commandes relevées:", relevantOrders.length);

        if (!mounted) return;

        const mapped: Order[] = relevantOrders.map((o: any) => {
          console.log('🐔 Commande:', {
            id: o.id,
            status: o.status,
            items: o.items?.length || 0,
            users: o.users,
            o
          });

          const firstItem = o.items?.[0] || o.ligneCommande?.[0];
          let image = "https://via.placeholder.com/150";
          let name = `Commande #${o.id}`;
          let unitPrice = 0;

          // Trouver le produit depuis allProducts
          let product: any = null;
          if (firstItem) {
            const productId = firstItem.produitId || firstItem.productId;
            product = allProducts.find((p: any) => Number(p.id) === Number(productId));
            if (product) {
              image = product.productImages?.[0]?.url || product.images?.[0] || "https://via.placeholder.com/150";
              name = product.nom || product.name || name;
            }
          }
          unitPrice = Number(firstItem?.prixUnitaire || firstItem?.price || product?.prix || 0);

          const quantity = Array.isArray(o.items) ? o.items.reduce((a: number, it: any) => a + (it.quantite ?? it.quantity ?? 0), 0) :
                        Array.isArray(o.ligneCommande) ? o.ligneCommande.reduce((a: number, it: any) => a + (it.quantite ?? it.quantity ?? 0), 0) : 1;

          return {
            id: Number(o.id),
            image,
            name,
            quantity,
            unitPrice,
            status: o.status as OrderStatus,
            // Ajouter les informations du client
            users: o.users,
          };
        });

        console.log("✨ Commandes mappées pour vendeur:", mapped.length);
        setOrders(mapped);
      } catch (error: any) {
        console.error("❌ Erreur chargement commandes vendeur:", error);
        setOrders([]);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id, user?.role]);

  const formatFcfa = (n: number) => `${n.toLocaleString()} F`;

  const validateOrder = async (id: number) => {
    setLoadingActions(prev => ({ ...prev, [id]: 'validate' }));
    try {
      await OrdersApi.validate(String(id));
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "en_cours" } : o)));
      Alert.alert("Succès", "Commande validée avec succès");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Échec de la validation");
    }
    setLoadingActions(prev => ({ ...prev, [id]: undefined }));
  };

  const deliverOrder = async (id: number) => {
    setLoadingActions(prev => ({ ...prev, [id]: 'deliver' }));
    try {
      await OrdersApi.deliver(String(id));
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "livree" } : o)));
      Alert.alert("Succès", "Commande livrée avec succès");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Échec de la livraison");
    }
    setLoadingActions(prev => ({ ...prev, [id]: undefined }));
  };

  const cancelOrder = (id: number) => {
    Alert.alert(
      "Annuler la commande",
      "Êtes-vous sûr de vouloir annuler cette commande ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          onPress: async () => {
            setLoadingActions(prev => ({ ...prev, [id]: 'cancel' }));
            try {
              await OrdersApi.cancel(String(id));
              setOrders((prev) => prev.filter((o) => o.id !== id));
              Alert.alert("Succès", "Commande annulée avec succès");
            } catch (e: any) {
              Alert.alert("Erreur", e?.message || "Échec de l'annulation");
            }
            setLoadingActions(prev => ({ ...prev, [id]: undefined }));
          },
        },
      ]
    );
  };

  const renderActions = (order: Order) => {
    console.log('🐔 renderActions for order', order.id, 'status:', order.status);

    switch (order.status) {
      case "validation":
        return (
          <View className="flex-row gap-2 mt-2">
            <Pressable onPress={() => validateOrder(order.id)} disabled={loadingActions[order.id] === 'validate'}>
              <View className="bg-blue-500 px-3 py-2 rounded-lg">
                {loadingActions[order.id] === 'validate' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Valider</Text>
                )}
              </View>
            </Pressable>
            <Pressable onPress={() => cancelOrder(order.id)} disabled={loadingActions[order.id] === 'cancel'}>
              <View className="bg-red-500 px-3 py-2 rounded-lg">
                {loadingActions[order.id] === 'cancel' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Annuler</Text>
                )}
              </View>
            </Pressable>
          </View>
        );
      case "en_cours":
        return (
          <View className="flex-row gap-2 mt-2">
            <Pressable onPress={() => deliverOrder(order.id)} disabled={loadingActions[order.id] === 'deliver'}>
              <View className="bg-green-600 px-3 py-2 rounded-lg">
                {loadingActions[order.id] === 'deliver' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Livrer</Text>
                )}
              </View>
            </Pressable>
          </View>
        );
      case "annulee":
        return (
          <View className="mt-2">
            <View className="bg-red-500 px-3 py-2 rounded-lg">
              <Text className="text-white">Annulé</Text>
            </View>
          </View>
        );
      case "livree":
        return (
          <View className="mt-2">
            <View className="bg-gray-400 px-3 py-2 rounded-lg">
              <Text className="text-white">Livré</Text>
            </View>
          </View>
        );
      default:
        // Pour statuts inconnus, traiter comme en attente de validation
        return (
          <View className="flex-row gap-2 mt-2">
            <Pressable onPress={() => validateOrder(order.id)} disabled={loadingActions[order.id] === 'validate'}>
              <View className="bg-blue-500 px-3 py-2 rounded-lg">
                {loadingActions[order.id] === 'validate' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Valider</Text>
                )}
              </View>
            </Pressable>
            <Pressable onPress={() => cancelOrder(order.id)} disabled={loadingActions[order.id] === 'cancel'}>
              <View className="bg-red-500 px-3 py-2 rounded-lg">
                {loadingActions[order.id] === 'cancel' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Annuler</Text>
                )}
              </View>
            </Pressable>
          </View>
        );
    }
  };

  return (
    <Positionnement>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
        <Text className="text-lg font-bold text-center mb-4">
          {user?.role === 'vendeur' ? 'Mes ventes' : 'Mes commandes'}
        </Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const total = item.unitPrice * item.quantity;
            return (
              <View className="bg-white rounded-xl p-4 mb-4 flex-row gap-3 items-center">
                <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg" />
                <View className="flex-1">
                  <Text className="font-semibold">{item.name}</Text>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-gray-600">Qté: {item.quantity}</Text>
                    <Text className="text-gray-600">PU: {formatFcfa(item.unitPrice)}</Text>
                    <Text className="font-semibold">Prix: {formatFcfa(total)}</Text>
                  </View>
                  {item.users && (
                    <View className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <Text className="text-sm text-gray-700 font-semibold">🧑 Infos client :</Text>
                      <Text className="text-sm text-gray-600">👤 Nom: {item.users.nom || 'Non renseigné'}</Text>
                      <Text className="text-sm text-gray-600">📧 Email: {item.users.email}</Text>
                      <Text className="text-sm text-gray-600">📞 Téléphone: {item.users.telephone || 'Non renseigné'}</Text>
                      <Text className="text-sm text-gray-600">📍 Localisation: {item.users.localisation || 'Non renseigné'}</Text>
                    </View>
                  )}
                  {renderActions(item)}
                </View>
              </View>
            );
          }}
        />
      </ScrollView>
    </Positionnement>
  );
}
