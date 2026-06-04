import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getTimeOfDay, TIME_PALETTE } from '../utils/time';

interface BackgroundProps {
  children: React.ReactNode;
}

export default function Background({ children }: BackgroundProps) {
  const tod = getTimeOfDay();
  const p = TIME_PALETTE[tod];

  return (
    <View style={[styles.root, { backgroundColor: p.sky }]}>
      <View style={[styles.ground, { backgroundColor: p.ground }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
});
