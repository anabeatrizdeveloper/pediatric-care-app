import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Edit3,
  FileText,
  HeartPulse,
  Hospital,
  ShieldCheck,
  Syringe,
  Utensils,
} from 'lucide-react-native';

import {
  getChildren,
  getHealthBookletByChild,
  HealthBooklet,
} from '../../../shared/services/localCareStorage';

const YELLOW = '#FFB84D';
const YELLOW_BG = '#FFF1D9';

export const HealthBookletDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const [booklet, setBooklet] = useState<HealthBooklet | null>(null);

  const load = async () => {
    const children = await getChildren();
    const child = children[0];

    if (!child) return;

    const data = await getHealthBookletByChild(child.id);
    setBooklet(data);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  if (!booklet) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyTitle}>Nenhuma carteirinha encontrada</Text>
          <Text style={styles.emptyText}>
            Preencha manualmente ou adicione o PDF da carteirinha.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateHealthBooklet')}
          >
            <Edit3 size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Criar carteirinha</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Carteirinha</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <ShieldCheck size={30} color={YELLOW} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{booklet.childFullName}</Text>
            <Text style={styles.heroText}>
              Histórico geral da criança organizado em formato digital.
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('HealthBookletPdf')}
          >
            <FileText size={18} color={YELLOW} />
            <Text style={styles.secondaryButtonText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateHealthBooklet')}
          >
            <Edit3 size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Section title="Identificação" icon={<Baby size={22} color={YELLOW} />}>
          <Info label="Nome completo" value={booklet.childFullName} />
          <Info label="Apelido / nome social" value={booklet.nickname} />
          <Info label="Data de nascimento" value={booklet.birthDate} />
          <Info label="Sexo" value={booklet.gender} />
          <Info label="Cidade/UF de nascimento" value={joinValues([booklet.birthCity, booklet.birthState])} />
          <Info label="Nome da mãe" value={booklet.motherName} />
          <Info label="Nome do pai" value={booklet.fatherName} />
          <Info label="Responsável" value={booklet.guardianName} />
          <Info label="Cartão SUS" value={booklet.susCard} />
          <Info label="Unidade de saúde" value={booklet.healthUnit} />
        </Section>

        <Section title="Nascimento" icon={<Hospital size={22} color={YELLOW} />}>
          <Info label="Maternidade / hospital" value={booklet.birthHospital} />
          <Info label="Tipo de parto" value={booklet.deliveryType} />
          <Info label="Idade gestacional" value={booklet.gestationalAge} />
          <Info label="Peso ao nascer" value={booklet.birthWeight} />
          <Info label="Comprimento ao nascer" value={booklet.birthLength} />
          <Info label="Perímetro cefálico" value={booklet.birthHeadCircumference} />
          <Info label="Apgar 1º minuto" value={booklet.apgarOne} />
          <Info label="Apgar 5º minuto" value={booklet.apgarFive} />
          <Info label="Intercorrências" value={booklet.birthIntercurrences} />
        </Section>

        <Section title="Triagens neonatais" icon={<HeartPulse size={22} color={YELLOW} />}>
          <Info label="Teste do pezinho" value={booklet.heelPrickTest} />
          <Info label="Teste da orelhinha" value={booklet.hearingTest} />
          <Info label="Teste do olhinho" value={booklet.eyeTest} />
          <Info label="Teste do coraçãozinho" value={booklet.heartTest} />
          <Info label="Teste da linguinha" value={booklet.tongueTest} />
        </Section>

        <Section title="Alimentação" icon={<Utensils size={22} color={YELLOW} />}>
          <Info label="Aleitamento" value={booklet.breastfeedingNotes} />
          <Info label="Introdução alimentar" value={booklet.foodIntroductionNotes} />
          <Info label="Alergias/restrições alimentares" value={booklet.foodAllergies} />
        </Section>

        <Section title="Crescimento e desenvolvimento" icon={<HeartPulse size={22} color={YELLOW} />}>
          <Info label="Peso atual" value={booklet.currentWeight} />
          <Info label="Altura atual" value={booklet.currentHeight} />
          <Info label="Perímetro cefálico atual" value={booklet.currentHeadCircumference} />
          <Info label="Observações de crescimento" value={booklet.growthNotes} />
          <Info label="Marcos do desenvolvimento" value={booklet.developmentMilestones} />
          <Info label="Alertas/atrasos observados" value={booklet.developmentAlerts} />
          <Info label="Encaminhamentos" value={booklet.developmentReferrals} />
        </Section>

        <Section title="Vacinas e saúde bucal" icon={<Syringe size={22} color={YELLOW} />}>
          <Info label="Resumo de vacinação" value={booklet.vaccineNotes} />
          <Info label="Vacinas pendentes" value={booklet.pendingVaccines} />
          <Info label="Saúde bucal" value={booklet.dentalNotes} />
        </Section>

        <Section title="Histórico clínico" icon={<ShieldCheck size={22} color={YELLOW} />}>
          <Info label="Doenças importantes" value={booklet.clinicalHistory} />
          <Info label="Internações" value={booklet.hospitalizations} />
          <Info label="Cirurgias" value={booklet.surgeries} />
          <Info label="Medicamentos contínuos" value={booklet.continuousMedications} />
          <Info label="Alergias" value={booklet.allergies} />
          <Info label="Condições crônicas" value={booklet.chronicConditions} />
        </Section>

        <View style={styles.footerCard}>
          <CalendarDays size={18} color={YELLOW} />
          <Text style={styles.footerText}>
            Atualizado em {formatDate(booklet.updatedAt)}
          </Text>
        </View>
      </ScrollView>
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

const Info = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;

  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const joinValues = (values: Array<string | undefined>) => {
  const filtered = values.filter(Boolean);
  return filtered.length ? filtered.join(' / ') : undefined;
};

const formatDate = (iso: string) => {
  if (!iso) return 'data não informada';
  return new Date(iso).toLocaleDateString('pt-BR');
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },

  emptyCenter: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#142033',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6B7A90',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
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
    backgroundColor: YELLOW_BG,
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

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: { color: YELLOW, fontSize: 15, fontWeight: '900' },
  primaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
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

  infoBlock: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  infoLabel: {
    color: YELLOW,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#142033',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '650',
  },

  footerCard: {
    backgroundColor: YELLOW_BG,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#6B7A90',
    fontSize: 14,
    fontWeight: '800',
  },
});