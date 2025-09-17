import Positionnement from "@/components/positionnement";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type RangeKey = "year" | "month";
type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const monthlyActivity = [
  120, 200, 150, 300, 250, 400, 380, 420, 310, 500, 450, 480,
];

function daysInMonth(month: MonthIndex, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function buildDailyActivity(month: MonthIndex, year: number) {
  const len = daysInMonth(month, year);
  const arr = Array.from({ length: len }, (_, i) => 15 + Math.round(15 * Math.sin((i / len) * Math.PI * 2)) + (i % 7));
  return arr;
}

export default function WalletScreen() {
  const [range, setRange] = useState<RangeKey>("year");
  const today = new Date();
  const [month, setMonth] = useState<MonthIndex>(today.getMonth() as MonthIndex);
  const [year] = useState<number>(today.getFullYear());

  const data = range === "year" ? monthlyActivity : buildDailyActivity(month, year);

  const stats = useMemo(() => {
    const total = data.reduce((a, b) => a + b, 0);
    const monthly = range === "year" ? total / 12 : total;
    const yearly = range === "year" ? total : monthlyActivity.reduce((a, b) => a + b, 0);
    return {
      totalRevenue: total * 1000,
      monthlyRevenue: monthly * 1000,
      yearlyRevenue: yearly * 1000,
    };
  }, [data, range]);

  const formatFcfa = (n: number) => `${n.toLocaleString()} F`;

  return (
    <Positionnement>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28}}>
        <View className="flex-row items-center justify-between mb-3 ">
          <Text className="text-xl font-extrabold">Portefeuille</Text>
        </View>

        <View className="flex-row items-center self-center bg-gray-100 rounded-full p-1 mb-5" style={{ gap: 6 }}>
          <Pressable
            onPress={() => setRange("month")}
            className={`px-4 py-2 rounded-full ${
              range === "month" ? "bg-blue-500" : "bg-transparent"
            }`}
            style={{ shadowColor: '#000', shadowOpacity: range === 'month' ? 0.12 : 0, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: range === 'month' ? 1 : 0 }}
          >
            <Text className={`${range === "month" ? "text-white" : "text-gray-700"}`}>Mois</Text>
          </Pressable>
          <Pressable
            onPress={() => setRange("year")}
            className={`px-4 py-2 rounded-full ${
              range === "year" ? "bg-blue-500" : "bg-transparent"
            }`}
            style={{ shadowColor: '#000', shadowOpacity: range === 'year' ? 0.12 : 0, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: range === 'year' ? 1 : 0 }}
          >
            <Text className={`${range === "year" ? "text-white" : "text-gray-700"}`}>Année</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4" style={{ borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600">Gain total</Text>
            <Ionicons name="trending-up-outline" size={18} color="#10B981" />
          </View>
          <Text className="text-3xl font-extrabold">{formatFcfa(stats.totalRevenue)}</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4" style={{ borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600">Activité ({range === "year" ? "12 mois" : "30 jours"})</Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3686F7' }} />
              <Text className="text-gray-500 text-xs">Revenus</Text>
            </View>
          </View>
          {range === "month" && (
            <MonthSelector month={month} setMonth={setMonth} />
          )}
          <LineChart values={data} height={176} color="#3686F7" showDayTicks={range === "month"} month={month} year={year} />
        </View>

        <View className="bg-white rounded-2xl p-5 mb-12" style={{ borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-600">Revenus</Text>
            <Ionicons name="cash-outline" size={18} color="#111827" />
          </View>
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500">Mensuel</Text>
            </View>
            <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
              <Text style={{ color: '#065F46', fontWeight: '700' }}>{formatFcfa(stats.monthlyRevenue)}</Text>
            </View>
          </View>
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons name="sparkles-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500">Annuel</Text>
            </View>
            <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
              <Text style={{ color: '#3730A3', fontWeight: '700' }}>{formatFcfa(stats.yearlyRevenue)}</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons name="layers-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500">Total</Text>
            </View>
            <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
              <Text style={{ color: '#1D4ED8', fontWeight: '700' }}>{formatFcfa(stats.totalRevenue)}</Text>
            </View>
          </View>
        </View>

        <View className="absolute right-4 top-4">
          <Link href="/pages/autres/commande" asChild>
            <Pressable>
              <View style={{ position: 'relative', backgroundColor: 'white', borderRadius: 9999, padding: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#111827" />
                <View style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 1, borderColor: 'white' }} />
              </View>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </Positionnement>
  );
}

function LineChart({ values, height = 120, color = "#3686F7", showDayTicks = false, month, year }: { values: number[]; height?: number; color?: string; showDayTicks?: boolean; month?: MonthIndex; year?: number }) {
  const width = 320;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pad = 12;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;
  const stepX = innerW / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const yRatio = max === min ? 0 : (v - min) / (max - min);
    const x = pad + i * stepX;
    const y = pad + (1 - yRatio) * innerH;
    return { x, y };
  });

  // Build smooth curve using Catmull-Rom to Bezier-like interpolation
  const segmentsPerInterval = 12; // higher = smoother
  const splinePoints: { x: number; y: number }[] = [];
  if (points.length <= 2) {
    splinePoints.push(...points);
  } else {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? points[i + 1];
      for (let tStep = 0; tStep <= segmentsPerInterval; tStep++) {
        const t = tStep / segmentsPerInterval;
        // Catmull-Rom with tension = 0.5
        const tt = t * t;
        const ttt = tt * t;
        const q0 = -0.5 * ttt + tt - 0.5 * t;
        const q1 = 1.5 * ttt - 2.5 * tt + 1.0;
        const q2 = -1.5 * ttt + 2.0 * tt + 0.5 * t;
        const q3 = 0.5 * ttt - 0.5 * tt;
        const x = p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3;
        const y = p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3;
        splinePoints.push({ x, y });
      }
    }
  }

  return (
    <View style={{ width, height, backgroundColor: "#FFFFFF", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: '#F3F4F6' }}>
      {/* grid */}
      <View style={{ position: "absolute", top: height / 2, left: 0, right: 0, height: 1, backgroundColor: "#F3F4F6" }} />
      <View style={{ position: "absolute", top: pad, left: 0, right: 0, height: 1, backgroundColor: "#F3F4F6" }} />
      <View style={{ position: "absolute", bottom: pad, left: 0, right: 0, height: 1, backgroundColor: "#F3F4F6" }} />
      {/* area fill under curve */}
      {splinePoints.map((p, i) => (
        <View
          key={`fill-${i}`}
          style={{
            position: 'absolute',
            left: p.x,
            top: Math.min(p.y, height - pad),
            width: 1,
            height: Math.max(0, height - pad - p.y),
            backgroundColor: color,
            opacity: 0.18,
          }}
        />
      ))}
      {showDayTicks && (
        <>
          {points.map((p, i) => {
            const day = i + 1;
            if (!(day % 5 === 0 || day === values.length)) return null;
            return (
              <View key={`tick-${i}`} style={{ position: 'absolute', left: p.x - 0.5, bottom: 0, width: 1, height: 6, backgroundColor: '#9CA3AF' }} />
            );
          })}
          {points.map((p, i) => {
            const day = i + 1;
            if (!(day % 5 === 0 || day === values.length)) return null;
            return (
              <Text key={`label-${i}`} style={{ position: 'absolute', left: p.x - 8, bottom: 6, fontSize: 10, color: '#6B7280' }}>{day}</Text>
            );
          })}
        </>
      )}
      {/* smooth curve segments */}
      {splinePoints.map((p, i) => {
        if (i === 0) return null;
        const prev = splinePoints[i - 1];
        return (
          <View
            key={`sseg-${i}`}
            style={{
              position: "absolute",
              left: Math.min(prev.x, p.x),
              top: Math.min(prev.y, p.y),
              width: Math.max(1, Math.hypot(p.x - prev.x, p.y - prev.y)),
              height: 2,
              backgroundColor: color,
              opacity: 0.95,
              transform: [
                { rotateZ: `${Math.atan2(p.y - prev.y, p.x - prev.x)}rad` },
              ],
            }}
          />
        );
      })}
      {/* points */}
      {points.map((p, i) => (
        <View
          key={`pt-${i}`}
          style={{
            position: "absolute",
            left: p.x - 3,
            top: p.y - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

function MonthSelector({ month, setMonth }: { month: MonthIndex; setMonth: (m: MonthIndex) => void }) {
  const names = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  return (
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-gray-600">Mois: {names[month]}</Text>
      <View className="flex-row gap-3">
        <Pressable onPress={() => setMonth((Math.max(0, month - 1) as MonthIndex))} className="px-3 py-1 rounded-full bg-gray-200">
          <Text>Préc.</Text>
        </Pressable>
        <Pressable onPress={() => setMonth((Math.min(11, month + 1) as MonthIndex))} className="px-3 py-1 rounded-full bg-gray-200">
          <Text>Suiv.</Text>
        </Pressable>
      </View>
    </View>
  );
}
    