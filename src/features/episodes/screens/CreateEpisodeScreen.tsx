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
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Thermometer,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Episode,
  getChildren,
  getEpisodeById,
  saveEpisode,
  updateEpisode,
} from '../../../shared/services/localCareStorage';

const RED = '#FF6B6B';
const RED_BG = '#FFE5E5';

const symptomOptions = [
  'Febre',
  'Tosse',
  'Dor de garganta',
  'Dor de cabeça',
  'Dor abdominal',
  'Vômito',
  'Diarreia',
  'Coriza',
  'Cansaço',
  'Falta de apetite',
];

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

export const CreateEpisodeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const episodeId = route.params?.episodeId as string | undefined;
  const isEditing = Boolean(episodeId);

  const [childId, setChildId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [hadFever, setHadFever] = useState(false);
  const [hadPain, setHadPain] = useState(false);
  const [hadCough, setHadCough] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const children = await getChildren();
      const activeChild = children[0];

      if (activeChild) {
        setChildId(activeChild.id);
      }

      if (episodeId) {
        const episode = await getEpisodeById(episodeId);

        if (!episode) return;

        setChildId(episode.childId);
        setTitle(episode.title);
        setDate(episode.date);
        setTemperature(episode.temperature ?? '');
        setHadFever(episode.hadFever);
        setHadPain(episode.hadPain);
        setHadCough(episode.hadCough);
        setSelectedSymptoms(
          episode.symptoms ? episode.symptoms.split(', ').filter(Boolean) : []
        );
        setDescription(episode.description);
      }
    };

    load();
  }, [episodeId]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Criança não encontrada', 'Cadastre uma criança antes de salvar episódios.');
      return;
    }

    if (!title.trim() || !date.trim()) {
      Alert.alert('Dados incompletos', 'Preencha pelo menos título e data do episódio.');
      return;
    }

    const episode: Episode = {
      id: episodeId ?? String(Date.now()),
      childId,
      title,
      date,
      temperature,
      hadFever,
      hadPain,
      hadCough,
      symptoms: selectedSymptoms.join(', '),
      description,
      createdAt: new Date().toISOString(),
    };

    if (isEditing) {
      await updateEpisode(episode);
    } else {
      await saveEpisode(episode);
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
            {isEditing ? 'Editar episódio' : 'Novo episódio'}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Activity size={28} color={RED} />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>Episódio de saúde</Text>
            <Text style={styles.heroText}>
              Registre o episódio completo em uma única tela.
            </Text>
          </View>
        </View>

        <Input
          label="TÍTULO DO EPISÓDIO"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Febre e tosse à noite"
        />

        <Text style={styles.inputLabel}>QUANDO ACONTECEU?</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.dateInputText, !date && styles.placeholderText]}>
            {date || 'Selecionar data'}
          </Text>
          <CalendarDays size={20} color={RED} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            accentColor={RED}
            positiveButton={{ label: 'OK', textColor: RED }}
            negativeButton={{ label: 'Cancelar', textColor: RED }}
            onChange={(_event, selectedDate) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (selectedDate) setDate(formatDate(selectedDate));
            }}
          />
        )}

        <Input
          label="TEMPERATURA DA FEBRE"
          value={temperature}
          onChangeText={setTemperature}
          placeholder="Ex: 38.5"
          keyboardType="decimal-pad"
          icon={<Thermometer size={20} color={RED} />}
        />

        <View style={styles.toggleGrid}>
          <Toggle label="Teve febre" value={hadFever} onPress={() => setHadFever(!hadFever)} />
          <Toggle label="Teve dor" value={hadPain} onPress={() => setHadPain(!hadPain)} />
          <Toggle label="Tossiu" value={hadCough} onPress={() => setHadCough(!hadCough)} />
        </View>

        <Text style={styles.inputLabel}>SINTOMAS</Text>
        <View style={styles.symptomGrid}>
          {symptomOptions.map((symptom) => {
            const selected = selectedSymptoms.includes(symptom);

            return (
              <TouchableOpacity
                key={symptom}
                style={[styles.symptomChip, selected && styles.symptomChipActive]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text style={[styles.symptomChipText, selected && styles.symptomChipTextActive]}>
                  {symptom}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="DESCRIÇÃO DO EPISÓDIO"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: começou à noite, piorou depois do banho, tomou remédio..."
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Salvar alterações' : 'Salvar episódio'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const Input = ({ label, value, onChangeText, placeholder, multiline, keyboardType, icon }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>

    <View style={[styles.inputBox, multiline && styles.textAreaBox]}>
      {icon ? <View style={styles.inputIcon}>{icon}</View> : null}

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

const Toggle = ({ label, value, onPress }: { label: string; value: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.toggleCard, value && styles.toggleCardActive]}
    onPress={onPress}
  >
    <View style={[styles.toggleCircle, value && styles.toggleCircleActive]}>
      {value && <Check size={14} color="#FFFFFF" />}
    </View>
    <Text style={[styles.toggleText, value && styles.toggleTextActive]}>{label}</Text>
  </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: { marginRight: 8 },
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
  textArea: {
    minHeight: 110,
  },
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

  toggleGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  toggleCard: {
    flex: 1,
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  toggleCardActive: {
    backgroundColor: RED_BG,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D0D7E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  toggleCircleActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  toggleText: {
    color: '#6B7A90',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  toggleTextActive: {
    color: RED,
  },

  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
  },
  symptomChipActive: {
    backgroundColor: RED,
  },
  symptomChipText: {
    color: '#142033',
    fontSize: 13,
    fontWeight: '800',
  },
  symptomChipTextActive: {
    color: '#FFFFFF',
  },

  saveButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});