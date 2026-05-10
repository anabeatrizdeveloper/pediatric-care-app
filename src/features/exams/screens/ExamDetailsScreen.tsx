import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Edit3,
  ExternalLink,
  FileText,
  FlaskConical,
} from 'lucide-react-native';
import {
  compareExamMarkers,
  Exam,
  ExamMarker,
  getExamById,
  getExamsByChild,
} from '../../../shared/services/localCareStorage';

const GREEN = '#58CDAF';
const GREEN_BG = '#E6F7EC';
const RED = '#FF6B6B';
const RED_BG = '#FFE5E5';
const BLUE = '#4D8DFF';
const BLUE_BG = '#EAF2FF';

const formatDate = (iso: string) => {
  if (!iso) return 'Data não informada';
  return new Date(iso).toLocaleDateString('pt-BR');
};

export const ExamDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const examId = route.params?.examId ?? route.params?.id;

  const [exam, setExam] = useState<Exam | null>(null);
  const [previousExam, setPreviousExam] = useState<Exam | null>(null);

  useEffect(() => {
    const load = async () => {
      const selected = await getExamById(examId);

      if (!selected) return;

      setExam(selected);

      const childExams = await getExamsByChild(selected.childId);

      const ordered = childExams
        .filter((item) => item.id !== selected.id)
        .sort(
          (a, b) =>
            new Date(b.registeredAt).getTime() -
            new Date(a.registeredAt).getTime()
        );

      const previous = ordered.find(
        (item) =>
          new Date(item.registeredAt).getTime() <
          new Date(selected.registeredAt).getTime()
      );

      setPreviousExam(previous ?? null);
    };

    load();
  }, [examId]);

  const comparedMarkers = useMemo(() => {
    if (!exam) return [];

    return compareExamMarkers(
      previousExam?.markers ?? [],
      exam.markers ?? []
    );
  }, [exam, previousExam]);

  const openPdf = async () => {
    if (!exam?.fileUri) return;

    try {
      const fileInfo = await FileSystem.getInfoAsync(exam.fileUri);

      if (!fileInfo.exists) {
        Alert.alert(
          'PDF não encontrado',
          'Esse arquivo parece não estar mais salvo no dispositivo. Tente cadastrar o exame novamente.'
        );
        return;
      }

      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(exam.fileUri);

        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: 'application/pdf',
        });

        return;
      }

      await Sharing.shareAsync(exam.fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Abrir exame em PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert(
        'Erro ao abrir PDF',
        'Verifique se existe algum leitor de PDF instalado no dispositivo.'
      );
    }
  };

  if (!exam) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando exame...</Text>
      </View>
    );
  }

  const increasedCount = comparedMarkers.filter(
    (item) => item.status === 'aumentou'
  ).length;

  const decreasedCount = comparedMarkers.filter(
    (item) => item.status === 'diminuiu'
  ).length;

  const stableCount = comparedMarkers.filter(
    (item) => item.status === 'igual'
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Detalhes do exame</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <FlaskConical size={28} color={GREEN} />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>{exam.title}</Text>
            <Text style={styles.heroText}>
              Comparação automática com o exame anterior registrado.
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('CreateExam', { examId: exam.id })}
          >
            <Edit3 size={18} color={GREEN} />
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={openPdf}>
            <ExternalLink size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Abrir PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Aumentaram" value={String(increasedCount)} tone="up" />
          <SummaryCard label="Diminuíram" value={String(decreasedCount)} tone="down" />
          <SummaryCard label="Iguais" value={String(stableCount)} tone="stable" />
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            icon={<CalendarDays size={18} color={GREEN} />}
            label="Registrado em"
            value={formatDate(exam.registeredAt)}
          />

          <InfoRow
            icon={<FileText size={18} color={GREEN} />}
            label="Arquivo"
            value={exam.fileName}
          />

          <InfoRow
            icon={<FlaskConical size={18} color={GREEN} />}
            label="Motivo"
            value={exam.reason}
          />
        </View>

        {previousExam ? (
          <View style={styles.comparisonCard}>
            <Text style={styles.sectionTitle}>Comparação com exame anterior</Text>
            <Text style={styles.sectionText}>
              Comparando com: {previousExam.title} • {formatDate(previousExam.registeredAt)}
            </Text>
          </View>
        ) : (
          <View style={styles.comparisonCard}>
            <Text style={styles.sectionTitle}>Sem exame anterior</Text>
            <Text style={styles.sectionText}>
              Quando houver outro exame cadastrado, o app poderá indicar o que aumentou,
              diminuiu ou permaneceu igual.
            </Text>
          </View>
        )}

        <Text style={styles.inputLabel}>MARCADORES</Text>

        {comparedMarkers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum marcador cadastrado</Text>
            <Text style={styles.emptyText}>
              Edite o exame para adicionar valores como colesterol, glicose ou hemoglobina.
            </Text>
          </View>
        ) : (
          comparedMarkers.map((marker, index) => (
            <MarkerCard key={`${marker.name}-${index}`} marker={marker} />
          ))
        )}

        {exam.notes ? (
          <>
            <Text style={styles.inputLabel}>OBSERVAÇÕES</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{exam.notes}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const SummaryCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'up' | 'down' | 'stable';
}) => {
  const color = tone === 'up' ? RED : tone === 'down' ? BLUE : GREEN;
  const bg = tone === 'up' ? RED_BG : tone === 'down' ? BLUE_BG : GREEN_BG;

  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
        {tone === 'up' ? (
          <ArrowUp size={20} color={color} />
        ) : tone === 'down' ? (
          <ArrowDown size={20} color={color} />
        ) : (
          <ArrowRight size={20} color={color} />
        )}
      </View>

      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
};

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>{icon}</View>

    <View style={styles.infoTextBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const MarkerCard = ({ marker }: { marker: ExamMarker }) => {
  const statusConfig = {
    aumentou: {
      label: 'Aumentou',
      color: RED,
      bg: RED_BG,
      icon: <ArrowUp size={18} color={RED} />,
    },
    diminuiu: {
      label: 'Diminuiu',
      color: BLUE,
      bg: BLUE_BG,
      icon: <ArrowDown size={18} color={BLUE} />,
    },
    igual: {
      label: 'Igual',
      color: GREEN,
      bg: GREEN_BG,
      icon: <ArrowRight size={18} color={GREEN} />,
    },
  };

  const config = marker.status ? statusConfig[marker.status] : null;

  return (
    <View style={styles.markerCard}>
      <View style={styles.markerTop}>
        <View>
          <Text style={styles.markerName}>{marker.name}</Text>
          <Text style={styles.markerValue}>
            {marker.value}
            {marker.unit ? ` ${marker.unit}` : ''}
          </Text>
        </View>

        {config ? (
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            {config.icon}
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        ) : (
          <View style={styles.statusBadgeEmpty}>
            <Text style={styles.statusTextEmpty}>Novo</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },

  loadingText: {
    color: '#142033',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 70,
    textAlign: 'center',
  },

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
    marginBottom: 16,
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

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: { color: GREEN, fontSize: 15, fontWeight: '900' },
  primaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: { color: '#142033', fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: '#6B7A90', fontSize: 12, fontWeight: '800', textAlign: 'center' },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextBox: { flex: 1 },
  infoLabel: { color: '#6B7A90', fontSize: 12, fontWeight: '900', marginBottom: 2 },
  infoValue: { color: '#142033', fontSize: 15, fontWeight: '700' },

  comparisonCard: {
    backgroundColor: GREEN_BG,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 5 },
  sectionText: { color: '#6B7A90', fontSize: 14, lineHeight: 20, fontWeight: '600' },

  inputLabel: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
  },

  emptyBox: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22 },
  emptyTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  emptyText: { color: '#6B7A90', fontSize: 14, lineHeight: 20 },

  markerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  markerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markerName: { color: '#142033', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  markerValue: { color: '#6B7A90', fontSize: 14, fontWeight: '800' },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusText: { fontSize: 12, fontWeight: '900' },
  statusBadgeEmpty: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#EEF2F7',
  },
  statusTextEmpty: { color: '#6B7A90', fontSize: 12, fontWeight: '900' },

  notesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
  },
  notesText: { color: '#142033', fontSize: 15, lineHeight: 22, fontWeight: '600' },
});