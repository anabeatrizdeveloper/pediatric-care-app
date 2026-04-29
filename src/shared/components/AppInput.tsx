import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

type Props = TextInputProps;

export const AppInput = (props: Props) => {
  return <TextInput style={styles.input} placeholderTextColor="#8A97AA" {...props} />;
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    color: '#102033',
    fontFamily: 'Inter_400Regular',
  },
});