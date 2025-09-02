import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";

export default function ReceiptScreen() {
  // Exemple de données produits
  const products = [
    {
      id: "1",
      name: "Produit A",
      quantity: 2,
      price: 1500,
      image: "https://via.placeholder.com/60",
    },
    {
      id: "2",
      name: "Produit B",
      quantity: 1,
      price: 2000,
      image: "https://via.placeholder.com/60",
    },
  ];

  // Calcul du total
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discount = 500;
  const total = subtotal - discount;

  return (
    <View style={styles.container}>
      {/* Liste des produits */}
      <Text style={styles.sectionTitle}>Produits achetés</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productQty}>Quantité : {item.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>
              {item.price * item.quantity} FCFA
            </Text>
          </View>
        )}
      />

      {/* Compte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.row}>
          <Text>Sous-total</Text>
          <Text>{subtotal} FCFA</Text>
        </View>
        <View style={styles.row}>
          <Text>Remise</Text>
          <Text>-{discount} FCFA</Text>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, paddingTop: 5 }]}>
          <Text style={{ fontWeight: "bold" }}>Total</Text>
          <Text style={{ fontWeight: "bold" }}>{total} FCFA</Text>
        </View>
      </View>

      {/* Moyen de paiement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moyen de paiement</Text>
        <Text style={styles.paymentMethod}>Flooz</Text>
        {/* si c'est TMoney mettre "TMoney" */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  section: {
    marginTop: 0,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 50,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  productQty: {
    fontSize: 14,
    color: "#666",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2a7",
  },
});
