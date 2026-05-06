import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, CalendarDays, Check, Edit3 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  Consultation,
  getConsultationById,
  updateConsultation,
} from '../../../shared/services/localCareStorage';

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

export const ConsultationDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const consultationId = route.params?.consultationId as string;

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [doctorName, setDoctorName] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [requestedExams, setRequestedExams] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [requestedActions, setRequestedActions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  const [showConsultationPicker, setShowConsultationPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getConsultationById(consultationId);

      if (!data) return;

      setConsultation(data);
      setDoctorName(data.doctorName);
      setConsultationDate(data.consultationDate);
      setRequestedExams(data.requestedExams);
      setMealPlan(data.mealPlan);
      setRequestedActions(data.requestedActions);
      setFollowUpDate(data.followUpDate);
      setNotes(data.notes);
    };

    load();
  }, [consultationId]);

  const handleSave = async () => {
    if (!consultation) return;

    const updated: Consultation = {
      ...consultation,
      doctorName,
      consultationDate,
      requestedExams,
      mealPlan,
      requestedActions,
      followUpDate,
      notes,
    };

    await updateConsultation(updated);

    setConsultation(updated);
    setIsEditing(false);

    Alert.alert('Sucesso', 'Consulta atualizada!');
  };

  if (!consultation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando consulta...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.title}>Consulta</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? (
              <Check size={22} color="#FFFFFF" />
            ) : (
              <Edit3 size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <Field label="PEDIATRA" value={doctorName} setValue={setDoctorName} editable={isEditing} />

        <DateField
          label="DATA DA CONSULTA"
          value={consultationDate}
          editable={isEditing}
          onPress={() => setShowConsultationPicker(true)}
        />

        {showConsultationPicker && isEditing && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            accentColor="#845EF7"
            positiveButton={{ label: 'OK', textColor: '#845EF7' }}
            negativeButton={{ label: 'Cancelar', textColor: '#845EF7' }}
            onChange={(_, date) => {
              if (Platform.OS === 'android') setShowConsultationPicker(false);
              if (date) setConsultationDate(formatDate(date));
            }}
          />
        )}

        <Field label="EXAMES" value={requestedExams} setValue={setRequestedExams} editable={isEditing} multiline />
        <Field label="CARDÁPIO" value={mealPlan} setValue={setMealPlan} editable={isEditing} multiline />
        <Field label="ORIENTAÇÕES" value={requestedActions} setValue={setRequestedActions} editable={isEditing} multiline />

        <DateField
          label="RETORNO"
          value={followUpDate}
          editable={isEditing}
          onPress={() => setShowReturnPicker(true)}
        />

        {showReturnPicker && isEditing && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            accentColor="#845EF7"
            positiveButton={{ label: 'OK', textColor: '#845EF7' }}
            negativeButton={{ label: 'Cancelar', textColor: '#845EF7' }}
            onChange={(_, date) => {
              if (Platform.OS === 'android') setShowReturnPicker(false);
              if (date) setFollowUpDate(formatDate(date));
            }}
          />
        )}

        <Field label="OBSERVAÇÕES" value={notes} setValue={setNotes} editable={isEditing} multiline />
      </ScrollView>
    </View>
  );
};

const Field = ({ label, value, setValue, editable, multiline }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea, !editable && styles.disabled]}
      value={value}
      onChangeText={setValue}
      editable={editable}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      placeholder="Não informado"
      placeholderTextColor="#9AA6B5"
    />
  </View>
);

const DateField = ({ label, value, editable, onPress }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <TouchableOpacity
      style={[styles.input, styles.dateInput, !editable && styles.disabled]}
      onPress={onPress}
      disabled={!editable}
    >
      <Text style={styles.dateText}>{value || 'Selecionar data'}</Text>
      <CalendarDays size={20} color="#845EF7" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7A90',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: '#142033',
  },
  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#845EF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7A90',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#EEF2F7',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: '#142033',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 90,
  },
  disabled: {
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#142033',
    fontWeight: '600',
  },
});