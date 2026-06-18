import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { OrdersService } from '../../services/orders';
import { Card } from '../../components/Card';
import { useRouter } from 'expo-router';
import Animated, { Layout } from 'react-native-reanimated';
import { useSocket } from '../contexts/SocketContext';

export default function Orders() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => { (async ()=>{
    try { const o = await OrdersService.list(); setOrders(o || []);} catch(e){console.warn(e)}
  })(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handlers:any = {};
    handlers.order_ready = (payload:any) => {
      setOrders(prev => prev.map(p => (p._id === payload.orderId ? { ...p, status: 'ready' } : p)));
    };
    handlers.order_printing = (payload:any) => {
      setOrders(prev => prev.map(p => (p._id === payload.orderId ? { ...p, status: 'printing' } : p)));
    };
    handlers.order_collected = (payload:any) => {
      setOrders(prev => prev.map(p => (p._id === payload.orderId ? { ...p, status: 'collected' } : p)));
    };

    Object.entries(handlers).forEach(([k,h]) => socket.on(k, h));
    return () => { Object.entries(handlers).forEach(([k,h]) => socket.off(k, h)); };
  }, [socket]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingBottom: 80 }]}> 
      <FlatList data={orders} keyExtractor={(it:any)=> it._id || it.id} contentContainerStyle={{padding:16}} renderItem={({item})=> (
        <Pressable onPress={() => router.push(`/orders/${item._id || item.id}`)}>
          <Animated.View layout={Layout}>
            <Card style={{ marginBottom:12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600'}}>{item.title || `Order ${item._id || item.id}`}</Text>
              <Text style={{ color: colors.textSecondary }}>{item.status} • {item.printerName || '—'}</Text>
            </Card>
          </Animated.View>
        </Pressable>
      )} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex:1 } });
