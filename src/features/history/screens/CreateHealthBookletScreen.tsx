import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { useNavigation } from '@react-navigation/native';
import { Country, State, City } from 'country-state-city';
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Check,
  ChevronRight,
  HeartPulse,
  Hospital,
  MapPin,
  Search,
  ShieldCheck,
  Syringe,
  Utensils,
} from 'lucide-react-native';

import {
  getChildren,
  getHealthBookletByChild,
  HealthBooklet,
  saveHealthBooklet,
  updateHealthBooklet,
} from '../../../shared/services/localCareStorage';

const YELLOW = '#FFB84D';
const YELLOW_BG = '#FFF1D9';

const sexOptions = ['Feminino', 'Masculino'];

const deliveryOptions = [
  'Parto normal',
  'Cesárea',
  'Parto humanizado',
  'Parto induzido',
  'Parto prematuro',
  'Outro',
];

const gestationalOptions = [
  'Prematuro extremo',
  'Prematuro',
  '37 semanas',
  '38 semanas',
  '39 semanas',
  '40 semanas',
  '41 semanas',
  '42 semanas',
  'Outro',
];

type PickerType =
  | 'nationality'
  | 'birthCountry'
  | 'birthState'
  | 'birthCity'
  | null;

type DateField =
  | 'heelPrickTest'
  | 'hearingTest'
  | 'eyeTest'
  | 'heartTest'
  | 'tongueTest'
  | null;

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🏳️';

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
};

export const CreateHealthBookletScreen = () => {
  const navigation = useNavigation<any>();

  const [childId, setChildId] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState('');

  const [childFullName, setChildFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  const [nationality, setNationality] = useState('');
  const [nationalityCode, setNationalityCode] = useState('');

  const [birthCountry, setBirthCountry] = useState('');
  const [birthCountryCode, setBirthCountryCode] = useState('');
  const [birthState, setBirthState] = useState('');
  const [birthStateCode, setBirthStateCode] = useState('');
  const [birthCity, setBirthCity] = useState('');

  const [motherName, setMotherName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [susCard, setSusCard] = useState('');
  const [healthUnit, setHealthUnit] = useState('');

  const [birthHospital, setBirthHospital] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [customDeliveryType, setCustomDeliveryType] = useState('');

  const [gestationalAge, setGestationalAge] = useState('');
  const [customGestationalAge, setCustomGestationalAge] = useState('');

  const [birthWeight, setBirthWeight] = useState('');
  const [birthLength, setBirthLength] = useState('');
  const [birthHeadCircumference, setBirthHeadCircumference] = useState('');
  const [apgarOne, setApgarOne] = useState('');
  const [apgarFive, setApgarFive] = useState('');
  const [birthIntercurrences, setBirthIntercurrences] = useState('');

  const [heelPrickTest, setHeelPrickTest] = useState('');
  const [hearingTest, setHearingTest] = useState('');
  const [eyeTest, setEyeTest] = useState('');
  const [heartTest, setHeartTest] = useState('');
  const [tongueTest, setTongueTest] = useState('');
  const [neonatalScreeningNotes, setNeonatalScreeningNotes] = useState('');

  const [breastfeedingNotes, setBreastfeedingNotes] = useState('');
  const [foodIntroductionNotes, setFoodIntroductionNotes] = useState('');
  const [foodAllergies, setFoodAllergies] = useState('');

  const [currentWeight, setCurrentWeight] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [currentHeadCircumference, setCurrentHeadCircumference] = useState('');
  const [currentBmi, setCurrentBmi] = useState('');
  const [growthNotes, setGrowthNotes] = useState('');

  const [developmentMilestones, setDevelopmentMilestones] = useState('');
  const [developmentAlerts, setDevelopmentAlerts] = useState('');
  const [developmentReferrals, setDevelopmentReferrals] = useState('');

  const [vaccineNotes, setVaccineNotes] = useState('');
  const [pendingVaccines, setPendingVaccines] = useState('');
  const [dentalNotes, setDentalNotes] = useState('');

  const [clinicalHistory, setClinicalHistory] = useState('');
  const [hospitalizations, setHospitalizations] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [continuousMedications, setContinuousMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  const [pickerType, setPickerType] = useState<PickerType>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const [dateField, setDateField] = useState<DateField>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const children = await getChildren();
      const child = children[0];

      if (!child) return;

      setChildId(child.id);
      setChildFullName(child.name ?? '');
      setNickname(child.nickname ?? '');
      setBirthDate(child.birthDate ?? '');
      setGender(child.gender ?? '');

      const booklet = await getHealthBookletByChild(child.id);

      if (!booklet) return;

      const extra = booklet as any;

      setExistingId(booklet.id);
      setCreatedAt(booklet.createdAt);

      setChildFullName(booklet.childFullName ?? '');
      setNickname(booklet.nickname ?? '');
      setBirthDate(booklet.birthDate ?? '');
      setGender(booklet.gender ?? '');

      setNationality(extra.nationality ?? '');
      setNationalityCode(extra.nationalityCode ?? '');

      setBirthCountry(extra.birthCountry ?? '');
      setBirthCountryCode(extra.birthCountryCode ?? '');
      setBirthState(booklet.birthState ?? '');
      setBirthStateCode(extra.birthStateCode ?? '');
      setBirthCity(booklet.birthCity ?? '');

      setMotherName(booklet.motherName ?? '');
      setFatherName(booklet.fatherName ?? '');
      setGuardianName(booklet.guardianName ?? '');
      setSusCard(booklet.susCard ?? '');
      setHealthUnit(booklet.healthUnit ?? '');

      setBirthHospital(booklet.birthHospital ?? '');
      setDeliveryType(booklet.deliveryType ?? '');
      setGestationalAge(booklet.gestationalAge ?? '');
      setBirthWeight(booklet.birthWeight ?? '');
      setBirthLength(booklet.birthLength ?? '');
      setBirthHeadCircumference(booklet.birthHeadCircumference ?? '');
      setApgarOne(booklet.apgarOne ?? '');
      setApgarFive(booklet.apgarFive ?? '');
      setBirthIntercurrences(booklet.birthIntercurrences ?? '');

      setHeelPrickTest(booklet.heelPrickTest ?? '');
      setHearingTest(booklet.hearingTest ?? '');
      setEyeTest(booklet.eyeTest ?? '');
      setHeartTest(booklet.heartTest ?? '');
      setTongueTest(booklet.tongueTest ?? '');
      setNeonatalScreeningNotes(booklet.neonatalScreeningNotes ?? '');

      setBreastfeedingNotes(booklet.breastfeedingNotes ?? '');
      setFoodIntroductionNotes(booklet.foodIntroductionNotes ?? '');
      setFoodAllergies(booklet.foodAllergies ?? '');

      setCurrentWeight(booklet.currentWeight ?? '');
      setCurrentHeight(booklet.currentHeight ?? '');
      setCurrentHeadCircumference(booklet.currentHeadCircumference ?? '');
      setCurrentBmi(booklet.currentBmi ?? '');
      setGrowthNotes(booklet.growthNotes ?? '');

      setDevelopmentMilestones(booklet.developmentMilestones ?? '');
      setDevelopmentAlerts(booklet.developmentAlerts ?? '');
      setDevelopmentReferrals(booklet.developmentReferrals ?? '');

      setVaccineNotes(booklet.vaccineNotes ?? '');
      setPendingVaccines(booklet.pendingVaccines ?? '');
      setDentalNotes(booklet.dentalNotes ?? '');

      setClinicalHistory(booklet.clinicalHistory ?? '');
      setHospitalizations(booklet.hospitalizations ?? '');
      setSurgeries(booklet.surgeries ?? '');
      setContinuousMedications(booklet.continuousMedications ?? '');
      setAllergies(booklet.allergies ?? '');
      setChronicConditions(booklet.chronicConditions ?? '');
    };

    load();
  }, []);

  const countries = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      name: country.name,
      isoCode: country.isoCode,
      flag: getFlagEmoji(country.isoCode),
    }));
  }, []);

  const states = useMemo(() => {
    if (!birthCountryCode) return [];

    return State.getStatesOfCountry(birthCountryCode).map((state) => ({
      name: state.name,
      isoCode: state.isoCode,
      flag: '',
    }));
  }, [birthCountryCode]);

  const cities = useMemo(() => {
    if (!birthCountryCode || !birthStateCode) return [];

    return City.getCitiesOfState(birthCountryCode, birthStateCode).map((city) => ({
      name: city.name,
      isoCode: city.name,
      flag: '',
    }));
  }, [birthCountryCode, birthStateCode]);

  const pickerItems = useMemo(() => {
    if (pickerType === 'nationality') return countries;
    if (pickerType === 'birthCountry') return countries;
    if (pickerType === 'birthState') return states;
    if (pickerType === 'birthCity') return cities;
    return [];
  }, [pickerType, countries, states, cities]);

  const filteredPickerItems = useMemo(() => {
    const normalizedQuery = pickerQuery.toLowerCase().trim();

    if (!normalizedQuery) return pickerItems.slice(0, 120);

    return pickerItems
      .filter((item) => item.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 120);
  }, [pickerItems, pickerQuery]);

  const openPicker = (type: PickerType) => {
    if (type === 'birthState' && !birthCountryCode) {
      Alert.alert('Selecione o país primeiro', 'Escolha o país de nascimento antes do estado.');
      return;
    }

    if (type === 'birthCity' && (!birthCountryCode || !birthStateCode)) {
      Alert.alert('Selecione o estado primeiro', 'Escolha o país e o estado antes da cidade.');
      return;
    }

    setPickerType(type);
    setPickerQuery('');
  };

  const selectPickerItem = (item: { name: string; isoCode: string }) => {
    if (pickerType === 'nationality') {
      setNationality(item.name);
      setNationalityCode(item.isoCode);
    }

    if (pickerType === 'birthCountry') {
      setBirthCountry(item.name);
      setBirthCountryCode(item.isoCode);
      setBirthState('');
      setBirthStateCode('');
      setBirthCity('');
    }

    if (pickerType === 'birthState') {
      setBirthState(item.name);
      setBirthStateCode(item.isoCode);
      setBirthCity('');
    }

    if (pickerType === 'birthCity') {
      setBirthCity(item.name);
    }

    setPickerType(null);
    setPickerQuery('');
  };

  const openDatePicker = (field: DateField) => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const setScreeningDate = (field: DateField, value: string) => {
    if (field === 'heelPrickTest') setHeelPrickTest(value);
    if (field === 'hearingTest') setHearingTest(value);
    if (field === 'eyeTest') setEyeTest(value);
    if (field === 'heartTest') setHeartTest(value);
    if (field === 'tongueTest') setTongueTest(value);
  };

  const getFinalDeliveryType = () => {
    if (deliveryType === 'Outro') return customDeliveryType.trim();
    return deliveryType;
  };

  const getFinalGestationalAge = () => {
    if (gestationalAge === 'Outro') return customGestationalAge.trim();
    return gestationalAge;
  };

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Criança não encontrada', 'Cadastre uma criança antes de criar a carteirinha.');
      return;
    }

    if (!childFullName.trim() || !birthDate.trim()) {
      Alert.alert('Dados obrigatórios', 'Preencha pelo menos nome completo e data de nascimento.');
      return;
    }

    const now = new Date().toISOString();

    const booklet: HealthBooklet & any = {
      id: existingId ?? String(Date.now()),
      childId,

      childFullName: childFullName.trim(),
      nickname: nickname.trim(),
      birthDate: birthDate.trim(),
      gender: gender.trim(),

      nationality: nationality.trim(),
      nationalityCode,

      birthCountry: birthCountry.trim(),
      birthCountryCode,
      birthState: birthState.trim(),
      birthStateCode,
      birthCity: birthCity.trim(),

      motherName: motherName.trim(),
      fatherName: fatherName.trim(),
      guardianName: guardianName.trim(),
      susCard: susCard.trim(),
      healthUnit: healthUnit.trim(),

      birthHospital: birthHospital.trim(),
      deliveryType: getFinalDeliveryType(),
      gestationalAge: getFinalGestationalAge(),
      birthWeight: birthWeight.trim() ? `${birthWeight.trim()} kg` : '',
      birthLength: birthLength.trim() ? `${birthLength.trim()} cm` : '',
      birthHeadCircumference: birthHeadCircumference.trim()
        ? `${birthHeadCircumference.trim()} cm`
        : '',
      apgarOne: apgarOne.trim(),
      apgarFive: apgarFive.trim(),
      birthIntercurrences: birthIntercurrences.trim(),

      heelPrickTest: heelPrickTest.trim(),
      hearingTest: hearingTest.trim(),
      eyeTest: eyeTest.trim(),
      heartTest: heartTest.trim(),
      tongueTest: tongueTest.trim(),
      neonatalScreeningNotes: neonatalScreeningNotes.trim(),

      breastfeedingNotes: breastfeedingNotes.trim(),
      foodIntroductionNotes: foodIntroductionNotes.trim(),
      foodAllergies: foodAllergies.trim(),

      currentWeight: currentWeight.trim() ? `${currentWeight.trim()} kg` : '',
      currentHeight: currentHeight.trim() ? `${currentHeight.trim()} cm` : '',
      currentHeadCircumference: currentHeadCircumference.trim()
        ? `${currentHeadCircumference.trim()} cm`
        : '',
      currentBmi: currentBmi.trim(),
      growthNotes: growthNotes.trim(),

      developmentMilestones: developmentMilestones.trim(),
      developmentAlerts: developmentAlerts.trim(),
      developmentReferrals: developmentReferrals.trim(),

      vaccineNotes: vaccineNotes.trim(),
      pendingVaccines: pendingVaccines.trim(),
      dentalNotes: dentalNotes.trim(),

      clinicalHistory: clinicalHistory.trim(),
      hospitalizations: hospitalizations.trim(),
      surgeries: surgeries.trim(),
      continuousMedications: continuousMedications.trim(),
      allergies: allergies.trim(),
      chronicConditions: chronicConditions.trim(),

      aiTranscriptionStatus: 'reviewed',

      createdAt: createdAt || now,
      updatedAt: now,
    };

    if (existingId) {
      await updateHealthBooklet(booklet);
    } else {
      await saveHealthBooklet(booklet);
    }

    navigation.navigate('HealthBookletDetails');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {existingId ? 'Editar carteirinha' : 'Nova carteirinha'}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <ShieldCheck size={30} color={YELLOW} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Preenchimento guiado</Text>
            <Text style={styles.heroText}>
              Toque nas opções e preencha apenas o que souber. Você pode editar depois.
            </Text>
          </View>
        </View>

        <Section title="Identificação" icon={<Baby size={22} color={YELLOW} />}>
          <Input label="NOME COMPLETO" value={childFullName} onChangeText={setChildFullName} />
          <Input label="APELIDO / NOME SOCIAL" value={nickname} onChangeText={setNickname} />
          <Input label="DATA DE NASCIMENTO" value={birthDate} onChangeText={setBirthDate} placeholder="Ex: 12/03/2022" />

          <Text style={styles.inputLabel}>SEXO</Text>
          <ChipRow options={sexOptions} selected={gender} onSelect={setGender} />

          <SelectBox
            label="NACIONALIDADE"
            value={nationality}
            placeholder="Selecionar nacionalidade"
            onPress={() => openPicker('nationality')}
          />

          <SelectBox
            label="PAÍS DE NASCIMENTO"
            value={birthCountry}
            placeholder="Selecionar país"
            onPress={() => openPicker('birthCountry')}
          />

          <SelectBox
            label="ESTADO / PROVÍNCIA"
            value={birthState}
            placeholder="Selecionar estado"
            onPress={() => openPicker('birthState')}
          />

          <SelectBox
            label="CIDADE"
            value={birthCity}
            placeholder="Selecionar cidade"
            onPress={() => openPicker('birthCity')}
          />

          <Input label="NOME DA MÃE" value={motherName} onChangeText={setMotherName} />
          <Input label="NOME DO PAI" value={fatherName} onChangeText={setFatherName} />
          <Input label="RESPONSÁVEL" value={guardianName} onChangeText={setGuardianName} />
          <Input label="CARTÃO SUS" value={susCard} onChangeText={setSusCard} />
          <Input label="UNIDADE DE SAÚDE DE REFERÊNCIA" value={healthUnit} onChangeText={setHealthUnit} />
        </Section>

        <Section title="Nascimento" icon={<Hospital size={22} color={YELLOW} />}>
          <Input label="MATERNIDADE / HOSPITAL" value={birthHospital} onChangeText={setBirthHospital} />

          <Text style={styles.inputLabel}>TIPO DE PARTO</Text>
          <ChipRow options={deliveryOptions} selected={deliveryType} onSelect={setDeliveryType} />
          {deliveryType === 'Outro' ? (
            <Input label="OUTRO TIPO DE PARTO" value={customDeliveryType} onChangeText={setCustomDeliveryType} />
          ) : null}

          <Text style={styles.inputLabel}>IDADE GESTACIONAL</Text>
          <ChipRow options={gestationalOptions} selected={gestationalAge} onSelect={setGestationalAge} />
          {gestationalAge === 'Outro' ? (
            <Input label="IDADE GESTACIONAL" value={customGestationalAge} onChangeText={setCustomGestationalAge} placeholder="Ex: 36 semanas e 4 dias" />
          ) : null}

          <Input label="PESO AO NASCER" value={birthWeight} onChangeText={setBirthWeight} placeholder="Ex: 3,250" keyboardType="decimal-pad" suffix="kg" />
          <Input label="COMPRIMENTO AO NASCER" value={birthLength} onChangeText={setBirthLength} placeholder="Ex: 49" keyboardType="decimal-pad" suffix="cm" />
          <Input label="PERÍMETRO CEFÁLICO AO NASCER" value={birthHeadCircumference} onChangeText={setBirthHeadCircumference} keyboardType="decimal-pad" suffix="cm" />
          <Input label="APGAR 1º MINUTO" value={apgarOne} onChangeText={setApgarOne} keyboardType="number-pad" />
          <Input label="APGAR 5º MINUTO" value={apgarFive} onChangeText={setApgarFive} keyboardType="number-pad" />
          <Input label="INTERCORRÊNCIAS NO NASCIMENTO" value={birthIntercurrences} onChangeText={setBirthIntercurrences} multiline />
        </Section>

        <Section title="Triagens neonatais" icon={<HeartPulse size={22} color={YELLOW} />}>
          <DateSelect label="TESTE DO PEZINHO" value={heelPrickTest} onPress={() => openDatePicker('heelPrickTest')} />
          <DateSelect label="TESTE DA ORELHINHA" value={hearingTest} onPress={() => openDatePicker('hearingTest')} />
          <DateSelect label="TESTE DO OLHINHO" value={eyeTest} onPress={() => openDatePicker('eyeTest')} />
          <DateSelect label="TESTE DO CORAÇÃOZINHO" value={heartTest} onPress={() => openDatePicker('heartTest')} />
          <DateSelect label="TESTE DA LINGUINHA" value={tongueTest} onPress={() => openDatePicker('tongueTest')} />
          <Input label="OBSERVAÇÕES DAS TRIAGENS" value={neonatalScreeningNotes} onChangeText={setNeonatalScreeningNotes} multiline />
        </Section>

        <Section title="Alimentação" icon={<Utensils size={22} color={YELLOW} />}>
          <Input label="ALEITAMENTO" value={breastfeedingNotes} onChangeText={setBreastfeedingNotes} placeholder="Ex: aleitamento materno exclusivo até..." multiline />
          <Input label="INTRODUÇÃO ALIMENTAR" value={foodIntroductionNotes} onChangeText={setFoodIntroductionNotes} placeholder="Ex: iniciou com 6 meses..." multiline />
          <Input label="ALERGIAS / RESTRIÇÕES ALIMENTARES" value={foodAllergies} onChangeText={setFoodAllergies} multiline />
        </Section>

        <Section title="Crescimento e desenvolvimento" icon={<HeartPulse size={22} color={YELLOW} />}>
          <Input label="PESO ATUAL" value={currentWeight} onChangeText={setCurrentWeight} keyboardType="decimal-pad" suffix="kg" />
          <Input label="ALTURA ATUAL" value={currentHeight} onChangeText={setCurrentHeight} keyboardType="decimal-pad" suffix="cm" />
          <Input label="PERÍMETRO CEFÁLICO ATUAL" value={currentHeadCircumference} onChangeText={setCurrentHeadCircumference} keyboardType="decimal-pad" suffix="cm" />
          <Input label="IMC" value={currentBmi} onChangeText={setCurrentBmi} keyboardType="decimal-pad" />
          <Input label="OBSERVAÇÕES DE CRESCIMENTO" value={growthNotes} onChangeText={setGrowthNotes} multiline />
          <Input label="MARCOS DO DESENVOLVIMENTO" value={developmentMilestones} onChangeText={setDevelopmentMilestones} placeholder="Ex: sentou, engatinhou, andou, falou..." multiline />
          <Input label="ALERTAS / ATRASOS OBSERVADOS" value={developmentAlerts} onChangeText={setDevelopmentAlerts} multiline />
          <Input label="ENCAMINHAMENTOS" value={developmentReferrals} onChangeText={setDevelopmentReferrals} multiline />
        </Section>

        <Section title="Vacinas e saúde bucal" icon={<Syringe size={22} color={YELLOW} />}>
          <Input label="RESUMO DE VACINAÇÃO" value={vaccineNotes} onChangeText={setVaccineNotes} placeholder="Ex: vacinas em dia até..." multiline />
          <Input label="VACINAS PENDENTES" value={pendingVaccines} onChangeText={setPendingVaccines} multiline />
          <Input label="SAÚDE BUCAL" value={dentalNotes} onChangeText={setDentalNotes} placeholder="Ex: primeiros dentes, consultas odontológicas..." multiline />
        </Section>

        <Section title="Histórico clínico" icon={<ShieldCheck size={22} color={YELLOW} />}>
          <Input label="DOENÇAS IMPORTANTES / HISTÓRICO" value={clinicalHistory} onChangeText={setClinicalHistory} multiline />
          <Input label="INTERNAÇÕES" value={hospitalizations} onChangeText={setHospitalizations} multiline />
          <Input label="CIRURGIAS" value={surgeries} onChangeText={setSurgeries} multiline />
          <Input label="MEDICAMENTOS CONTÍNUOS" value={continuousMedications} onChangeText={setContinuousMedications} multiline />
          <Input label="ALERGIAS" value={allergies} onChangeText={setAllergies} multiline />
          <Input label="CONDIÇÕES CRÔNICAS" value={chronicConditions} onChangeText={setChronicConditions} multiline />
        </Section>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Salvar carteirinha</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          accentColor={YELLOW}
          positiveButton={{ label: 'OK', textColor: YELLOW }}
          negativeButton={{ label: 'Cancelar', textColor: YELLOW }}
          onChange={(_event, selectedDate) => {
            if (Platform.OS === 'android') setShowDatePicker(false);

            if (selectedDate) {
              setScreeningDate(dateField, formatDate(selectedDate));
            }
          }}
        />
      )}

      <PickerModal
        visible={Boolean(pickerType)}
        title={
          pickerType === 'nationality'
            ? 'Selecionar nacionalidade'
            : pickerType === 'birthCountry'
              ? 'Selecionar país'
              : pickerType === 'birthState'
                ? 'Selecionar estado'
                : 'Selecionar cidade'
        }
        query={pickerQuery}
        onChangeQuery={setPickerQuery}
        items={filteredPickerItems}
        onSelect={selectPickerItem}
        onClose={() => setPickerType(null)}
      />
    </View>
  );
};

const Section = ({ title, icon, children }: any) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>{icon}</View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>

    {children}
  </View>
);

const ChipRow = ({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => (
  <View style={styles.chipGrid}>
    {options.map((option) => {
      const active = selected === option;

      return (
        <TouchableOpacity
          key={option}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  suffix,
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

      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  </View>
);

const SelectBox = ({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>

    <TouchableOpacity style={styles.selectBox} onPress={onPress}>
      <Text style={[styles.selectText, !value && styles.placeholderText]}>
        {value || placeholder}
      </Text>

      <ChevronRight size={18} color={YELLOW} />
    </TouchableOpacity>
  </View>
);

const DateSelect = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>

    <TouchableOpacity style={styles.selectBox} onPress={onPress}>
      <Text style={[styles.selectText, !value && styles.placeholderText]}>
        {value || 'Selecionar data'}
      </Text>

      <CalendarDays size={18} color={YELLOW} />
    </TouchableOpacity>
  </View>
);

const PickerModal = ({
  visible,
  title,
  query,
  onChangeQuery,
  items,
  onSelect,
  onClose,
}: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.pickerCard}>
        <Text style={styles.pickerTitle}>{title}</Text>

        <View style={styles.searchBox}>
          <Search size={18} color="#6B7A90" />

          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Digite para buscar..."
            placeholderTextColor="#9AA6B5"
          />
        </View>

        <ScrollView
          style={styles.pickerList}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item: any) => (
            <TouchableOpacity
              key={`${item.isoCode}-${item.name}`}
              style={styles.pickerItem}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.pickerItemText}>
                {item.flag ? `${item.flag}  ` : ''}
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
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
    backgroundColor: YELLOW_BG,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  heroTitle: { color: '#142033', fontSize: 20, fontWeight: '900', marginBottom: 5 },
  heroText: { color: '#6B7A90', fontSize: 14, lineHeight: 20, fontWeight: '600' },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: { color: '#142033', fontSize: 18, fontWeight: '900' },

  inputWrapper: { marginBottom: 14 },
  inputLabel: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 7,
  },
  inputBox: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#142033',
    fontSize: 15,
    fontWeight: '600',
  },
  suffix: {
    color: YELLOW,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },
  textAreaBox: {
    minHeight: 116,
    paddingTop: 14,
    alignItems: 'flex-start',
  },
  textArea: { minHeight: 96 },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
  },
  chipActive: { backgroundColor: YELLOW },
  chipText: { color: '#142033', fontSize: 13, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '900' },

  selectBox: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { color: '#142033', fontSize: 15, fontWeight: '700', flex: 1 },
  placeholderText: { color: '#9AA6B5' },

  saveButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginTop: 4,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,32,51,0.28)',
    justifyContent: 'center',
    padding: 24,
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    maxHeight: '82%',
  },
  pickerTitle: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  searchBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#142033',
    fontSize: 15,
    fontWeight: '600',
  },
  pickerList: { maxHeight: 340 },
  pickerItem: {
    minHeight: 50,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 7,
    backgroundColor: '#F7F9FC',
  },
  pickerItemText: {
    color: '#142033',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelButtonText: { color: YELLOW, fontSize: 15, fontWeight: '900' },
});