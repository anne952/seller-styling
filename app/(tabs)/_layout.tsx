import { Tabs } from 'expo-router';
import PressableIcon from '../../components/PressableIcon';
import { useCart } from '../../components/cart-context';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9c9ef0ff',
        tabBarInactiveTintColor: '#f8f5f5ff',
        tabBarStyle: {
          backgroundColor: '#606FEF',
          borderTopWidth: 0,
          borderTopColor: '#000000',
          height: 60,
        },
         tabBarItemStyle: {
          padding: 6,
          marginTop: -8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <PressableIcon
              name={focused ? 'home' : 'home-outline'}
              size={size}
              activeColor={color}
              inactiveColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: 'Historique',
          tabBarIcon: ({ color, size, focused }) => (
            <PressableIcon
              name={focused ? 'time' : 'time-outline'}
              size={size}
              activeColor={color}
              inactiveColor={color}
            />
          ),
        }}
      />

<Tabs.Screen
        name="search"
        options={{
          tabBarLabel: 'Rechercher',
          tabBarIcon: ({ color, size, focused }) => (
            <PressableIcon
              name={focused ? 'search' : 'search-outline'}
              size={size}
              activeColor={color}
              inactiveColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: 'Portefeuille',
          tabBarIcon: ({ color, size, focused }) => <WalletTabIcon color={color} size={size} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="user"
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <PressableIcon
              name={focused ? 'person' : 'person-outline'}
              size={size}
              activeColor={color}
              inactiveColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function WalletTabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
  return (
    <PressableIcon
      name={focused ? 'wallet' : 'wallet-outline'}
      size={size}
      activeColor={color}
      inactiveColor={color}
      showDot={false}
    />
  );
}
