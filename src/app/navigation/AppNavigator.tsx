import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { supabase } from '../../shared/services/supabase';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { PediatricianScreen } from '../../features/pediatrician/screens/PediatricianScreen';
import { CreateChildScreen } from '../../features/children/screens/CreateChildScreen';
import { ChildrenListScreen } from '../../features/children/screens/ChildrenListScreen';
import { CreateSymptomScreen } from '../../features/diary/screens/CreateSymptomScreen';
import { DiaryScreen } from '../../features/diary/screens/DiaryScreen';

type ProfileType = 'responsavel' | 'pediatra';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('profile_type')
        .eq('id', userId)
        .single();

      if (!error && data?.profile_type) {
        setProfileType(data.profile_type as ProfileType);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3D7DF0" />
      </View>
    );
  }

  if (!profileType) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Perfil não encontrado.</Text>
      </View>
    );
  }

  if (profileType === 'pediatra') {
    return <PediatricianScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ChildrenList" component={ChildrenListScreen} />
      <Stack.Screen name="CreateChild" component={CreateChildScreen} />
      <Stack.Screen name="CreateSymptom" component={CreateSymptomScreen} />
      <Stack.Screen name="Diary" component={DiaryScreen} />
    </Stack.Navigator>
  );
};