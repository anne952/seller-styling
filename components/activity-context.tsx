import { OrdersApi, ProductsApi } from '@/utils/auth';
import { notifyNow } from '@/utils/notifications';
import { useUser } from '@/components/use-context';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ActivityItem = {
  id: string;
  type: 'commande' | 'transaction';
  title: string;
  price: string; // e.g., "3000F"
  quantity: number;
  date: string;
  image?: any;
  step?: number; // 0 validation, 1 en cours, 2 livrée
  sellerConfirmed?: boolean; // vendeur a confirmé la livraison
  clientConfirmed?: boolean; // client a confirmé la livraison
  clientDisputed?: boolean; // client a marqué non livré
};

type ActivityContextValue = {
  activities: ActivityItem[];
  addActivity: (item: ActivityItem) => void;
  removeActivities: (ids: string[]) => void;
  clear: () => void;
  markOrderAccepted: (id: string) => void;
  markOrderDeliveredBySeller: (id: string) => void;
  clientConfirmDelivered: (id: string) => void;
  clientMarkNotDelivered: (id: string) => void;
};

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

const initialActivities: ActivityItem[] = [];

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  const addActivity = (item: ActivityItem) => {
    setActivities((prev) => [item, ...prev]);
    if (item.type === 'commande') {
      notifyNow('Nouvelle commande', `${item.title} x${item.quantity}`);
    }
  };

  const removeActivities = (ids: string[]) => {
    setActivities((prev) => prev.filter((a) => !ids.includes(a.id)));
  };

  const clear = () => setActivities([]);

  const updateActivity = (id: string, updater: (a: ActivityItem) => ActivityItem) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? updater(a) : a)));
  };

  const markOrderAccepted = (id: string) => {
    updateActivity(id, (a) => ({ ...a, step: Math.max(0, 1) }));
    notifyNow('Commande acceptée', `Votre commande a été acceptée.`);
  };

  const markOrderDeliveredBySeller = (id: string) => {
    updateActivity(id, (a) => ({ ...a, step: 2, sellerConfirmed: true }));
    notifyNow('Commande livrée', `Le vendeur a confirmé la livraison.`);
  };

  const clientConfirmDelivered = (id: string) => {
    updateActivity(id, (a) => ({ ...a, clientConfirmed: true, clientDisputed: false }));
    notifyNow('Livraison confirmée', `Merci pour votre confirmation.`);
  };

  const clientMarkNotDelivered = (id: string) => {
    updateActivity(id, (a) => ({ ...a, clientDisputed: true, clientConfirmed: false }));
    notifyNow('Problème de livraison', `Nous vous répondrons sous 3 jours.`);
  };

  // Charger périodiquement les commandes réelles du backend
  useEffect(() => {
    let mounted = true;
    const statusToStep: Record<string, number> = {
      validation: 0,
      en_cours: 1,
      livree: 2,
    };
    const mapOrdersToActivities = (orders: any[], allProducts?: any[]): ActivityItem[] => {
      return orders.map((o: any) => {
        let image = undefined;
        let productTitle = o.nom || `Commande #${o.id}`;
        let quantity = 1;
        // Si allProducts fourni (vendeurs), trouver le produit et son image depuis ligneCommande
        if (allProducts && Array.isArray(o.ligneCommande)) {
          const firstItem = o.ligneCommande[0];
          if (firstItem) {
            const product = allProducts.find(p => p.id == firstItem.produitId);
            if (product) {
              image = product.productImages?.[0]?.url;
              productTitle = product.nom || productTitle;
            }
          }
          quantity = o.ligneCommande.reduce((a: number, it: any) => a + (it.quantite ?? 1), 0);
        }
        return {
          id: String(o.id),
          type: 'commande',
          title: productTitle,
          price: `${(o.montant ?? 0).toString()}F`,
          quantity,
          date: new Date(o.date).toLocaleString(),
          image,
          step: statusToStep[o.status] ?? 0,
          sellerConfirmed: o.status === 'livree',
          clientConfirmed: false,
          clientDisputed: false,
        };
      });
    };
    const tick = async () => {
      try {
        // Charger les achats de l'utilisateur (vendeurs peuvent aussi acheter)
        const orders = await OrdersApi.myOrders();
        const allProducts = await ProductsApi.list();
        if (!mounted) return;
        setActivities(mapOrdersToActivities(orders, allProducts));
      } catch (error) {
        console.error('Erreur chargement historiques:', error);
      }
    };
    const interval = setInterval(tick, 15000);
    tick();
    return () => { mounted = false; clearInterval(interval); };
  }, [user?.role, user?.id]);

  const value = useMemo(
    () => ({
      activities,
      addActivity,
      removeActivities,
      clear,
      markOrderAccepted,
      markOrderDeliveredBySeller,
      clientConfirmDelivered,
      clientMarkNotDelivered,
    }),
    [activities]
  );
  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}
