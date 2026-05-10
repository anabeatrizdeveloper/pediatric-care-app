import React, { useCallback, useMemo, useState } from 'react';
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
  Brain,
  ChevronRight,
  FileText,
  PencilLine,
  ShieldCheck,
} from 'lucide-react-native';

import {
  getChildren,
  getHealthBookletByChild,
  HealthBooklet,
} from '../../../shared/services/localCareStorage';

const YELLOW = '#FFB84D';
const YELLOW_BG = '#FFF1D9';

const BLUE = '#4D8DFF';
const BLUE_BG = '#EAF2FF';

const PURPLE = '#8A63FF';
const PURPLE_BG = '#F0EAFF';

export const HistoryScreen = () => {
  const navigation = useNavigation<any>();

  const [booklet, setBooklet] = useState<HealthBooklet | null>(null);

  const load = async () => {
    const children = await getChildren();
    const child = children[0];

    if (!child) {
      setBooklet(null);
      return;
    }

    const existingBooklet = await getHealthBookletByChild(child.id);

    setBooklet(existingBooklet);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const hasPdf = Boolean(booklet?.pdfFileUri);

  const hasDigitalFields = useMemo(() => {
    if (!booklet) return false;

    const fields = [
      booklet.childFullName,
      booklet.birthDate,
      booklet.gender,
      booklet.birthHospital,
      booklet.birthWeight,
      booklet.birthLength,
      booklet.heelPrickTest,
      booklet.vaccineNotes,
      booklet.clinicalHistory,
      booklet.developmentMilestones,
    ];

    return fields.some((item) => item && item.trim().length > 0);
  }, [booklet]);

  const bookletMode: 'none' | 'pdf' | 'digital' | 'mixed' = useMemo(() => {
    if (!booklet) return 'none';

    if (hasPdf && hasDigitalFields) return 'mixed';

    if (hasPdf) return 'pdf';

    return 'digital';
  }, [booklet, hasPdf, hasDigitalFields]);

  const openBooklet = () => {
    if (!booklet) return;

    if (bookletMode === 'pdf') {
      navigation.navigate('HealthBookletPdf');
      return;
    }

    navigation.navigate('HealthBookletDetails');
  };

  const getBookletTitle = () => {
    if (bookletMode === 'pdf') {
      return 'Carteirinha em PDF encontrada';
    }

    if (bookletMode === 'mixed') {
      return 'Carteirinha digital + PDF encontrados';
    }

    return 'Carteirinha digital encontrada';
  };

  const getBookletSubtitle = () => {
    if (bookletMode === 'pdf') {
      return 'Toque para abrir, substituir ou consultar o PDF salvo.';
    }

    if (bookletMode === 'mixed') {
      return 'Toque para visualizar os dados preenchidos. O PDF também está salvo.';
    }

    return 'Toque para visualizar ou editar os dados preenchidos.';
  };

  const getBookletIcon = () => {
    if (bookletMode === 'pdf') {
      return <FileText size={24} color={BLUE} />;
    }

    return <ShieldCheck size={24} color={YELLOW} />;
  };

  const getBookletIconStyle = () => {
    if (bookletMode === 'pdf') {
      return styles.bookletIconBlue;
    }

    return styles.bookletIconYellow;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Histórico</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <ShieldCheck size={30} color={YELLOW} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              Carteirinha digital da criança
            </Text>

            <Text style={styles.heroText}>
              Organize nascimento, crescimento, vacinas, histórico clínico e o
              PDF original da carteirinha em um só lugar.
            </Text>
          </View>
        </View>

        {booklet ? (
          <TouchableOpacity
            style={styles.bookletCard}
            activeOpacity={0.86}
            onPress={openBooklet}
          >
            <View style={styles.bookletLeft}>
              <View style={getBookletIconStyle()}>
                {getBookletIcon()}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.bookletTitle}>
                  {getBookletTitle()}
                </Text>

                <Text style={styles.bookletSubtitle}>
                  {getBookletSubtitle()}
                </Text>

                <View style={styles.tagRow}>
                  {hasPdf ? (
                    <Tag label="PDF salvo" tone="blue" />
                  ) : null}

                  {hasDigitalFields ? (
                    <Tag label="Dados preenchidos" tone="yellow" />
                  ) : null}
                </View>
              </View>
            </View>

            <ChevronRight size={20} color="#142033" />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Nenhuma carteirinha cadastrada
            </Text>

            <Text style={styles.emptyText}>
              Escolha uma das opções abaixo para começar a montar o histórico da
              criança.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          FORMAS DE ADICIONAR A CARTEIRINHA
        </Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() =>
            navigation.navigate('HealthBookletAIScan')
          }
        >
          <View style={styles.optionIconPurple}>
            <Brain size={28} color={PURPLE} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>
              Transcrever com IA
            </Text>

            <Text style={styles.optionText}>
              Envie o PDF da carteirinha e revise os dados antes de salvar na
              versão digital.
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Mais rápido
              </Text>
            </View>
          </View>

          <ChevronRight size={20} color="#142033" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() =>
            navigation.navigate('HealthBookletPdf')
          }
        >
          <View style={styles.optionIconBlue}>
            <FileText size={28} color={BLUE} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>
              Salvar somente o PDF
            </Text>

            <Text style={styles.optionText}>
              Guarde a carteirinha oficial em PDF, sem preencher os campos
              manualmente.
            </Text>
          </View>

          <ChevronRight size={20} color="#142033" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() =>
            navigation.navigate('CreateHealthBooklet')
          }
        >
          <View style={styles.optionIconYellow}>
            <PencilLine size={28} color={YELLOW} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>
              Preencher manualmente
            </Text>

            <Text style={styles.optionText}>
              Adicione nascimento, crescimento, vacinas, triagens e histórico
              clínico manualmente.
            </Text>
          </View>

          <ChevronRight size={20} color="#142033" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const Tag = ({
  label,
  tone,
}: {
  label: string;
  tone: 'blue' | 'yellow';
}) => (
  <View
    style={[
      styles.tag,
      tone === 'blue'
        ? styles.tagBlue
        : styles.tagYellow,
    ]}
  >
    <Text
      style={[
        styles.tagText,
        tone === 'blue'
          ? styles.tagTextBlue
          : styles.tagTextYellow,
      ]}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  headerTitle: {
    color: '#142033',
    fontSize: 24,
    fontWeight: '900',
  },

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
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  heroTitle: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 5,
  },

  heroText: {
    color: '#6B7A90',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  bookletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bookletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  bookletIconYellow: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  bookletIconBlue: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: BLUE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  bookletTitle: {
    color: '#142033',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  bookletSubtitle: {
    color: '#6B7A90',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },

  tag: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  tagBlue: {
    backgroundColor: BLUE_BG,
  },

  tagYellow: {
    backgroundColor: YELLOW_BG,
  },

  tagText: {
    fontSize: 11,
    fontWeight: '900',
  },

  tagTextBlue: {
    color: BLUE,
  },

  tagTextYellow: {
    color: YELLOW,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },

  emptyTitle: {
    color: '#142033',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyText: {
    color: '#6B7A90',
    fontSize: 14,
    lineHeight: 20,
  },

  sectionLabel: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 12,
  },

  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',
  },

  optionIconPurple: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: PURPLE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  optionIconBlue: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: BLUE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  optionIconYellow: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: YELLOW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  optionTitle: {
    color: '#142033',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },

  optionText: {
    color: '#6B7A90',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  badge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: PURPLE_BG,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: '900',
  },
});