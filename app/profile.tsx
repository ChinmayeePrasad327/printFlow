import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Switch } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Button } from '../components/Button';

export default function Profile() {
  const { colors } = useTheme();
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const { scheme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 16 }}>
        <Card>
          <Text style={{ color: colors.textPrimary, fontSize: 18 }}>{user?.firstName} {user?.lastName}</Text>
          <Text style={{ color: colors.textSecondary }}>{user?.primaryEmailAddress || user?.emailAddresses?.[0]?.emailAddress}</Text>
        </Card>

        <View style={{ height: 12 }} />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.textPrimary }}>Dark Mode</Text>
            <Switch value={scheme === 'dark'} onValueChange={toggleTheme} />
          </View>
        </Card>

        <View style={{ height: 12 }} />
        <Button title="Sign Out" onPress={()=> signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex:1 } });
