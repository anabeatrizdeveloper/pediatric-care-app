import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  ArrowLeft,
  Check,
  FileText,
  FlaskConical,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Exam,
  ExamMarker,
  ExamReason,
  getChildren,
  getExamById,
  saveExam,
  updateExam,
} from '../../../shared/services/localCareStorage';

const GREEN = '#58CDAF';
const GREEN_BG = '#E6F7EC';

const reasonOptions: ExamReason[] = [
  'Rotina',
  'Acompanhamento',
  'Episódio de doença',
  'Investigação',
];

export const CreateExamScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const examId = route.params?.examId as string | undefined;
  const isEditing = Boolean(examId);

  const [childId, setChildId] = useState('');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState<ExamReason>('Rotina');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [registeredAt, setRegisteredAt] = useState('');
  const [notes, setNotes] = useState('');

  const [markers, setMarkers] = useState<ExamMarker[]>([]);
  const [markerName, setMarkerName] = useState('');
  const [markerValue, setMarkerValue] = useState('');
  const [markerUnit, setMarkerUnit] = useState('');

  useEffect(() => {
    const load = async () => {
      const children = await getChildren();
      const activeChild = children[0];

      if (activeChild) {
        setChildId(activeChild.id);
      }

      if (examId) {
        const exam = await getExamById(examId);

        if (!exam) return;

        setChildId(exam.childId);
        setTitle(exam.title);
        setReason(exam.reason);
        setFileName(exam.fileName);
        setFileUri(exam.fileUri);
        setRegisteredAt(exam.registeredAt);
        setNotes(exam.notes ?? '');
        setMarkers(exam.markers ?? []);
      }
    };

    load();
  }, [examId]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const selectedFile = result.assets[0];

    try {
      const examsDir = `${FileSystem.documentDirectory}exams/`;
      const dirInfo = await FileSystem.getInfoAsync(examsDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(examsDir, {
          intermediates: true,
        });
      }

      const safeFileName = `${Date.now()}-${selectedFile.name}`;
      const permanentUri = `${examsDir}${safeFileName}`;

      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: permanentUri,
      });

      setFileName(selectedFile.name);
      setFileUri(permanentUri);

      if (!title.trim()) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    } catch (error) {
      Alert.alert(
        'Erro ao salvar PDF',
        'Não foi possível salvar o arquivo permanentemente.'
      );
    }
  };

  const addMarker = () => {
    if (!markerName.trim() || !markerValue.trim()) {
      Alert.alert('Marcador incompleto', 'Preencha o nome e o valor do marcador.');
      return;
    }

    const newMarker: ExamMarker = {
      name: markerName.trim(),
      value: markerValue.trim(),
      unit: markerUnit.trim(),
    };

    setMarkers((current) => [...current, newMarker]);
    setMarkerName('');
    setMarkerValue('');
    setMarkerUnit('');
  };

  const removeMarker = (index: number) => {
    setMarkers((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Criança não encontrada', 'Cadastre uma criança antes de salvar exames.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Digite um título para o exame.');
      return;
    }

    if (!fileUri) {
      Alert.alert('PDF obrigatório', 'Selecione o PDF do exame antes de salvar.');
      return;
    }

    const exam: Exam = {
      id: examId ?? String(Date.now()),
      childId,
      title: title.trim(),
      reason,
      fileName,
      fileUri,
      registeredAt: isEditing && registeredAt ? registeredAt : new Date().toISOString(),
      notes: notes.trim(),
      markers,
    };

    if (isEditing) {
      await updateExam(exam);
    } else {
      await saveExam(exam);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar exame' : 'Novo exame'}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <FlaskConical size={28} color={GREEN} />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>Registro de exame</Text>
            <Text style={styles.heroText}>
              Salve o PDF, o motivo do exame e os principais marcadores para acompanhar mudanças.
            </Text>
          </View>
        </View>

        <Input
          label="TÍTULO DO EXAME"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Hemograma completo"
        />

        <Text style={styles.inputLabel}>MOTIVO DO EXAME</Text>
        <View style={styles.reasonGrid}>
          {reasonOptions.map((item) => {
            const selected = reason === item;

            return (
              <TouchableOpacity
                key={item}
                style={[styles.reasonChip, selected && styles.reasonChipActive]}
                onPress={() => setReason(item)}
              >
                <Text style={[styles.reasonChipText, selected && styles.reasonChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>PDF DO EXAME</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
          <View style={styles.uploadIcon}>
            {fileName ? (
              <FileText size={25} color={GREEN} />
            ) : (
              <UploadCloud size={25} color={GREEN} />
            )}
          </View>

          <View style={styles.uploadTextBox}>
            <Text style={styles.uploadTitle}>
              {fileName || 'Selecionar PDF'}
            </Text>
            <Text style={styles.uploadText}>
              {fileName
                ? 'PDF salvo no histórico. Toque para substituir.'
                : 'Envie o arquivo do exame em PDF.'}
            </Text>
          </View>
        </TouchableOpacity>

        <Input
          label="OBSERVAÇÕES"
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex: exame solicitado em consulta de rotina..."
          multiline
        />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Marcadores do exame</Text>
          <Text style={styles.sectionText}>
            Adicione dados como colesterol, glicose, ferritina...
          </Text>

          <Input
            label="NOME DO MARCADOR"
            value={markerName}
            onChangeText={setMarkerName}
            placeholder="Ex: Colesterol total"
          />

          <View style={styles.markerRow}>
            <View style={styles.markerColumn}>
              <Input
                label="VALOR"
                value={markerValue}
                onChangeText={setMarkerValue}
                placeholder="Ex: 180"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.markerColumn}>
              <Input
                label="UNIDADE"
                value={markerUnit}
                onChangeText={setMarkerUnit}
                placeholder="Ex: mg/dL"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addMarkerButton} onPress={addMarker}>
            <Plus size={19} color={GREEN} />
            <Text style={styles.addMarkerText}>Adicionar marcador</Text>
          </TouchableOpacity>

          {markers.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.markerItem}>
              <View>
                <Text style={styles.markerName}>{item.name}</Text>
                <Text style={styles.markerValue}>
                  {item.value} {item.unit}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeMarkerButton}
                onPress={() => removeMarker(index)}
              >
                <Trash2 size={18} color={GREEN} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Salvar alterações' : 'Salvar exame'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>

    <View style={[styles.inputBox, multiline && styles.textAreaBox]}>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA6B5"
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
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
    marginBottom: 24,
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

  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  inputBox: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#142033',
    fontSize: 16,
    fontWeight: '600',
  },
  textAreaBox: {
    minHeight: 130,
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  textArea: { minHeight: 110 },

  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  reasonChip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
  },
  reasonChipActive: { backgroundColor: GREEN },
  reasonChipText: {
    color: '#142033',
    fontSize: 13,
    fontWeight: '800',
  },
  reasonChipTextActive: { color: '#FFFFFF' },

  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uploadTextBox: { flex: 1 },
  uploadTitle: { color: '#142033', fontSize: 16, fontWeight: '900', marginBottom: 3 },
  uploadText: { color: '#6B7A90', fontSize: 13, fontWeight: '600', lineHeight: 18 },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: { color: '#142033', fontSize: 19, fontWeight: '900', marginBottom: 4 },
  sectionText: { color: '#6B7A90', fontSize: 14, lineHeight: 20, fontWeight: '600', marginBottom: 14 },

  markerRow: { flexDirection: 'row', gap: 10 },
  markerColumn: { flex: 1 },
  addMarkerButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: GREEN_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addMarkerText: { color: GREEN, fontSize: 15, fontWeight: '900' },

  markerItem: {
    backgroundColor: '#F7F9FC',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  markerName: { color: '#142033', fontSize: 15, fontWeight: '900', marginBottom: 2 },
  markerValue: { color: '#6B7A90', fontSize: 14, fontWeight: '700' },
  removeMarkerButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginTop: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
});