import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  ShieldCheck,
  UploadCloud,
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

export const HealthBookletPdfScreen = () => {
  const navigation = useNavigation<any>();

  const [childId, setChildId] = useState('');
  const [booklet, setBooklet] = useState<HealthBooklet | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileUri, setPdfFileUri] = useState('');

  useEffect(() => {
    const load = async () => {
      const children = await getChildren();
      const child = children[0];

      if (!child) return;

      setChildId(child.id);

      const existing = await getHealthBookletByChild(child.id);

      if (existing) {
        setBooklet(existing);
        setPdfFileName(existing.pdfFileName ?? '');
        setPdfFileUri(existing.pdfFileUri ?? '');
      }
    };

    load();
  }, []);

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const selectedFile = result.assets[0];

    try {
      const dir = `${FileSystem.documentDirectory}health-booklets/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const safeFileName = `${Date.now()}-${selectedFile.name}`;
      const permanentUri = `${dir}${safeFileName}`;

      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: permanentUri,
      });

      setPdfFileName(selectedFile.name);
      setPdfFileUri(permanentUri);
    } catch (error) {
      Alert.alert(
        'Erro ao salvar PDF',
        'Não foi possível salvar a carteirinha no dispositivo.'
      );
    }
  };

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Criança não encontrada', 'Cadastre uma criança antes de salvar a carteirinha.');
      return;
    }

    if (!pdfFileUri) {
      Alert.alert('PDF obrigatório', 'Selecione o PDF da carteirinha antes de salvar.');
      return;
    }

    const now = new Date().toISOString();

    const data: HealthBooklet = {
      id: booklet?.id ?? String(Date.now()),
      childId,

      childFullName: booklet?.childFullName ?? '',
      nickname: booklet?.nickname ?? '',
      birthDate: booklet?.birthDate ?? '',
      gender: booklet?.gender ?? '',

      birthCity: booklet?.birthCity ?? '',
      birthState: booklet?.birthState ?? '',
      motherName: booklet?.motherName ?? '',
      fatherName: booklet?.fatherName ?? '',
      guardianName: booklet?.guardianName ?? '',
      address: booklet?.address ?? '',
      susCard: booklet?.susCard ?? '',
      healthUnit: booklet?.healthUnit ?? '',

      birthHospital: booklet?.birthHospital ?? '',
      deliveryType: booklet?.deliveryType ?? '',
      gestationalAge: booklet?.gestationalAge ?? '',
      birthWeight: booklet?.birthWeight ?? '',
      birthLength: booklet?.birthLength ?? '',
      birthHeadCircumference: booklet?.birthHeadCircumference ?? '',
      apgarOne: booklet?.apgarOne ?? '',
      apgarFive: booklet?.apgarFive ?? '',
      birthIntercurrences: booklet?.birthIntercurrences ?? '',
      neonatalIcu: booklet?.neonatalIcu ?? false,

      heelPrickTest: booklet?.heelPrickTest ?? '',
      hearingTest: booklet?.hearingTest ?? '',
      eyeTest: booklet?.eyeTest ?? '',
      heartTest: booklet?.heartTest ?? '',
      tongueTest: booklet?.tongueTest ?? '',
      neonatalScreeningNotes: booklet?.neonatalScreeningNotes ?? '',

      breastfeedingNotes: booklet?.breastfeedingNotes ?? '',
      foodIntroductionNotes: booklet?.foodIntroductionNotes ?? '',
      foodAllergies: booklet?.foodAllergies ?? '',

      currentWeight: booklet?.currentWeight ?? '',
      currentHeight: booklet?.currentHeight ?? '',
      currentHeadCircumference: booklet?.currentHeadCircumference ?? '',
      currentBmi: booklet?.currentBmi ?? '',
      growthNotes: booklet?.growthNotes ?? '',

      developmentMilestones: booklet?.developmentMilestones ?? '',
      developmentAlerts: booklet?.developmentAlerts ?? '',
      developmentReferrals: booklet?.developmentReferrals ?? '',

      vaccineNotes: booklet?.vaccineNotes ?? '',
      pendingVaccines: booklet?.pendingVaccines ?? '',

      dentalNotes: booklet?.dentalNotes ?? '',

      clinicalHistory: booklet?.clinicalHistory ?? '',
      hospitalizations: booklet?.hospitalizations ?? '',
      surgeries: booklet?.surgeries ?? '',
      continuousMedications: booklet?.continuousMedications ?? '',
      allergies: booklet?.allergies ?? '',
      chronicConditions: booklet?.chronicConditions ?? '',

      pdfFileName,
      pdfFileUri,

      aiTranscriptionStatus: booklet?.aiTranscriptionStatus ?? 'not_started',

      createdAt: booklet?.createdAt ?? now,
      updatedAt: now,
    };

    if (booklet) {
      await updateHealthBooklet(data);
    } else {
      await saveHealthBooklet(data);
    }

    Alert.alert('PDF salvo', 'A carteirinha foi salva no histórico da criança.');
    navigation.goBack();
  };

  const openPdf = async () => {
    if (!pdfFileUri) return;

    try {
      const fileInfo = await FileSystem.getInfoAsync(pdfFileUri);

      if (!fileInfo.exists) {
        Alert.alert(
          'PDF não encontrado',
          'Esse arquivo parece não estar mais salvo no dispositivo.'
        );
        return;
      }

      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(pdfFileUri);

        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: 'application/pdf',
        });

        return;
      }

      await Sharing.shareAsync(pdfFileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Abrir carteirinha em PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert(
        'Erro ao abrir PDF',
        'Verifique se existe algum leitor de PDF instalado no dispositivo.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>PDF da carteirinha</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <ShieldCheck size={30} color={YELLOW} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Guardar PDF original</Text>
            <Text style={styles.heroText}>
              Salve a carteirinha oficial em PDF para consultar sempre que precisar.
            </Text>
          </View>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Como funciona</Text>
          <Step number="1" text="Selecione o PDF da carteirinha." />
          <Step number="2" text="O app salva uma cópia permanente no dispositivo." />
          <Step number="3" text="Depois você pode abrir ou substituir o arquivo." />
        </View>

        <Text style={styles.inputLabel}>ARQUIVO PDF</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickPdf}>
          <View style={styles.uploadIcon}>
            {pdfFileUri ? (
              <FileText size={26} color={YELLOW} />
            ) : (
              <UploadCloud size={26} color={YELLOW} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>
              {pdfFileName || 'Selecionar PDF da carteirinha'}
            </Text>

            <Text style={styles.uploadText}>
              {pdfFileUri
                ? 'PDF selecionado. Toque para substituir.'
                : 'Escolha um arquivo PDF salvo no dispositivo.'}
            </Text>
          </View>
        </TouchableOpacity>

        {pdfFileUri ? (
          <TouchableOpacity style={styles.openButton} onPress={openPdf}>
            <ExternalLink size={19} color={YELLOW} />
            <Text style={styles.openButtonText}>Abrir PDF selecionado</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Salvar PDF da carteirinha</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const Step = ({ number, text }: { number: string; text: string }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>

    <Text style={styles.stepText}>{text}</Text>
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
    backgroundColor: YELLOW_BG,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 18,
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

  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },
  stepsTitle: { color: '#142033', fontSize: 18, fontWeight: '900', marginBottom: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: { color: YELLOW, fontSize: 13, fontWeight: '900' },
  stepText: { flex: 1, color: '#6B7A90', fontSize: 14, lineHeight: 20, fontWeight: '700' },

  inputLabel: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
  },

  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uploadTitle: { color: '#142033', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  uploadText: { color: '#6B7A90', fontSize: 13, lineHeight: 19, fontWeight: '600' },

  openButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  openButtonText: { color: YELLOW, fontSize: 15, fontWeight: '900' },

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
  saveButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
});