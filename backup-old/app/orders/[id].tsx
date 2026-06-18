import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { OrdersService } from '../../services/orders';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { Card } from '../../components/Card';

export default function OrderDetails() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const id = (params.id as string) || params['id'];
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    (async ()=>{
      try { const o = await OrdersService.get(id); setOrder(o); } catch(e){console.warn(e)}
    })();
  }, [id]);

  const progress = useSharedValue(0);
  useEffect(()=>{ if (order) progress.value = withTiming(1, { duration: 400 }); }, [order]);
  const aStyle = useAnimatedStyle(()=> ({ opacity: progress.value, transform: [{ translateY: (1-progress.value)*8 }] }));

  if (!order) return (<SafeAreaView style={[styles.container,{backgroundColor: colors.background}]}><Text style={{color: colors.textSecondary, padding:16}}>Loading...</Text></SafeAreaView>);

  const steps = [
    { key: 'pending', title: 'Pending', time: order.createdAt },
    { key: 'accepted', title: 'Accepted', time: order.acceptedAt },
    { key: 'printing', title: 'Printing', time: order.printingAt },
    { key: 'ready', title: 'Ready', time: order.readyAt },
    { key: 'collected', title: 'Collected', time: order.collectedAt }
  ];

  return (
    <SafeAreaView style={[styles.container,{backgroundColor: colors.background}]}> 
      <ScrollView contentContainerStyle={{ padding:16 }}>
        <Animated.View style={aStyle}>
          <Card>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{order.fileName}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Printer: {order.printerId?.name || order.printerName || '—'}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Queue Position: {order.queuePosition}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>ETA: {order.eta || '—'}</Text>
          </Card>

          <View style={{height:12}} />
          <Card>
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Progress</Text>
            {steps.map(s => (
              <View key={s.key} style={{ flexDirection:'row', alignItems:'center', paddingVertical:10 }}>
                <View style={{ width:10, height:10, borderRadius:5, backgroundColor: order.status === s.key || (order.status === 'ready' && s.key !== 'collected') ? colors.primary : colors.border, marginRight:12 }} />
                <View>
                  <Text style={{ color: colors.textPrimary }}>{s.title}</Text>
                  {s.time && <Text style={{ color: colors.textSecondary, fontSize:12 }}>{new Date(s.time).toLocaleString()}</Text>}
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex:1 } });
