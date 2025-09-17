import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function ReceiptScreen() {
  const params = useLocalSearchParams<{ id?: string; title?: string; quantity?: string; price?: string; date?: string }>();
  // Exemple de données produits
  const products = params.id
    ? [
        {
          id: String(params.id),
          name: String(params.title ?? 'Produit'),
          quantity: Number(params.quantity ?? '1'),
          price: Number((params.price ?? '0').toString().replace(/[^0-9]/g, '')),
          image: "https://via.placeholder.com/60",
          originalPrice: undefined,
        },
      ]
    : [
        {
          id: "1",
          name: "Produit A",
          quantity: 2,
          price: 1500,
          image: "https://via.placeholder.com/60",
          originalPrice: 2000,
        },
        {
          id: "2",
          name: "Produit B",
          quantity: 1,
          price: 2000,
          image: "https://via.placeholder.com/60",
          originalPrice: undefined,
        },
      ];

  // Calcul du total
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const total = subtotal;

  const orderId = params.id ?? '—';
  const orderDate = params.date ?? '';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Reçu</Text>
        <View style={styles.badgeMuted}>
          <Ionicons name="receipt-outline" size={14} color="#374151" />
          <Text style={styles.badgeMutedText}>#{orderId}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.hintText}>  {orderDate || '—'}</Text>
          </View>
          <View style={styles.badgePayment}>
            <Ionicons name="card-outline" size={14} color="#065F46" />
            <Text style={styles.badgePaymentText}>Flooz</Text>
          </View>
        </View>
        <View style={[styles.cardRowBetween, { marginTop: 10 }]}>
          <Text style={styles.hintText}>Total</Text>
          <Text style={styles.totalText}>{total} FCFA</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Produits</Text>
          <Text style={styles.hintText}>{products.length} article(s)</Text>
        </View>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productQty}>Quantité : {item.quantity}</Text>
                {('originalPrice' in item && item.originalPrice) ? (
                  <Text style={styles.strikePrice}>{item.originalPrice} FCFA</Text>
                ) : null}
              </View>
              <View style={styles.pricePill}>
                <Text style={styles.pricePillText}>{item.price * item.quantity} FCFA</Text>
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Compte</Text>
        <View style={styles.row}> 
          <Text style={styles.hintText}>Sous-total</Text>
          <Text style={styles.valueText}>{subtotal} FCFA</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}> 
          <Text style={styles.cardTitle}>Total</Text>
          <Text style={styles.totalText}>{total} FCFA</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
    paddingTop: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  badgeMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeMutedText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  hintText: {
    color: '#6B7280',
  },
  valueText: {
    color: '#111827',
    fontWeight: '600',
  },
  totalText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 18,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
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
  pricePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  pricePillText: {
    color: '#3730A3',
    fontWeight: '700',
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  badgePayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgePaymentText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
});
