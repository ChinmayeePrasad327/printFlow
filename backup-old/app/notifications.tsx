import React from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSocket } from './contexts/SocketContext';
import { useTheme } from '../hooks/useTheme';

export default function Notifications() {
  const { notifications } = useSocket();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 18 }}>Notifications</Text>
      </View>
      <FlatList data={notifications} keyExtractor={(it:any)=> it._id || it.id || JSON.stringify(it.createdAt)} renderItem={({item})=> (
        <View style={{ padding: 16, borderBottomWidth:1, borderColor: colors.border }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.title}</Text>
          <Text style={{ color: colors.textSecondary }}>{item.message || item.messageText || JSON.stringify(item.meta)}</Text>
          <Text style={{ color: colors.textSecondary, fontSize:11 }}>{new Date(item.createdAt || item.created_at || Date.now()).toLocaleString()}</Text>
        </View>
      )} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex:1 } });
