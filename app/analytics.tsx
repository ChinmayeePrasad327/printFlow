import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import Svg, { Path, Rect } from 'react-native-svg';
import { Card } from '../components/Card';

export default function Analytics() {
  const { colors } = useTheme();
  // simple sparkline example
  const path = 'M0 40 L20 20 L40 30 L60 10 L80 25 L100 5';
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 16 }}>
        <Card>
          <Text style={{ color: colors.textPrimary, fontSize: 18 }}>Orders (30d)</Text>
          <Svg width="100%" height={120} viewBox="0 0 100 40">
            <Rect x="0" y="0" width="100" height="40" fill="none" />
            <Path d={path} stroke={colors.primary} strokeWidth={2} fill="none" />
          </Svg>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex:1 } });
