import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { Typography } from '../constants/typography';
import { PrintersService } from '../services/printers';
import { OrdersService } from '../services/orders';
import Animated, { Layout, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function Home() {
  const { colors } = useTheme();
  const [printers, setPrinters] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const p = await PrintersService.list();
      setPrinters(p || []);
      const o = await OrdersService.list();
      setOrders(o || []);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingBottom: 80 }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Good Morning</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Welcome to PrintFlow</Text>

        <Animated.View layout={Layout} style={{ marginTop: 16 }}>
          <Card style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: Typography.fonts.heading, fontSize: Typography.sizes.lg, color: colors.textPrimary }}>Quick Actions</Text>
            <View style={{ height: 12 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={() => router.push('/create-order')}>
                  <Card style={{ padding: 12, width: 140 }}>
                    <Text style={{ color: colors.textPrimary }}>Create Order</Text>
                  </Card>
                </Pressable>
                <Pressable onPress={() => router.push('/orders')}>
                  <Card style={{ padding: 12, width: 140 }}>
                    <Text style={{ color: colors.textPrimary }}>Nearby Printers</Text>
                  </Card>
                </Pressable>
                <Pressable onPress={() => router.push('/orders')}>
                  <Card style={{ padding: 12, width: 140 }}>
                    <Text style={{ color: colors.textPrimary }}>My Queues</Text>
                  </Card>
                </Pressable>
              </View>
            </ScrollView>
          </Card>

          <Card style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: Typography.fonts.heading, fontSize: Typography.sizes.md, color: colors.textPrimary }}>Nearby Printers</Text>
            <FlatList data={printers} keyExtractor={(it:any)=>it._id || it.id} renderItem={({item})=> (
              <View style={{paddingVertical:10}}>
                <Text style={{ color: colors.textPrimary }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.location}</Text>
              </View>
            )} />
          </Card>

          <Card>
            <Text style={{ fontFamily: Typography.fonts.heading, fontSize: Typography.sizes.md, color: colors.textPrimary }}>Recent Orders</Text>
            {orders.slice(0,3).map((o:any)=> (
              <Pressable key={o._id || o.id} onPress={() => router.push(`/orders/${o._id || o.id}`)}>
                <View style={{paddingVertical:10}}>
                  <Text style={{ color: colors.textPrimary }}>{o.title || `Order ${o._id || o.id}`}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{o.status}</Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontFamily: Typography.fonts.heading },
  sub: { marginTop: 4 }
});
