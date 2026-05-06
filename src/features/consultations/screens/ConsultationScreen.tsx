import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  Plus,
  Search,
  Stethoscope,
  Trash2,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Consultation,
  deleteConsultation,
  getChildren,
  getConsultations,
  saveConsultation,
} from '../../../shared/services/localCareStorage';

const examOptions = [
  'Hemograma',
  'Urina',
  'Fezes',
  'Glicemia',
  'Colesterol',
  'Ferro / Ferritina',
  'Vitamina D',
  'TSH / Tireoide',
  'Raio-X',
  'Ultrassom',
  'Outro',
];

const monthOptions = [
  '01/2026',
  '02/2026',
  '03/2026',
  '04/2026',
  '05/2026',
  '06/2026',
  '07/2026',
  '08/2026',
  '09/2026',
  '10/2026',
  '11/2026',
  '12/2026',
];

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

export const ConsultationsScreen = () => {
  const navigation = useNavigation<any>();

  const [childId, setChildId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [query, setQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Consultation | null>(null);

  const [doctorName, setDoctorName] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [customExam, setCustomExam] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [requestedActions, setRequestedActions] = useState('');
  const [notes, setNotes] = useState('');

  const [showConsultationDatePicker, setShowConsultationDatePicker] = useState(false);
  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);

  const loadData = async () => {
    const children = await getChildren();
    const activeChild = children[0];

    if (!activeChild) return;

    setChildId(activeChild.id);

    const data = await getConsultations();
    setConsultations(data.filter((item) => item.childId === activeChild.id));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filteredConsultations = useMemo(() => {
    return consultations.filter((item) => {
      const searchText = `${item.doctorName} ${item.consultationDate} ${item.requestedExams} ${item.notes}`.toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());

      const matchesMonth = monthFilter
        ? item.consultationDate.endsWith(monthFilter)
        : true;

      return matchesQuery && matchesMonth;
    });
  }, [consultations, query, monthFilter]);

  const resetForm = () => {
    setDoctorName('');
    setConsultationDate('');
    setFollowUpDate('');
    setSelectedExam('');
    setCustomExam('');
    setMealPlan('');
    setRequestedActions('');
    setNotes('');
  };

  const handleSave = async () => {
    if (!childId || !doctorName.trim() || !consultationDate.trim()) return;

    const requestedExams = selectedExam === 'Outro' ? customExam : selectedExam;

    await saveConsultation({
      id: String(Date.now()),
      childId,
      doctorName,
      consultationDate,
      requestedExams,
      mealPlan,
      requestedActions,
      followUpDate,
      notes,
      createdAt: new Date().toISOString(),
    });

    resetForm();
    setModalVisible(false);
    loadData();
  };

  const openDeleteModal = (item: Consultation) => {
    setSelectedToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedToDelete) return;

    await deleteConsultation(selectedToDelete.id);

    setDeleteModalVisible(false);
    setSelectedToDelete(null);
    loadData();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Consultas</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Stethoscope size={28} color="#845EF7" />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>Últimas consultas</Text>
            <Text style={styles.heroText}>
              Guarde orientações médicas, exames solicitados, cardápios e próximos retornos.
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color="#6B7A90" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por médica, exame ou data..."
            placeholderTextColor="#9AA6B5"
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.monthButton} onPress={() => setMonthModalVisible(true)}>
            <CalendarDays size={16} color="#845EF7" />
            <Text style={styles.monthButtonText}>
              {monthFilter ? `Mês: ${monthFilter}` : 'Filtrar por mês'}
            </Text>
          </TouchableOpacity>

          {monthFilter ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => setMonthFilter('')}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar consulta</Text>
        </TouchableOpacity>

        {filteredConsultations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhuma consulta encontrada</Text>
            <Text style={styles.emptyText}>Cadastre uma consulta ou ajuste os filtros.</Text>
          </View>
        ) : (
          filteredConsultations.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.consultationCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ConsultationDetails', { consultationId: item.id })}
              onLongPress={() => openDeleteModal(item)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <ClipboardList size={22} color="#845EF7" />
                </View>

                <View style={styles.cardTitleBox}>
                  <Text style={styles.doctorName}>{item.doctorName}</Text>
                  <Text style={styles.consultationDate}>Consulta em {item.consultationDate}</Text>
                </View>
              </View>

              <InfoBlock title="Exames solicitados" value={item.requestedExams} />
              <InfoBlock title="Próximo retorno" value={item.followUpDate} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={monthModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.monthPickerCard}>
            <Text style={styles.monthPickerTitle}>Selecionar mês</Text>

            <ScrollView
              style={styles.monthWheel}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.monthWheelContent}
            >
              {monthOptions.map((month) => {
                const selected = monthFilter === month;

                return (
                  <TouchableOpacity
                    key={month}
                    style={[styles.monthWheelItem, selected && styles.monthWheelItemActive]}
                    onPress={() => {
                      setMonthFilter(month);
                      setMonthModalVisible(false);
                    }}
                  >
                    <Text style={[styles.monthWheelText, selected && styles.monthWheelTextActive]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.cancelPickerButton} onPress={() => setMonthModalVisible(false)}>
              <Text style={styles.cancelPickerText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIconBox}>
              <Trash2 size={28} color="#FF3B30" />
            </View>

            <Text style={styles.deleteTitle}>Apagar consulta?</Text>
            <Text style={styles.deleteText}>
              Deseja apagar permanentemente essa consulta do histórico?
            </Text>

            <TouchableOpacity style={styles.deleteOption} onPress={confirmDelete}>
              <Trash2 size={20} color="#FF3B30" />
              <Text style={styles.deleteOptionText}>Deletar permanentemente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepOption}
              onPress={() => {
                setDeleteModalVisible(false);
                setSelectedToDelete(null);
              }}
            >
              <Check size={20} color="#58CDAF" />
              <Text style={styles.keepOptionText}>Manter consulta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => setModalVisible(false)}>
                <ArrowLeft size={22} color="#142033" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Nova consulta</Text>
            </View>

            <Input label="MÉDICA / PEDIATRA" value={doctorName} onChangeText={setDoctorName} placeholder="Ex: Dra. Mariana Lopes" />

            <Text style={styles.inputLabel}>DATA DA CONSULTA</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowConsultationDatePicker(true)}>
              <Text style={[styles.dateInputText, !consultationDate && styles.placeholderText]}>
                {consultationDate || 'Selecionar data'}
              </Text>
              <CalendarDays size={20} color="#845EF7" />
            </TouchableOpacity>

            {showConsultationDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                accentColor="#845EF7"
                positiveButton={{ label: 'OK', textColor: '#845EF7' }}
                negativeButton={{ label: 'Cancelar', textColor: '#845EF7' }}
                onChange={(_event, date) => {
                  if (Platform.OS === 'android') setShowConsultationDatePicker(false);
                  if (date) setConsultationDate(formatDate(date));
                }}
              />
            )}

            <Text style={styles.inputLabel}>EXAME SOLICITADO</Text>
            <View style={styles.examOptions}>
              {examOptions.map((exam) => (
                <TouchableOpacity
                  key={exam}
                  style={[styles.examChip, selectedExam === exam && styles.examChipActive]}
                  onPress={() => setSelectedExam(exam)}
                >
                  <Text style={[styles.examChipText, selectedExam === exam && styles.examChipTextActive]}>
                    {exam}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedExam === 'Outro' && (
              <Input label="QUAL EXAME?" value={customExam} onChangeText={setCustomExam} placeholder="Digite o nome do exame" />
            )}

            <Input label="CARDÁPIO / ORIENTAÇÕES ALIMENTARES" value={mealPlan} onChangeText={setMealPlan} placeholder="Ex: aumentar proteína, reduzir açúcar..." multiline />
            <Input label="O QUE FOI SOLICITADO FAZER" value={requestedActions} onChangeText={setRequestedActions} placeholder="Ex: observar febre, enviar exames..." multiline />

            <Text style={styles.inputLabel}>QUANDO REMARCAR / RETORNO</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowFollowUpDatePicker(true)}>
              <Text style={[styles.dateInputText, !followUpDate && styles.placeholderText]}>
                {followUpDate || 'Selecionar data de retorno'}
              </Text>
              <CalendarDays size={20} color="#845EF7" />
            </TouchableOpacity>

            {showFollowUpDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                accentColor="#845EF7"
                positiveButton={{ label: 'OK', textColor: '#845EF7' }}
                negativeButton={{ label: 'Cancelar', textColor: '#845EF7' }}
                onChange={(_event, date) => {
                  if (Platform.OS === 'android') setShowFollowUpDatePicker(false);
                  if (date) setFollowUpDate(formatDate(date));
                }}
              />
            )}

            <Input label="OBSERVAÇÕES" value={notes} onChangeText={setNotes} placeholder="Outras informações importantes..." multiline />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar consulta</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const InfoBlock = ({ title, value }: { title: string; value: string }) => {
  if (!value?.trim()) return null;

  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
};

const Input = ({ label, value, onChangeText, placeholder, multiline }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA6B5"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  modalContainer: { flex: 1, backgroundColor: '#F7F9FC' },
  modalContent: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  headerTitle: { color: '#142033', fontSize: 24, fontWeight: '900' },

  heroCard: {
    backgroundColor: '#EEE9FF',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  heroTextBox: { flex: 1 },
  heroTitle: { color: '#142033', fontSize: 20, fontWeight: '900', marginBottom: 5 },
  heroText: { color: '#6B7A90', fontSize: 14, lineHeight: 20, fontWeight: '600' },

  searchBox: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#142033', fontSize: 15, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },

  monthButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#EEE9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  monthButtonText: { color: '#845EF7', fontSize: 13, fontWeight: '900' },
  clearButton: {
    height: 46,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: { color: '#6B7A90', fontSize: 13, fontWeight: '900' },

  addButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: '#845EF7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 22,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },

  emptyBox: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22 },
  emptyTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  emptyText: { color: '#6B7A90', fontSize: 14, lineHeight: 20 },

  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EEE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitleBox: { flex: 1 },
  doctorName: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 3 },
  consultationDate: { color: '#6B7A90', fontSize: 14, fontWeight: '700' },

  infoBlock: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  infoTitle: {
    color: '#845EF7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  infoText: { color: '#142033', fontSize: 15, lineHeight: 21, fontWeight: '600' },

  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  input: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    color: '#142033',
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: { minHeight: 112, paddingTop: 14 },
  dateInput: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: { color: '#142033', fontSize: 16, fontWeight: '600' },
  placeholderText: { color: '#9AA6B5' },

  examOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  examChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
  },
  examChipActive: { backgroundColor: '#845EF7' },
  examChipText: { color: '#142033', fontSize: 13, fontWeight: '800' },
  examChipTextActive: { color: '#FFFFFF' },

  saveButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: '#845EF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,32,51,0.28)',
    justifyContent: 'center',
    padding: 24,
  },
  monthPickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
  },
  monthPickerTitle: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  monthWheel: {
    maxHeight: 250,
  },
  monthWheelContent: {
    paddingVertical: 12,
  },
  monthWheelItem: {
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthWheelItemActive: {
    backgroundColor: '#EEE9FF',
  },
  monthWheelText: {
    color: '#B7AECF',
    fontSize: 18,
    fontWeight: '800',
  },
  monthWheelTextActive: {
    color: '#845EF7',
    fontSize: 24,
    fontWeight: '900',
  },
  cancelPickerButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelPickerText: {
    color: '#6B7A90',
    fontSize: 15,
    fontWeight: '900',
  },

  deleteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
  },
  deleteIconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deleteTitle: {
    color: '#142033',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 6,
  },
  deleteText: {
    color: '#6B7A90',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  deleteOption: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 10,
  },
  deleteOptionText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '900',
  },
  keepOption: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E6F7EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  keepOptionText: {
    color: '#58CDAF',
    fontSize: 15,
    fontWeight: '900',
  },
});