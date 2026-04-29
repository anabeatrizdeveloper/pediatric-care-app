import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Thermometer, Apple, Moon, Pill } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  HealthRecordType,
  saveRecord,
} from '../../../shared/services/localCareStorage';

const labels: Record<HealthRecordType, string> = {
  symptom: 'Registrar sintoma',
  food: 'Registrar alimentação',
  sleep: 'Registrar sono',
  medicine: 'Registrar remédio',
};

const subtitles: Record<HealthRecordType, string> = {
  symptom: 'Sintomas',
  food: 'Alimentação',
  sleep: 'Sono',
  medicine: 'Medicamento',
};

export const CreateSymptomScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const type = (route.params?.type ?? 'symptom') as HealthRecordType;
  const childId = route.params?.childId;
  const childName = route.params?.childName ?? 'criança';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const icon = useMemo(() => {
    if (type === 'food') return <Apple size={28} color="#40CFA0" />;
    if (type === 'sleep') return <Moon size={28} color="#7B5FD6" />;
    if (type === 'medicine') return <Pill size={28} color="#2F89E8" />;
    return <Thermometer size={28} color="#FF3B30" />;
  }, [type]);

  const bg = {
    symptom: '#FFE1E3',
    food: '#DFF9EF',
    sleep: '#E8DFFD',
    medicine: '#DFF0FF',
  }[type];

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Perfil não encontrado', 'Cadastre uma criança primeiro.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'Digite um título para o registro.');
      return;
    }

    const now = new Date();

    await saveRecord({
      id: String(Date.now()),
      childId,
      type,
      title,
      description: description || subtitles[type],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString(),
      checked: type === 'food' || type === 'medicine',
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{labels[type]}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: bg }]}>
          <View style={styles.summaryIcon}>{icon}</View>
          <View>
            <Text style={styles.summaryTitle}>{subtitles[type]} de {childName}</Text>
            <Text style={styles.summaryText}>Agora · novo registro</Text>
          </View>
        </View>

        <Text style={styles.label}>TÍTULO</Text>
        <TextInput
          style={styles.inputBox}
          value={title}
          onChangeText={setTitle}
          placeholder={
            type === 'symptom'
              ? 'Ex: Febre 37,8°'
              : type === 'food'
                ? 'Ex: Café da manhã'
                : type === 'sleep'
                  ? 'Ex: Sono noturno'
                  : 'Ex: Paracetamol 5ml'
          }
          placeholderTextColor="#9AA6B5"
        />

        <Text style={styles.label}>OBSERVAÇÕES</Text>
        <TextInput
          style={[styles.inputBox, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Adicione detalhes importantes..."
          placeholderTextColor="#9AA6B5"
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar registro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2F7',
    alignItems: 'center', justifyContent: 'center', marginRight: 18,
  },
  headerTitle: { color: '#142033', fontSize: 22, fontWeight: '900' },
  summaryCard: {
    borderRadius: 24, padding: 20, flexDirection: 'row',
    alignItems: 'center', gap: 16, marginBottom: 30,
  },
  summaryIcon: {
    width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  summaryText: { color: '#6B7A90', fontSize: 14, fontWeight: '600' },
  label: {
    color: '#6B7A90', fontSize: 13, fontWeight: '900',
    letterSpacing: 1.2, marginBottom: 8,
  },
  inputBox: {
    minHeight: 58, borderRadius: 18, backgroundColor: '#EEF2F7',
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 18,
    color: '#142033', fontSize: 16,
  },
  textArea: { minHeight: 130, textAlignVertical: 'top' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 18, paddingBottom: 28,
    backgroundColor: 'rgba(247,249,252,0.96)',
  },
  saveButton: {
    height: 62, borderRadius: 20, backgroundColor: '#3D7DF0',
    alignItems: 'center', justifyContent: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
});