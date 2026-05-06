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
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Plus,
  Search,
  Thermometer,
  Trash2,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  deleteEpisode,
  Episode,
  getChildren,
  getEpisodes,
} from '../../../shared/services/localCareStorage';

const RED = '#FF6B6B';
const RED_BG = '#FFE5E5';

const monthOptions = [
  '01/2026', '02/2026', '03/2026', '04/2026',
  '05/2026', '06/2026', '07/2026', '08/2026',
  '09/2026', '10/2026', '11/2026', '12/2026',
];

export const EpisodesScreen = () => {
  const navigation = useNavigation<any>();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [query, setQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Episode | null>(null);

  const loadData = async () => {
    const children = await getChildren();
    const activeChild = children[0];

    if (!activeChild) return;

    const data = await getEpisodes();
    setEpisodes(data.filter((item) => item.childId === activeChild.id));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((item) => {
      const searchText = `${item.title} ${item.date} ${item.symptoms} ${item.description}`.toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesMonth = monthFilter ? item.date.endsWith(monthFilter) : true;

      return matchesQuery && matchesMonth;
    });
  }, [episodes, query, monthFilter]);

  const openDeleteModal = (episode: Episode) => {
    setSelectedToDelete(episode);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedToDelete) return;

    await deleteEpisode(selectedToDelete.id);

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

          <Text style={styles.headerTitle}>Episódios</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Activity size={28} color={RED} />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>Últimos episódios</Text>
            <Text style={styles.heroText}>
              Registre febre, dor, tosse, sintomas e observações de cada episódio de saúde.
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color="#6B7A90" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por sintoma, data ou título..."
            placeholderTextColor="#9AA6B5"
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.monthButton} onPress={() => setMonthModalVisible(true)}>
            <CalendarDays size={16} color={RED} />
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

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateEpisode')}
        >
          <Plus size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar episódio</Text>
        </TouchableOpacity>

        {filteredEpisodes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum episódio encontrado</Text>
            <Text style={styles.emptyText}>
              Cadastre um episódio ou ajuste os filtros de busca.
            </Text>
          </View>
        ) : (
          filteredEpisodes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.episodeCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreateEpisode', { episodeId: item.id })}
              onLongPress={() => openDeleteModal(item)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Thermometer size={22} color={RED} />
                </View>

                <View style={styles.cardTitleBox}>
                  <Text style={styles.episodeTitle}>{item.title}</Text>
                  <Text style={styles.episodeDate}>Episódio em {item.date}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                {item.hadFever && <Badge label="Febre" />}
                {item.hadPain && <Badge label="Dor" />}
                {item.hadCough && <Badge label="Tosse" />}
                {item.temperature ? <Badge label={`${item.temperature}°C`} /> : null}
              </View>

              {item.symptoms ? <InfoBlock title="Sintomas" value={item.symptoms} /> : null}
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

            <TouchableOpacity
              style={styles.cancelPickerButton}
              onPress={() => setMonthModalVisible(false)}
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
              <Trash2 size={28} color={RED} />
            </View>

            <Text style={styles.deleteTitle}>Apagar episódio?</Text>
            <Text style={styles.deleteText}>
              Deseja apagar permanentemente esse episódio do histórico da criança?
            </Text>

            <TouchableOpacity style={styles.deleteOption} onPress={confirmDelete}>
              <Trash2 size={20} color={RED} />
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
              <Text style={styles.keepOptionText}>Manter episódio</Text>
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
    backgroundColor: RED_BG,
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
    backgroundColor: RED_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  monthButtonText: { color: RED, fontSize: 13, fontWeight: '900' },
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
    backgroundColor: RED,
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

  episodeCard: {
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
    backgroundColor: RED_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitleBox: { flex: 1 },
  episodeTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 3 },
  episodeDate: { color: '#6B7A90', fontSize: 14, fontWeight: '700' },

  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: {
    backgroundColor: RED_BG,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: RED, fontSize: 12, fontWeight: '900' },

  infoBlock: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  infoTitle: {
    color: RED,
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
  monthPickerCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20 },
  monthPickerTitle: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  monthWheel: { maxHeight: 250 },
  monthWheelContent: { paddingVertical: 12 },
  monthWheelItem: {
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthWheelItemActive: { backgroundColor: RED_BG },
  monthWheelText: { color: '#D1A2A2', fontSize: 18, fontWeight: '800' },
  monthWheelTextActive: { color: RED, fontSize: 24, fontWeight: '900' },
  cancelPickerButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelPickerText: { color: '#6B7A90', fontSize: 15, fontWeight: '900' },

  deleteCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, alignItems: 'center' },
  deleteIconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: RED_BG,
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
    backgroundColor: RED_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 10,
  },
  deleteOptionText: { color: RED, fontSize: 15, fontWeight: '900' },
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
  keepOptionText: { color: '#58CDAF', fontSize: 15, fontWeight: '900' },
});