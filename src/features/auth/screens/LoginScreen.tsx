import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { ArrowLeft, Mail, Lock, Eye } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../services/authService';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();

  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canLogin = email.trim().length > 0 && password.trim().length > 0 && !isLoading;

  const handleLogin = async () => {
    if (!canLogin) return;

    try {
      setIsLoading(true);

      await signIn({
        email,
        password,
      });
    } catch (error: any) {
      Alert.alert('Erro ao entrar', error.message ?? 'Confira seus dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={26} color="#142033" />
      </TouchableOpacity>

      <Text style={styles.title}>
        Bem-vindo{'\n'}de volta 👋
      </Text>

      <Text style={styles.subtitle}>
        Entre para continuar acompanhando a saúde dos seus pequenos.
      </Text>

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

      <Text style={styles.label}>SENHA</Text>
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
        <Eye size={20} color="#6B7A90" />
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberArea}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            style={[
              styles.checkbox,
              rememberMe && styles.checkboxActive,
            ]}
          >
            {rememberMe && <Text style={styles.checkText}>✓</Text>}
          </View>

          <Text style={styles.optionText}>Manter conectada</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, !canLogin && styles.loginButtonDisabled]}
        disabled={!canLogin}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.continueText}>ou continue com</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Novo por aqui? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupLink}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 24,
    paddingTop: 48,
  },

  backButton: {
    marginBottom: 20,
  },

  title: {
    color: '#142033',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    marginBottom: 12,
  },

  subtitle: {
    color: '#6B7A90',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 22,
  },

  label: {
    color: '#6B7A90',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 6,
  },

  inputBox: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 10,
  },

  input: {
    flex: 1,
    color: '#142033',
    fontSize: 15,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  rememberArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#9AA6B5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxActive: {
    backgroundColor: '#2F89E8',
    borderColor: '#2F89E8',
  },

  checkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  optionText: {
    color: '#6B7A90',
    fontSize: 13,
  },

  forgotText: {
    color: '#2F89E8',
    fontSize: 13,
    fontWeight: '800',
  },

  loginButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#3D7DF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loginButtonDisabled: {
    backgroundColor: '#AFC6F6',
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  continueText: {
    textAlign: 'center',
    color: '#6B7A90',
    fontSize: 14,
    marginBottom: 12,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8DEE8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialText: {
    color: '#142033',
    fontSize: 15,
    fontWeight: '900',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  signupText: {
    color: '#6B7A90',
    fontSize: 14,
  },

  signupLink: {
    color: '#2F89E8',
    fontSize: 14,
    fontWeight: '900',
  },
});