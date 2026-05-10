import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react-native';

const YELLOW = '#FFB84D';
const YELLOW_BG = '#FFF1D9';
const PURPLE = '#8A63FF';
const PURPLE_BG = '#F0EAFF';

export const HealthBookletAIScanScreen = () => {
  const navigation = useNavigation<any>();

  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ready' | 'analyzing' | 'done'>('idle');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    setFileName(result.assets[0].name);
    setStatus('ready');
  };

  const startAnalysis = () => {
    if (!fileName) {
      Alert.alert('PDF obrigatório', 'Selecione o PDF da carteirinha antes de iniciar.');
      return;
    }

    setStatus('analyzing');

    setTimeout(() => {
      setStatus('done');
    }, 1600);
  };

  const goToReview = () => {
    navigation.navigate('CreateHealthBooklet');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Transcrever com IA</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Brain size={30} color={PURPLE} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>IA para carteirinha</Text>
            <Text style={styles.heroText}>
              Envie o PDF da carteirinha e revise os dados antes de salvar na versão digital.
            </Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <ShieldCheck size={22} color={YELLOW} />
          <Text style={styles.noticeText}>
            A IA deve ajudar no preenchimento, mas os responsáveis sempre precisam revisar os dados antes de salvar.
          </Text>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Como vai funcionar</Text>
          <Step number="1" text="Você envia o PDF da carteirinha." />
          <Step number="2" text="A IA tenta identificar nascimento, vacinas, triagens e histórico." />
          <Step number="3" text="Você revisa tudo em uma tela editável antes de salvar." />
        </View>

        <Text style={styles.inputLabel}>PDF DA CARTEIRINHA</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
          <View style={styles.uploadIcon}>
            {fileName ? (
              <FileText size={26} color={PURPLE} />
            ) : (
              <UploadCloud size={26} color={PURPLE} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>
              {fileName || 'Selecionar PDF'}
            </Text>
            <Text style={styles.uploadText}>
              {fileName
                ? 'Arquivo pronto para análise.'
                : 'Escolha o PDF da carteirinha no dispositivo.'}
            </Text>
          </View>
        </TouchableOpacity>

        {status === 'analyzing' ? (
          <View style={styles.analysisCard}>
            <Sparkles size={26} color={PURPLE} />
            <Text style={styles.analysisTitle}>Analisando carteirinha...</Text>
            <Text style={styles.analysisText}>
              Identificando campos importantes para montar a versão digital.
            </Text>
          </View>
        ) : null}

        {status === 'done' ? (
          <View style={styles.doneCard}>
            <CheckCircle2 size={28} color={PURPLE} />
            <Text style={styles.doneTitle}>Pré-análise concluída</Text>
            <Text style={styles.doneText}>
              Agora revise e complete os campos manualmente antes de salvar.
            </Text>
          </View>
        ) : null}

        {status === 'done' ? (
          <TouchableOpacity style={styles.primaryButton} onPress={goToReview}>
            <CheckCircle2 size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Revisar dados</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={startAnalysis}>
            <Sparkles size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Iniciar transcrição</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('CreateHealthBooklet')}
        >
          <Text style={styles.secondaryButtonText}>Preencher manualmente</Text>
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
    backgroundColor: PURPLE_BG,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 16,
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

  noticeCard: {
    backgroundColor: YELLOW_BG,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    color: '#6B7A90',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },

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
    backgroundColor: PURPLE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: { color: PURPLE, fontSize: 13, fontWeight: '900' },
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
    backgroundColor: PURPLE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uploadTitle: { color: '#142033', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  uploadText: { color: '#6B7A90', fontSize: 13, lineHeight: 19, fontWeight: '600' },

  analysisCard: {
    backgroundColor: PURPLE_BG,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  analysisTitle: { color: '#142033', fontSize: 17, fontWeight: '900', marginTop: 8, marginBottom: 4 },
  analysisText: { color: '#6B7A90', fontSize: 14, textAlign: 'center', lineHeight: 20, fontWeight: '600' },

  doneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  doneTitle: { color: '#142033', fontSize: 17, fontWeight: '900', marginTop: 8, marginBottom: 4 },
  doneText: { color: '#6B7A90', fontSize: 14, textAlign: 'center', lineHeight: 20, fontWeight: '600' },

  primaryButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginTop: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },

  secondaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: YELLOW, fontSize: 15, fontWeight: '900' },
});