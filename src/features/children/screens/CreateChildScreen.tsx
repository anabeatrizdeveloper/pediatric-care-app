import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, CalendarDays, Camera } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Child,
  getChildById,
  saveChild,
} from '../../../shared/services/localCareStorage';

export const CreateChildScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const childId = route.params?.childId as string | undefined;
  const isEditing = Boolean(childId);

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthDateObject, setBirthDateObject] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm'>('cm');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [allergies, setAllergies] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const [conditions, setConditions] = useState('');

  useEffect(() => {
    const loadChild = async () => {
      if (!childId) return;

      const child = await getChildById(childId);

      if (!child) return;

      setName(child.name);
      setNickname(child.nickname);
      setBirthDate(child.birthDate);
      setGender(child.gender);
      setWeight(child.weight);
      setHeight(child.height);
      setHeightUnit(child.heightUnit ?? 'cm');
      setPhotoUri(child.photoUri);
      setAllergies(child.allergies ?? '');
      setIntolerances(child.intolerances ?? '');
      setConditions(child.conditions ?? '');
    };

    loadChild();
  }, [childId]);

  const canSave = name.trim() && birthDate.trim();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setBirthDateObject(selectedDate);
      setBirthDate(formatDate(selectedDate));
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePhotoPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Escolher da galeria', 'Tirar foto', 'Remover foto'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromGallery();
          if (buttonIndex === 2) takePhoto();
          if (buttonIndex === 3) setPhotoUri(undefined);
        }
      );

      return;
    }

    Alert.alert('Foto da criança', 'Escolha uma opção', [
      { text: 'Galeria', onPress: pickFromGallery },
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Remover foto', onPress: () => setPhotoUri(undefined), style: 'destructive' },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Dados incompletos', 'Preencha pelo menos nome e data de nascimento.');
      return;
    }

    const child: Child = {
      id: childId ?? String(Date.now()),
      name,
      nickname,
      birthDate,
      gender,
      weight,
      height,
      heightUnit,
      emoji: gender.toLowerCase().includes('masc') ? '👦' : '👧',
      photoUri,
      allergies,
      intolerances,
      conditions,
      pediatricianName: 'Não vinculado',
    };

    await saveChild(child);

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
            {isEditing ? 'Editar criança' : 'Cadastrar criança'}
          </Text>
        </View>

        <TouchableOpacity style={styles.avatarBox} onPress={handlePhotoPress}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.childPhoto} />
          ) : (
            <Text style={styles.avatarEmoji}>
              {gender.toLowerCase().includes('masc') ? '👦' : '👧'}
            </Text>
          )}

          <View style={styles.cameraButton}>
            <Camera size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <AppField label="NOME COMPLETO" value={name} onChangeText={setName} placeholder="Ex: Helena Medeiros" />
        <AppField label="APELIDO" value={nickname} onChangeText={setNickname} placeholder="Ex: Lelê" />

        <Text style={styles.fieldLabelOutside}>DATA DE NASCIMENTO</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.dateText, !birthDate && styles.placeholderText]}>
            {birthDate || 'Selecionar data'}
          </Text>
          <CalendarDays size={20} color="#2F89E8" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthDateObject}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <AppField label="SEXO" value={gender} onChangeText={setGender} placeholder="Feminino / Masculino" />

        <View style={styles.twoColumns}>
          <UnitField
            label="PESO"
            value={weight}
            onChangeText={setWeight}
            placeholder="16,2"
            unit="kg"
          />

          <UnitField
            label="ALTURA"
            value={height}
            onChangeText={setHeight}
            placeholder="102"
            unit={heightUnit}
            onToggleUnit={() => setHeightUnit(heightUnit === 'cm' ? 'm' : 'cm')}
          />
        </View>

        <AppField label="ALERGIAS" value={allergies} onChangeText={setAllergies} placeholder="Ex: dipirona, amendoim..." />
        <AppField label="INTOLERÂNCIAS" value={intolerances} onChangeText={setIntolerances} placeholder="Ex: lactose, glúten..." />
        <AppField label="DEFICIÊNCIA / TRANSTORNO / CONDIÇÃO" value={conditions} onChangeText={setConditions} placeholder="Ex: TEA, TDAH, deficiência auditiva..." />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Salvar alterações' : 'Salvar perfil'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type AppFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

const AppField = ({ label, value, onChangeText, placeholder }: AppFieldProps) => (
  <View style={styles.fieldBox}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA6B5"
    />
  </View>
);

type UnitFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  unit: string;
  onToggleUnit?: () => void;
};

const UnitField = ({ label, value, onChangeText, placeholder, unit, onToggleUnit }: UnitFieldProps) => (
  <View style={[styles.fieldBox, styles.smallField]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.unitRow}>
      <TextInput
        style={[styles.input, styles.unitInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA6B5"
        keyboardType="decimal-pad"
      />
      <TouchableOpacity disabled={!onToggleUnit} onPress={onToggleUnit} style={styles.unitPill}>
        <Text style={styles.unitText}>{unit}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  backButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2F7',
    alignItems: 'center', justifyContent: 'center', marginRight: 18,
  },
  headerTitle: { color: '#142033', fontSize: 22, fontWeight: '900' },
  avatarBox: {
    width: 116, height: 116, borderRadius: 28, backgroundColor: '#3D7DF0',
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    marginBottom: 34, position: 'relative', overflow: 'visible',
  },
  childPhoto: {
    width: 116,
    height: 116,
    borderRadius: 28,
  },
  avatarEmoji: { fontSize: 46 },
  cameraButton: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#2F89E8',
    alignItems: 'center', justifyContent: 'center', position: 'absolute', right: -8, bottom: -4,
    borderWidth: 4, borderColor: '#F7F9FC',
  },
  fieldBox: {
    minHeight: 76, borderRadius: 20, backgroundColor: '#EEF2F7',
    paddingHorizontal: 18, paddingVertical: 13, marginBottom: 16,
  },
  smallField: { flex: 1 },
  fieldLabel: {
    color: '#6B7A90', fontSize: 12, fontWeight: '900',
    letterSpacing: 1.2, marginBottom: 6,
  },
  fieldLabelOutside: {
    color: '#6B7A90', fontSize: 12, fontWeight: '900',
    letterSpacing: 1.2, marginBottom: 6,
  },
  input: { color: '#142033', fontSize: 17, fontWeight: '500' },
  twoColumns: { flexDirection: 'row', gap: 14 },
  dateButton: {
    height: 76,
    borderRadius: 20,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#142033',
    fontSize: 17,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9AA6B5',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitInput: {
    flex: 1,
  },
  unitPill: {
    backgroundColor: '#DFF0FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  unitText: {
    color: '#2F89E8',
    fontSize: 13,
    fontWeight: '900',
  },
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