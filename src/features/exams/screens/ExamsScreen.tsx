import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FileText, Plus, Search, Filter } from 'lucide-react-native';
import { getChildren, getExams, deleteExam, Exam } from '../../../shared/services/localCareStorage';

const BLUE = '#4D8DFF';
const BLUE_BG = '#EAF2FF';

const reasons = ['Rotina', 'Acompanhamento', 'Episódio', 'Investigação'];

export const ExamsScreen = () => {
  const navigation = useNavigation<any>();

  const [exams, setExams] = useState<Exam[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(false);

  const load = async () => {
    const children = await getChildren();
    const child = children[0];

    if (!child) return;

    const data = await getExams();
    setExams(data.filter(e => e.childId === child.id));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = useMemo(() => {
    return exams.filter(e => {
      const matchesQuery = e.title.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter ? e.reason === filter : true;
      return matchesQuery && matchesFilter;
    });
  }, [exams, query, filter]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>Exames</Text>

        <View style={styles.search}>
          <Search size={18} color="#888" />
          <TextInput
            placeholder="Buscar exame..."
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1 }}
          />
        </View>

        <TouchableOpacity style={styles.filter} onPress={() => setModal(true)}>
          <Filter color={BLUE} />
          <Text style={{ color: BLUE }}>
            {filter || 'Filtrar por motivo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.add}
          onPress={() => navigation.navigate('CreateExam')}
        >
          <Plus color="#fff" />
          <Text style={{ color: '#fff' }}>Novo exame</Text>
        </TouchableOpacity>

        {filtered.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('ExamDetails', { id: item.id })}
            onLongPress={() => deleteExam(item.id).then(load)}
          >
            <FileText color={BLUE} />
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text>{item.reason}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FILTER MODAL */}
      <Modal visible={modal} transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {reasons.map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => {
                  setFilter(r);
                  setModal(false);
                }}
              >
                <Text style={styles.modalItem}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F7F9FC' },
  content:{ padding:20 },

  title:{ fontSize:26, fontWeight:'900', marginBottom:20 },

  search:{ flexDirection:'row', backgroundColor:'#eee', padding:10, borderRadius:12 },

  filter:{ flexDirection:'row', gap:6, marginVertical:10 },

  add:{ backgroundColor:BLUE, padding:12, borderRadius:12, flexDirection:'row', gap:6 },

  card:{
    flexDirection:'row',
    gap:10,
    backgroundColor:'#fff',
    padding:14,
    borderRadius:12,
    marginTop:10
  },

  cardTitle:{ fontWeight:'800' },

  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center' },
  modalBox:{ backgroundColor:'#fff', margin:20, padding:20, borderRadius:20 },
  modalItem:{ padding:10 }
});