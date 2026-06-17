import React from 'react';
import { Slot, Link, useRouter } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AnimatedSplash } from '../components/AnimatedSplash';
import * as Font from 'expo-font';
import { StatusBar, View, StyleSheet, Text, Pressable, SafeAreaView } from 'react-native';

// Clerk
import { ClerkProvider } from '@clerk/clerk-expo';
import { useClerkSync } from '../hooks/useClerkSync';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { NotificationBanner } from './components/NotificationBanner';

function AuthSyncHandler() {
  useClerkSync();
  return null;
}

function BottomTabs() {
  const router = useRouter();
  const { colors } = useTheme();
  const { unreadCount } = useSocket();

  return (
    <SafeAreaView style={{backgroundColor: colors.surface}}>
      <View style={[styles.tabBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.push('/')} style={styles.tab} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home-outline" size={22} color={colors.textPrimary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Home</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/orders')} style={styles.tab} accessibilityLabel="Orders">
          <MaterialCommunityIcons name="printer-3" size={22} color={colors.textPrimary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Orders</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/create-order')} style={styles.fab} accessibilityLabel="Create order">
          <View style={[styles.fabInner, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/notifications')} style={styles.tab} accessibilityLabel="Notifications">
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Notifs</Text>
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: 6, right: 30, backgroundColor: '#EF4444', paddingHorizontal:6, paddingVertical:2, borderRadius:8 }}>
              <Text style={{ color: '#fff', fontSize: 10 }}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/profile')} style={styles.tab} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account-circle" size={22} color={colors.textPrimary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      await Font.loadAsync({
        SpaceGrotesk_600SemiBold: require('../assets/fonts/SpaceGrotesk-SemiBold.ttf'),
        SpaceGrotesk_700Bold: require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
        Inter_400Regular: require('../assets/fonts/Inter-Regular.ttf'),
        Inter_600SemiBold: require('../assets/fonts/Inter-SemiBold.ttf')
      });
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return <AnimatedSplash />;
  }

  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ThemeProvider>
        <AuthSyncHandler />
        <StatusBar />
        <View style={{ flex: 1 }}>
          <SocketProvider>
            <Slot />
              <NotificationBanner />
              <BottomTabs />
            </SocketProvider>
          </View>
      </ThemeProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4
  },
  fab: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -28 }],
    top: -28
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  }
});
