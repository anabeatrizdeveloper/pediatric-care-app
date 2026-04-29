import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Stethoscope, Sparkles, ArrowRight } from 'lucide-react-native';
import { ROUTES } from '../../../shared/constants/routes';

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient colors={['#4BA8F2', '#46BFE8', '#78DCD5']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Heart size={23} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.appName}>Nome do App</Text>
        </View>

        <View style={styles.badge}>
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.badgeText}>Saúde infantil em boas mãos</Text>
        </View>

        <Text style={styles.title}>Acompanhe cada batimento da infância.</Text>

        <Text style={styles.subtitle}>
          Diário de saúde, conexão direta com o pediatra e histórico clínico em um só lugar.
        </Text>

        <View style={styles.cardsRow}>
          <FeatureCard icon={<Heart size={25} color="#FFFFFF" />} label="Diário" />
          <FeatureCard icon={<Stethoscope size={25} color="#FFFFFF" />} label="Pediatra" />
          <FeatureCard icon={<Sparkles size={25} color="#FFFFFF" />} label="Insights" />
        </View>

        {/* BOTÃO COMEÇAR */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate(ROUTES.REGISTER)}
        >
          <Text style={styles.buttonText}>Começar agora</Text>
          <ArrowRight size={20} color="#2F89E8" />
        </TouchableOpacity>

        {/* BOTÃO LOGIN */}
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
        >
          <Text style={styles.loginText}>Já tenho conta · Entrar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

type FeatureCardProps = {
  icon: React.ReactNode;
  label: string;
};

const FeatureCard = ({ icon, label }: FeatureCardProps) => {
  return (
    <View style={styles.featureCard}>
      {icon}
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 54,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 56,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#3C7CF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 26,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 33,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 18,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
    marginBottom: 34,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    height: 86,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  featureLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  button: {
    height: 58,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: '#2F89E8',
    fontSize: 17,
    fontWeight: '800',
  },
  loginText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
});