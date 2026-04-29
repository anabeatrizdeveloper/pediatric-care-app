import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Heart, Stethoscope, User, Mail, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { signUp, ProfileType } from '../services/authService';

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const step1Done = name.trim().length > 0;
  const step2Done = email.trim().length > 0 && password.trim().length > 0;
  const step3Done = profileType !== null;

  const canContinue = step1Done && step2Done && step3Done && !isLoading;

  const handleRegister = async () => {
    if (!canContinue || !profileType) return;

    try {
      setIsLoading(true);

      await signUp({
        name,
        email,
        password,
        profile_type: profileType,
      });
    } catch (error: any) {
      Alert.alert('Erro ao criar conta', error.message ?? 'Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color="#142033" />
      </TouchableOpacity>

      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>
        Escolha seu perfil para personalizar sua experiência no app.
      </Text>

      <View style={styles.progressRow}>
        <View style={[styles.progressBase, step1Done && styles.progressActive]} />
        <View style={[styles.progressBase, step2Done && styles.progressActive]} />
        <View style={[styles.progressBase, step3Done && styles.progressActive]} />
      </View>

      <Text style={styles.label}>NOME COMPLETO</Text>
      <View style={styles.inputBox}>
        <User size={20} color="#6B7A90" />
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#9AA6B5"
          value={name}
          onChangeText={setName}
        />
      </View>

      <Text style={styles.label}>E-MAIL</Text>
      <View style={styles.inputBox}>
        <Mail size={20} color="#6B7A90" />
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#9AA6B5"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <Text style={styles.label}>CRIE UMA SENHA</Text>
      <View style={styles.inputBox}>
        <Lock size={20} color="#6B7A90" />
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#9AA6B5"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Text style={styles.sectionLabel}>TIPO DE PERFIL</Text>

      <View style={styles.profileBox}>
        <TouchableOpacity
          style={[
            styles.profileOption,
            profileType === 'responsavel' && styles.profileOptionActive,
          ]}
          onPress={() => setProfileType('responsavel')}
        >
          <Heart size={28} color={profileType === 'responsavel' ? '#2F89E8' : '#9AA6B5'} />
          <Text style={[styles.profileText, profileType === 'responsavel' && styles.profileTextActive]}>
            Responsável
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.profileOption,
            profileType === 'pediatra' && styles.profileOptionActive,
          ]}
          onPress={() => setProfileType('pediatra')}
        >
          <Stethoscope size={28} color={profileType === 'pediatra' ? '#2F89E8' : '#9AA6B5'} />
          <Text style={[styles.profileText, profileType === 'pediatra' && styles.profileTextActive]}>
            Pediatra
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        disabled={!canContinue}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Criando conta...' : 'Continuar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 28 },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: { color: '#142033', fontSize: 34, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#6B7A90', fontSize: 16, lineHeight: 23, marginBottom: 26 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  progressBase: { flex: 1, height: 5, borderRadius: 10, backgroundColor: '#E5EAF2' },
  progressActive: { backgroundColor: '#2F89E8' },
  label: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputBox: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 16,
    gap: 10,
  },
  input: { flex: 1, color: '#142033', fontSize: 15 },
  sectionLabel: {
    color: '#2F89E8',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },
  profileBox: {
    backgroundColor: '#E4F3FF',
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  profileOption: {
    flex: 1,
    height: 104,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileOptionActive: { backgroundColor: '#FFFFFF', borderColor: '#2F89E8' },
  profileText: { color: '#6B7A90', fontSize: 15, fontWeight: '900' },
  profileTextActive: { color: '#142033' },
  button: {
    height: 60,
    borderRadius: 20,
    backgroundColor: '#3D7DF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#AFC6F6' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
});