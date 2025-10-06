import { useActivity } from "@/components/activity-context";
import { useCart } from "@/components/cart-context";
import { useUser } from "@/components/use-context";
import { OrdersApi } from "@/utils/auth";
import type { OrderPayload } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function PaymentSuccessScreen({ navigation }: any) {
  const params = useLocalSearchParams();
  const methodId = params.method as string || 'flooz';
  const paymentMethod = methodId === 'flooz' ? 'Flooz' : methodId === 'mixx' ? 'Tmoney' : 'Flooz';
  const { addActivity } = useActivity();
  const { items, totalPrice, totalCount, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderData, setOrderData] = useState<{
    id: string;
    title: string;
    quantity: number;
    price: string;
    date: string;
  } | null>(null);

  React.useEffect(() => {
    const validatePayment = async () => {
      if (items.length === 0) {
        Alert.alert("Erreur", "Aucun article dans le panier");
        router.replace('/(tabs)/home');
        return;
      }

      setCreatingOrder(true);
      try {
        console.log("💳 Validation du paiement...");

        // Simulation validation paiement (backend répondrait "paiement confirmé")
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simule appel API
        console.log("✅ Paiement validé avec succès");

        const orderTitle = items[0]?.name || 'Commande';

        // Créer la commande seulement si validation réussie
        const payload: OrderPayload = {
          items: items.map(it => ({
            productId: String(it.id),
            quantity: it.quantity,
            price: it.price // Prix unitaire requis
          })),
          totalAmount: totalPrice, // Montant total pour Prisma Schema
          location: user?.location || "Non spécifié", // Localisation acheteur
          paymentMethod: paymentMethod, // Selon choix utilisateur
        };

        console.log("🏪 Création commande finale pour acheteur :", user?.id);
        console.log("📦 Payload commande:", JSON.stringify(payload, null, 2));

        const order = await OrdersApi.create(payload);
        console.log("✅ Commande créée avec succès:", JSON.stringify(order, null, 2));
        console.log("🔍 Détails commande - ID:", order.id, "Status:", order.status);

        // Stocker les données pour le lien
        setOrderData({
          id: order.id,
          title: orderTitle,
          quantity: totalCount,
          price: `${totalPrice}F`,
          date: new Date().toLocaleDateString(),
        });

        // Ajouter l'activité locale pour le suivi
        addActivity({
          id: order.id,
          type: 'commande',
          title: orderTitle,
          price: `${totalPrice}F`,
          quantity: totalCount,
          date: new Date().toLocaleDateString(),
          image: items[0]?.image,
          step: 0,
        });

        // Ne pas vider le panier automatiquement, laisser l'utilisateur le faire
        // clearCart();
        console.log("✅ Commande créée, panier conservé pour l'utilisateur");

      } catch (error: any) {
        console.error("❌ Erreur validation paiement:", error);
        Alert.alert("Erreur", `Échec du paiement: ${error?.message || 'Erreur inconnue'}`);
        router.replace('/(tabs)/home');
      } finally {
        setCreatingOrder(false);
      }
    };

    validatePayment();
  }, [items, totalPrice, totalCount, addActivity, clearCart, router, user]);
  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>
        {creatingOrder ? "Création de la commande..." : "Paiement réussi"}
      </Text>

      {/* Rond noir avec check */}
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>

      {/* Bouton suivre la commande - seulement si la commande est créée */}
      {orderData ? (
        <Link
          href={{
            pathname: "/pages/autres/suivre-commande",
            params: {
              id: orderData.id,
              title: orderData.title,
              quantity: String(orderData.quantity),
              price: orderData.price,
              date: orderData.date,
              step: "0"
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Suivre la commande</Text>
        </Link>
      ) : (
        <View style={[styles.button, { backgroundColor: '#9CA3AF' }]}>
          <Text style={styles.buttonText}>
            {creatingOrder ? "Création..." : "Erreur"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#606FEF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
