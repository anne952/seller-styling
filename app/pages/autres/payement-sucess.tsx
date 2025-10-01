import { useActivity } from "@/components/activity-context";
import { useCart } from "@/components/cart-context";
import { OrdersApi } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";



export default function PaymentSuccessScreen({ navigation }: any) {
  const { addActivity } = useActivity();
  const { items, totalPrice, totalCount, clearCart } = useCart();
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
    const createOrderAfterPayment = async () => {
      if (items.length === 0) {
        Alert.alert("Erreur", "Aucun article dans le panier");
        router.replace('/(tabs)/home');
        return;
      }

      setCreatingOrder(true);
      try {
        console.log("💳 Création de la commande après paiement...");

        const payload = {
          items: items.map(it => ({ productId: String(it.id), quantity: it.quantity })),
        };

        const order = await OrdersApi.create(payload);
        console.log("✅ Commande créée:", order);

        const orderTitle = items[0]?.name || 'Commande';

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

        // Vider le panier seulement après succès
        clearCart();
        console.log("🛒 Panier vidé après commande");

      } catch (error: any) {
        console.error("❌ Erreur création commande:", error);
        Alert.alert("Erreur", `Échec de la création de commande: ${error?.message || 'Erreur inconnue'}`);
        router.replace('/(tabs)/home');
      } finally {
        setCreatingOrder(false);
      }
    };

    createOrderAfterPayment();
  }, [items, totalPrice, totalCount, addActivity, clearCart, router]);
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
