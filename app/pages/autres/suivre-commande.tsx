import { useActivity } from '@/components/activity-context';
import { OrdersApi } from '@/utils/auth';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const commande = {
  image: require('../../../assets/images/0 (4).jpeg'), // Remplacez par le chemin réel
  nom: 'Chemise blanche',
  quantite: 2,
  etape: 1, // 0: Validation, 1: En cours de livraison, 2: Livrée
};

const etapes = [
  'Validation',
  'En cours',
  'Livrée',
  'Annulée',
];

export default function SuivreCommande() {
  const params = useLocalSearchParams<{ id?: string; title?: string; quantity?: string; price?: string; date?: string }>();
  const { activities, clientConfirmDelivered, clientMarkNotDelivered, markOrderAccepted, markOrderDeliveredBySeller } = useActivity();
  const fromHistory = params && params.id;
  const activity = fromHistory ? activities.find(a => a.id === params.id) : undefined;

  const [realOrder, setRealOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  useEffect(() => {
    if (fromHistory && params.id) {
      setLoadingOrder(true);
      OrdersApi.myOrders().then(orders => {
        const found = orders.find(order => order.id === params.id);
        setRealOrder(found);
        setLoadingOrder(false);
      }).catch(err => {
        console.error('Erreur chargement commande:', err);
        setLoadingOrder(false);
      });
    }
  }, [fromHistory, params.id]);

  const display = {
    image: activity?.image ?? commande.image,
    nom: params.title || activity?.title || commande.nom,
    quantite: params.quantity ? Number(params.quantity) : activity?.quantity ?? commande.quantite,
    price: params.price || (activity?.price as string | undefined),
  } as { image: any; nom: string; quantite: number; price?: string };

  // Step: 0 Validation, 1 En cours, 2 Livrée
  const currentStep = (() => {
    if (realOrder?.status) {
      switch (realOrder.status) {
        case 'validation': return 0;
        case 'en_cours': return 1;
        case 'livree': return 2;
        case 'annulee': return 3; // ajouter une étape pour annulé si besoin
        default: return 0;
      }
    }
    const raw = (params as any)?.step;
    const n = Number(raw);
    return Number.isFinite(n) ? n : (activity?.step ?? commande.etape);
  })();

  const orderId = params.id as string | undefined;
  const sellerConfirmed = !!activity?.sellerConfirmed;
  const clientConfirmed = !!activity?.clientConfirmed;
  const clientDisputed = !!activity?.clientDisputed;

  // Hide when both seller and client confirmed delivered
  if (!fromHistory || (currentStep >= 2 && sellerConfirmed && clientConfirmed)) {
    return (
      <View style={styles.container}>
        <Text style={styles.titre}>Suivi de la commande</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 28, color: '#4F46E5' }}>🚚</Text>
          </View>
          <Text style={{ color: '#6B7280' }}>Aucune commande en cours</Text>
        </View>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Suivi de la commande</Text>
      <Link href={{ pathname: '/pages/autres/recu', params }} style={styles.card}>
        <Image source={display.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.nom}>{display.nom}</Text>
          <Text style={styles.quantite}>Quantité : {display.quantite}</Text>
          {display.price ? (
            <View style={styles.pricePill}><Text style={styles.pricePillText}>{display.price}</Text></View>
          ) : null}
        </View>
      </Link>

      <View style={[styles.card, { paddingVertical: 16 }] }>
        <View style={styles.etapesContainer}>
        {etapes.map((etape, index) => (
          <View key={etape} style={styles.etapeItem}>
            <View
              style={[styles.circle, index <= currentStep ? styles.active : styles.inactive]}
            />
            <Text style={index <= currentStep ? styles.activeText : styles.inactiveText}>{etape}</Text>
            {index < etapes.length - 1 && <View style={[styles.line, index < currentStep ? styles.lineActive : null]} />}
          </View>
        ))}
        </View>
      </View>

      {/* Statut de la commande */}
      <View style={[styles.card, { backgroundColor: currentStep === 3 ? '#FEF2F2' : '#FFFFFF', borderColor: currentStep === 3 ? '#FECACA' : '#F3F4F6' }]}>
        <Text style={{ fontWeight: '600', color: currentStep === 3 ? '#991B1B' : '#6B7280', textAlign: 'center' }}>
          {currentStep === 0 && "En attente de validation"}
          {currentStep === 1 && "En cours de préparation"}
          {currentStep === 2 && "Commande livrée"}
          {currentStep === 3 && "Commande annulée"}
        </Text>
      </View>

      {sellerConfirmed && (
        <View style={[styles.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <Text style={{ fontWeight: '600', marginBottom: 12 }}>Confirmez-vous la livraison ?</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={() => fromHistory && clientConfirmDelivered(params.id!)} style={{ flex: 1, backgroundColor: '#10B981', padding: 12, borderRadius: 10 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Livré</Text>
            </Pressable>
            <Pressable onPress={() => fromHistory && clientMarkNotDelivered(params.id!)} style={{ flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 10 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Non livré</Text>
            </Pressable>
          </View>
          {clientDisputed && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: '#6B7280' }}>Nous vous donnerons une explication d'ici trois jours.</Text>
              <Pressable onPress={() => fromHistory && clientConfirmDelivered(params.id!)} style={{ marginTop: 10 }}>
                <Text style={{ color: '#2563EB', fontWeight: '600' }}>J'ai finalement reçu la commande</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    marginTop: 50,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    margin:5,
    gap:15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
    marginLeft: 10,
   
  },
  nom: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantite: {
    fontSize: 16,
    color: '#555',
  },
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 6,
  },
  pricePillText: {
    color: '#3730A3',
    fontWeight: '700',
  },
  etapesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  etapeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginRight: 6,
  },
  active: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  inactive: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  activeText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    marginRight: 10,
  },
  inactiveText: {
    color: '#aaa',
    marginRight: 10,
  },
  line: {
    width: 30,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  lineActive: {
    backgroundColor: '#4F46E5',
  },
});
