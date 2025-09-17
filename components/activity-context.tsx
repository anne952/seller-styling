import React, { createContext, useContext, useMemo, useState } from 'react';

export type ActivityItem = {
  id: string;
  type: 'commande' | 'transaction';
  title: string;
  price: string; // e.g., "3000F"
  quantity: number;
  date: string;
  image?: any;
  step?: number; // 0 validation, 1 en cours, 2 livrée
};

type ActivityContextValue = {
  activities: ActivityItem[];
  addActivity: (item: ActivityItem) => void;
  removeActivities: (ids: string[]) => void;
  clear: () => void;
};

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

const initialActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'commande',
    title: 'chicha',
    price: '3000F',
    quantity: 3,
    date: '7 Août 2022',
    image: require('@/assets/images/0 (1).jpeg'),
    step: 1,
  },
  {
    id: '2',
    type: 'transaction',
    title: 'versement',
    price: '5000F',
    quantity: 1,
    date: '8 Août 2022',
    image: require('@/assets/images/1 (2).jpg'),
  },
];

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  const addActivity = (item: ActivityItem) => {
    setActivities((prev) => [item, ...prev]);
  };

  const removeActivities = (ids: string[]) => {
    setActivities((prev) => prev.filter((a) => !ids.includes(a.id)));
  };

  const clear = () => setActivities([]);

  const value = useMemo(() => ({ activities, addActivity, removeActivities, clear }), [activities]);
  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}


