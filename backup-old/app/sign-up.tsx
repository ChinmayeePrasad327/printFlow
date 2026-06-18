import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { SignUp } from '@clerk/clerk-expo';
import { useTheme } from '../hooks/useTheme';

export default function SignUpScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        <SignUp routing="path" signUpUrl="/sign-up" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 16 }
});
