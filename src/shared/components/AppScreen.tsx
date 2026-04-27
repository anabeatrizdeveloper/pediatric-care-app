import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

type Props = {
  children: React.ReactNode;
};

export const AppScreen = ({ children }: Props) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});