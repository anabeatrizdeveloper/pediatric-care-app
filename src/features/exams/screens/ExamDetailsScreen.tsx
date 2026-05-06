import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const ExamDetailsScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={22} color="#142033" />
      </TouchableOpacity>

      <Text style={styles.title}>Detalhes do exame</Text>
      <Text style={styles.subtitle}>Essa tela será preenchida com o PDF e comparação dos exames.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#142033',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7A90',
    fontSize: 15,
    lineHeight: 22,
  },
});