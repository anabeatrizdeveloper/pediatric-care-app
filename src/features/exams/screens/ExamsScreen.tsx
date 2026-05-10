import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  FileText,
  Filter,
  FlaskConical,
  Plus,
  Search,
  Trash2,
} from 'lucide-react-native';
import {
  deleteExam,
  Exam,
  ExamReason,
  getChildren,
  getExams,
} from '../../../shared/services/localCareStorage';

const GREEN = '#58CDAF';
const GREEN_BG = '#E6F7EC';

const reasonOptions: ExamReason[] = [
  'Rotina',
  'Acompanhamento',
  'Episódio de doença',
  'Investigação',
];

const formatDate = (iso: string) => {
  if (!iso) return 'Data não informada';
  return new Date(iso).toLocaleDateString('pt-BR');
};

export const ExamsScreen = () => {
  const navigation = useNavigation<any>();

  const [exams, setExams] = useState<Exam[]>([]);
  const [query, setQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<ExamReason | ''>('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Exam | null>(null);

  const loadData = async () => {
    const children = await getChildren();
    const activeChild = children[0];

    if (!activeChild) return;

    const data = await getExams();
    setExams(data.filter((item) => item.childId === activeChild.id));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filteredExams = useMemo(() => {
    return exams.filter((item) => {
      const searchText = `${item.title} ${item.reason} ${item.fileName} ${item.notes ?? ''}`
        .toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesReason = reasonFilter ? item.reason === reasonFilter : true;

      return matchesQuery && matchesReason;
    });
  }, [exams, query, reasonFilter]);

  const openDeleteModal = (exam: Exam) => {
    setSelectedToDelete(exam);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedToDelete) return;

    await deleteExam(selectedToDelete.id);

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

          <Text style={styles.headerTitle}>Exames</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <FlaskConical size={28} color={GREEN} />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>Últimos exames</Text>
            <Text style={styles.heroText}>
              Guarde PDFs, motivos e marcadores para acompanhar mudanças de um exame para outro.
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color="#6B7A90" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por título, motivo ou observação"
            placeholderTextColor="#9AA6B5"
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.reasonButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter size={16} color={GREEN} />
            <Text style={styles.reasonButtonText}>
              {reasonFilter ? `Motivo: ${reasonFilter}` : 'Filtrar por motivo'}
            </Text>
          </TouchableOpacity>

          {reasonFilter ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => setReasonFilter('')}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateExam')}
        >
          <Plus size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar exame</Text>
        </TouchableOpacity>

        {filteredExams.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum exame encontrado</Text>
            <Text style={styles.emptyText}>
              Cadastre um exame ou ajuste os filtros de busca.
            </Text>
          </View>
        ) : (
          filteredExams.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.examCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ExamDetails', { examId: item.id })}
              onLongPress={() => openDeleteModal(item)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <FileText size={22} color={GREEN} />
                </View>

                <View style={styles.cardTitleBox}>
                  <Text style={styles.examTitle}>{item.title}</Text>
                  <Text style={styles.examDate}>
                    Registrado em {formatDate(item.registeredAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Badge label={item.reason} />
                <Badge label={`${item.markers?.length ?? 0} marcadores`} />
              </View>

              <View style={styles.fileBlock}>
                <CalendarDays size={17} color={GREEN} />
                <Text style={styles.fileText} numberOfLines={1}>
                  {item.fileName}
                </Text>
              </View>

              {item.notes ? <InfoBlock title="Observações" value={item.notes} /> : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.filterCard}>
            <Text style={styles.filterTitle}>Filtrar por motivo</Text>

            {reasonOptions.map((item) => {
              const selected = reasonFilter === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.filterOption, selected && styles.filterOptionActive]}
                  onPress={() => {
                    setReasonFilter(item);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={[styles.filterOptionText, selected && styles.filterOptionTextActive]}>
                    {item}
                  </Text>
                  {selected && <Check size={18} color={GREEN} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.cancelPickerButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.cancelPickerText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIconBox}>
              <Trash2 size={28} color="#FF6B6B" />
            </View>

            <Text style={styles.deleteTitle}>Apagar exame?</Text>
            <Text style={styles.deleteText}>
              Deseja apagar permanentemente esse exame do histórico da criança?
            </Text>

            <TouchableOpacity style={styles.deleteOption} onPress={confirmDelete}>
              <Trash2 size={20} color="#FF6B6B" />
              <Text style={styles.deleteOptionText}>Deletar permanentemente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepOption}
              onPress={() => {
                setDeleteModalVisible(false);
                setSelectedToDelete(null);
              }}
            >
              <Check size={20} color={GREEN} />
              <Text style={styles.keepOptionText}>Manter exame</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Badge = ({ label }: { label: string }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const InfoBlock = ({ title, value }: { title: string; value: string }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoText}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },

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
    backgroundColor: GREEN_BG,
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
  reasonButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: GREEN_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
  },
  reasonButtonText: { color: GREEN, fontSize: 13, fontWeight: '900' },
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
    backgroundColor: GREEN,
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

  examCard: {
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
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitleBox: { flex: 1 },
  examTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 3 },
  examDate: { color: '#6B7A90', fontSize: 14, fontWeight: '700' },

  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: {
    backgroundColor: GREEN_BG,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: GREEN, fontSize: 12, fontWeight: '900' },

  fileBlock: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileText: { flex: 1, color: '#142033', fontSize: 14, fontWeight: '700' },

  infoBlock: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  infoTitle: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  infoText: { color: '#142033', fontSize: 15, lineHeight: 21, fontWeight: '600' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,32,51,0.28)',
    justifyContent: 'center',
    padding: 24,
  },

  filterCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20 },
  filterTitle: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  filterOption: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterOptionActive: { backgroundColor: GREEN_BG },
  filterOptionText: { color: '#6B7A90', fontSize: 15, fontWeight: '800' },
  filterOptionTextActive: { color: GREEN, fontWeight: '900' },
  cancelPickerButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelPickerText: { color: '#6B7A90', fontSize: 15, fontWeight: '900' },

  deleteCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, alignItems: 'center' },
  deleteIconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deleteTitle: { color: '#142033', fontSize: 21, fontWeight: '900', marginBottom: 6 },
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
  deleteOptionText: { color: '#FF6B6B', fontSize: 15, fontWeight: '900' },
  keepOption: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  keepOptionText: { color: GREEN, fontSize: 15, fontWeight: '900' },
});