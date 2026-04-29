import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Child,
  getChildren,
} from '../../../shared/services/localCareStorage';

export const ChildrenListScreen = () => {
  const navigation = useNavigation<any>();
  const [children, setChildren] = useState<Child[]>([]);

  const loadChildren = async () => {
    const data = await getChildren();
    setChildren(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#142033" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Ver criança</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateChild')}
        >
          <View style={styles.addIcon}>
            <Plus size={22} color="#FFFFFF" />
          </View>
          <View style={styles.addTextBox}>
            <Text style={styles.addTitle}>Adicionar outra criança</Text>
            <Text style={styles.addSubtitle}>Cadastre outro filho ou dependente.</Text>
          </View>
        </TouchableOpacity>

        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={styles.childCard}
            onPress={() => navigation.navigate('CreateChild', { childId: child.id })}
          >
            <View style={styles.avatar}>
              {child.photoUri ? (
                <Image source={{ uri: child.photoUri }} style={styles.photo} />
              ) : (
                <Text style={styles.emoji}>{child.emoji}</Text>
              )}
            </View>

            <View style={styles.childInfo}>
              <Text style={styles.childName}>{child.nickname || child.name}</Text>
              <Text style={styles.childMeta}>{child.birthDate} · {child.weight || '--'} kg</Text>
              <Text style={styles.childMeta}>
                {child.allergies ? `Alergias: ${child.allergies}` : 'Sem alergias informadas'}
              </Text>
            </View>

            <ChevronRight size={24} color="#9AA6B5" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2F7',
    alignItems: 'center', justifyContent: 'center', marginRight: 18,
  },
  headerTitle: { color: '#142033', fontSize: 24, fontWeight: '900' },
  addButton: {
    borderRadius: 24,
    backgroundColor: '#3D7DF0',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  addTextBox: { flex: 1 },
  addTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginBottom: 3 },
  addSubtitle: { color: '#E8F2FF', fontSize: 14, fontWeight: '600' },
  childCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#DFF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  photo: {
    width: 66,
    height: 66,
  },
  emoji: {
    fontSize: 32,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  childMeta: {
    color: '#6B7A90',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
});