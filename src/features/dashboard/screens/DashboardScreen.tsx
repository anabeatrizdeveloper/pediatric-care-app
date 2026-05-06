import React, { useCallback, useState } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Bell,
  ChevronRight,
  BookOpen,
  Activity,
  FileText,
  Stethoscope,
  HeartPulse,
  Check,
  CalendarDays,
  Thermometer,
  Apple,
  Moon,
  Pill,
} from 'lucide-react-native';

import {
  Child,
  getChildren,
  getRecords,
  HealthRecord,
} from '../../../shared/services/localCareStorage';

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();

  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);

  const loadData = async () => {
    const children = await getChildren();
    const savedRecords = await getRecords();

    setActiveChild(children[0] ?? null);
    setRecords(savedRecords);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const childRecords = records.filter((record) => record.childId === activeChild?.id);

  const handleChildCardPress = () => {
    if (activeChild) {
      navigation.navigate('ChildrenList');
      return;
    }

    navigation.navigate('CreateChild');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bom dia,</Text>
            <Text style={styles.name}>Ana 🌿</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.bellButton}>
              <Bell size={22} color="#142033" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AM</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.childCard} onPress={handleChildCardPress}>
          {activeChild ? (
            <>
              <View style={styles.childTop}>
                <View style={styles.childEmojiBox}>
                  {activeChild.photoUri ? (
                    <Image source={{ uri: activeChild.photoUri }} style={styles.childPhoto} />
                  ) : (
                    <Text style={styles.childEmoji}>{activeChild.emoji}</Text>
                  )}
                </View>

                <View style={styles.childInfo}>
                  <Text style={styles.cardLabel}>PERFIL ATIVO</Text>
                  <Text style={styles.childName}>
                    {activeChild.nickname || activeChild.name}
                  </Text>
                  <Text style={styles.pediatrician}>
                    Pediatra: {activeChild.pediatricianName || 'Não vinculado'}
                  </Text>
                </View>

                <ChevronRight size={26} color="#FFFFFF" />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>10h</Text>
                  <Text style={styles.statLabel}>Sono</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {childRecords.filter((r) => r.type === 'food').length}
                  </Text>
                  <Text style={styles.statLabel}>Refeições</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>😊</Text>
                  <Text style={styles.statLabel}>Humor</Text>
                </View>
              </View>
            </>
          ) : (
            <View>
              <Text style={styles.cardLabel}>PRIMEIRO PASSO</Text>
              <Text style={styles.childName}>Cadastre uma criança</Text>
              <Text style={styles.pediatrician}>
                Toque aqui para criar o primeiro perfil.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Saúde da criança</Text>

        <View style={styles.menuGrid}>
          <MenuCard
            label="Diário"
            icon={<BookOpen size={22} color="#2F89E8" />}
            bg="#DFF0FF"
            onPress={() => navigation.navigate('Diary')}
          />

          <MenuCard
            label="Episódios"
            icon={<Activity size={22} color="#FF6B6B" />}
            bg="#FFE5E5"
            onPress={() => navigation.navigate('Episodes')}
          />

          <MenuCard
            label="Exames"
            icon={<FileText size={22} color="#6BCB77" />}
            bg="#E6F7EC"
            onPress={() => navigation.navigate('Exams')}
          />

          <MenuCard
            label="Consultas"
            icon={<Stethoscope size={22} color="#845EF7" />}
            bg="#EEE9FF"
            onPress={() => navigation.navigate('Consultations')}
          />

          <MenuCard
            label="Histórico"
            icon={<HeartPulse size={22} color="#F59F00" />}
            bg="#FFF3BF"
            onPress={() => navigation.navigate('History')}
          />
        </View>

        <View style={styles.todayHeader}>
          <Text style={styles.sectionTitle}>Hoje</Text>

          <TouchableOpacity style={styles.historyButton}>
            <CalendarDays size={16} color="#FFFFFF" />
            <Text style={styles.historyButtonText}>Ver registros</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineCard}>
          {childRecords.length > 0 ? (
            childRecords.map((record, index) => (
              <View key={record.id}>
                <TimelineItem record={record} />
                {index < childRecords.length - 1 && <Divider />}
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
              <Text style={styles.emptyText}>
                Comece registrando informações da criança.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const MenuCard = ({ label, icon, bg, onPress }: any) => (
  <TouchableOpacity style={[styles.menuCard, { backgroundColor: bg }]} onPress={onPress}>
    <View style={styles.menuIcon}>{icon}</View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const TimelineItem = ({ record }: { record: HealthRecord }) => {
  const config = {
    symptom: { icon: <Thermometer size={22} color="#FF3B30" />, bg: '#FFE1E3' },
    food: { icon: <Apple size={22} color="#40CFA0" />, bg: '#DFF9EF' },
    sleep: { icon: <Moon size={22} color="#7B5FD6" />, bg: '#E8DFFD' },
    medicine: { icon: <Pill size={22} color="#2F89E8" />, bg: '#DFF0FF' },
  }[record.type];

  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineIcon, { backgroundColor: config.bg }]}>
        {config.icon}
      </View>

      <View style={styles.timelineTextBox}>
        <Text style={styles.timelineTitle}>{record.title}</Text>
        <Text style={styles.timelineDescription}>
          {record.time} · {record.description}
        </Text>
      </View>

      {record.checked && (
        <View style={styles.checkCircle}>
          <Check size={17} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFFAFB',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  greeting: {
    color: '#6B7A90',
    fontSize: 16,
    marginBottom: 3,
  },
  name: {
    color: '#142033',
    fontSize: 28,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bellButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#F05252',
    position: 'absolute',
    top: 14,
    right: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#58CDAF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  childCard: {
    borderRadius: 28,
    backgroundColor: '#3D7DF0',
    padding: 22,
    marginBottom: 28,
  },
  childTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  childEmojiBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  childPhoto: {
    width: 68,
    height: 68,
  },
  childEmoji: {
    fontSize: 34,
  },
  childInfo: {
    flex: 1,
  },
  cardLabel: {
    color: '#DCEBFF',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
  },
  childName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  pediatrician: {
    color: '#E8F2FF',
    fontSize: 14,
    marginTop: 3,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#E8F2FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#142033',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  menuCard: {
    width: '48%',
    height: 72,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuLabel: {
    color: '#142033',
    fontSize: 15,
    fontWeight: '900',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  historyButton: {
    backgroundColor: '#3D7DF0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  timelineIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  timelineTextBox: {
    flex: 1,
  },
  timelineTitle: {
    color: '#142033',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  timelineDescription: {
    color: '#6B7A90',
    fontSize: 14,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#58CDAF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5EAF2',
    marginLeft: 82,
  },
  emptyBox: {
    padding: 22,
  },
  emptyTitle: {
    color: '#142033',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6B7A90',
    fontSize: 14,
  },
});