import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Apple, Moon, Pill, Thermometer } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  getRecords,
  HealthRecord,
} from '../../../shared/services/localCareStorage';

export const DiaryScreen = () => {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const data = await getRecords();
        setRecords(data);
      };

      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Registros anteriores</Text>
        </View>

        {records.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum registro encontrado</Text>
            <Text style={styles.emptyText}>Os registros criados aparecerão aqui.</Text>
          </View>
        ) : (
          records.map((record) => <RecordCard key={record.id} record={record} />)
        )}
      </ScrollView>
    </View>
  );
};

const RecordCard = ({ record }: { record: HealthRecord }) => {
  const config = {
    symptom: { icon: <Thermometer size={22} color="#FF3B30" />, bg: '#FFE1E3', label: 'Sintoma' },
    food: { icon: <Apple size={22} color="#40CFA0" />, bg: '#DFF9EF', label: 'Alimentação' },
    sleep: { icon: <Moon size={22} color="#7B5FD6" />, bg: '#E8DFFD', label: 'Sono' },
    medicine: { icon: <Pill size={22} color="#2F89E8" />, bg: '#DFF0FF', label: 'Remédio' },
  }[record.type];

  return (
    <View style={styles.recordCard}>
      <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
        {config.icon}
      </View>

      <View style={styles.recordTextBox}>
        <Text style={styles.recordType}>{config.label}</Text>
        <Text style={styles.recordTitle}>{record.title}</Text>
        <Text style={styles.recordDescription}>{record.time} · {record.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2F7',
    alignItems: 'center', justifyContent: 'center', marginRight: 18,
  },
  headerTitle: { color: '#142033', fontSize: 23, fontWeight: '900' },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
  },
  emptyTitle: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6B7A90',
    fontSize: 14,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recordTextBox: {
    flex: 1,
  },
  recordType: {
    color: '#2F89E8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  recordTitle: {
    color: '#142033',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 3,
  },
  recordDescription: {
    color: '#6B7A90',
    fontSize: 14,
  },
});