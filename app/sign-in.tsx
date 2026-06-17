import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { SignIn } from '@clerk/clerk-expo';
import { useTheme } from '../hooks/useTheme';

export default function SignInScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        <SignIn routing="path" signInUrl="/sign-in" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 16 }
});
