import { useActivity } from "@/components/activity-context";
import Positionnement from "@/components/positionnement";
import { Ionicons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";

// activities are provided by ActivityProvider

export default function HistoryScreen() {
  const { activities, removeActivities } = useActivity();
  const [selected, setSelected] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const allSelected = useMemo(() => activities.length > 0 && selected.length === activities.length, [activities.length, selected.length]);

  const handleLongPress = (id: string) => {
    setSelectMode(true);
    setSelected([id]);
  };

  const handlePress = (id: string) => {
    if (selectMode) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    } else {
      // Non-selection mode: navigate based on type
      const item = activities.find(a => a.id === id);
      if (!item) return;
      // commande -> suivre-commande, transaction -> recu
      if (item.type === 'commande') {
        // open order tracking
        // navigation via Link wrapper in renderItem
      } else if (item.type === 'transaction') {
        // open receipt
      }
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(activities.map((a) => a.id));
    }
  };

  const handleDelete = () => {
    if (selected.length === 0) return;
    Alert.alert(
      'Supprimer',
      `Confirmer la suppression de ${selected.length} élément(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            removeActivities(selected);
            setSelected([]);
            setSelectMode(false);
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    setSelected([]);
    setSelectMode(false);
  };

  const getTypeBadge = (type: string) => {
    const isCommande = type === 'commande';
    const bg = isCommande ? '#d1fae5' : '#e0e7ff';
    const color = isCommande ? '#065f46' : '#1e3a8a';
    const label = isCommande ? 'Commande' : 'Transaction';
    return (
      <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 }}>
        <Text style={{ color, fontWeight: '600', fontSize: 12 }}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: typeof activities[0] }) => (
    <Pressable
      onLongPress={() => handleLongPress(item.id)}
      onPress={() => handlePress(item.id)}
      style={{
        marginHorizontal: 12,
        marginVertical: 6,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderColor: selected.includes(item.id) ? '#3b82f6' : 'rgba(0,0,0,0.06)',
        borderWidth: selected.includes(item.id) ? 2 : 1,
        backgroundColor: selected.includes(item.id) ? '#eff6ff' : '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <Image source={item.image ?? require('@/assets/images/0 (1).jpeg')} style={{ width: 64, height: 64, borderRadius: 10 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className="font-bold text-base" numberOfLines={1}>{item.title}</Text>
          {getTypeBadge(item.type)}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: '#1e40af', fontWeight: '700' }}>{item.price || '—'}</Text>
          </View>
          <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: '#991b1b', fontWeight: '700' }}>Qté: {item.quantity}</Text>
          </View>
        </View>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>{item.date}</Text>
        {!selectMode && (
          item.type === 'commande' ? (
            <Link
              href={{
                pathname: '/pages/autres/suivre-commande',
                params: {
                  id: item.id,
                  title: item.title,
                  quantity: String(item.quantity),
                  price: item.price,
                  date: item.date,
                },
              }}
              asChild
            >
              <Text className="text-blue-600">Voir le suivi</Text>
            </Link>
          ) : (
            <Link
              href={{
                pathname: '/pages/autres/recu',
                params: {
                  id: item.id,
                  title: item.title,
                  quantity: String(item.quantity),
                  price: item.price,
                  date: item.date,
                },
              }}
              asChild
            >
              <Text className="text-blue-600">Voir le reçu</Text>
            </Link>
          )
        )}
      </View>
      {selectMode && (
        <Ionicons
          name={selected.includes(item.id) ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={selected.includes(item.id) ? '#2563eb' : '#9ca3af'}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );

  return (
    <Positionnement>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {!selectMode ? (
          <>
            <Text className="text-xl font-extrabold">Historique</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={{ color: '#6b7280' }}>{activities.length} éléments</Text>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
              <Text className="text-lg font-bold">{selected.length} sélectionné(s)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <TouchableOpacity onPress={handleSelectAll}>
                <Ionicons name={allSelected ? 'remove-circle-outline' : 'checkmark-done'} size={24} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {activities.length === 0 ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
          <Ionicons name="file-tray-outline" size={64} color="#9ca3af" />
          <Text className="mt-2 text-gray-500">Aucun historique pour le moment</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </Positionnement>
  );
}
   