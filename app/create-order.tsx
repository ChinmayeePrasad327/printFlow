import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, ActivityIndicator, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UploadService } from '../services/upload';
import { OrdersService } from '../services/orders';
import { useSocket } from './contexts/SocketContext';
import { useRouter } from 'expo-router';
import SuccessCheck from './components/SuccessCheck';

export default function CreateOrder() {
  const { colors } = useTheme();
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const { socket } = useSocket();
  const router = useRouter();

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.type === 'success') setFile(res);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const form = new FormData();
      // @ts-ignore
      form.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });
      const uploaded = await UploadService.uploadFile(form, (ev:any)=>{
        try{
          const p = Math.round((ev.loaded / ev.total) * 100);
          setProgress(p);
        }catch(e){}
      });

      const payload = {
        printerId: uploaded.printerId || null,
        fileName: file.name,
        fileUrl: uploaded.url || uploaded.fileUrl,
        totalPages: uploaded.totalPages || 1,
        copies: 1,
        priorityLevel: 'standard'
      };

      const order = await OrdersService.create(payload);

      try { socket?.emit('create_order', { orderId: order._id || order.id, userId: order.userId }); } catch (e) { }

      setSuccess(true);
      setTimeout(()=>{
        setSuccess(false);
        router.push(`/orders/${order._id || order.id}`);
      }, 1200);

    } catch (e) { console.warn(e); }
    setUploading(false);
    setProgress(0);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 16 }}>
        <Card>
          <Text style={{ color: colors.textPrimary, fontSize: 18 }}>Select Document</Text>
          <View style={{height:12}} />
          <Pressable onPress={pick} style={{ padding:12, borderRadius:12, borderWidth:1, borderColor: colors.border }} accessibilityLabel="Choose document">
            <Text style={{ color: colors.textSecondary }}>{file ? file.name : 'Choose a file'}</Text>
          </Pressable>
          <View style={{height:12}} />
          <Button title={uploading ? `Uploading ${progress}%` : 'Upload & Create Order'} onPress={upload} disabled={uploading} />
          {uploading && <ActivityIndicator style={{ marginTop: 12 }} />}
        </Card>
      </View>

      <Modal visible={success} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.3)', alignItems:'center', justifyContent:'center' }}>
          <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 12 }}>
            <SuccessCheck />
            <View style={{ height: 12 }} />
            <Text style={{ color: colors.textPrimary, textAlign: 'center', fontWeight: '600' }}>Order Created</Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex:1 } });
