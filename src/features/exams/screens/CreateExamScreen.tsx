import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { saveExam, getChildren } from '../../../shared/services/localCareStorage';

const BLUE = '#4D8DFF';

export const CreateExamScreen = ({ navigation }: any) => {

  const [file, setFile] = useState<any>(null);
  const [reason, setReason] = useState('Rotina');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleSave = async () => {
    const children = await getChildren();
    const child = children[0];

    await saveExam({
      id: String(Date.now()),
      childId: child.id,
      title: file.name,
      reason,
      fileUri: file.uri,
      createdAt: new Date().toISOString(),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo exame</Text>

      <TouchableOpacity style={styles.upload} onPress={pickFile}>
        <Text>{file ? file.name : 'Selecionar PDF'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.save} onPress={handleSave}>
        <Text style={{ color:'#fff' }}>Salvar exame</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  title:{ fontSize:24, fontWeight:'900', marginBottom:20 },

  upload:{ backgroundColor:'#eee', padding:20, borderRadius:12 },

  save:{ backgroundColor:BLUE, padding:15, borderRadius:12, marginTop:20 }
});