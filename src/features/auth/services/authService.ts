import { supabase } from '../../../shared/services/supabase';

export type ProfileType = 'responsavel' | 'pediatra';

type SignUpParams = {
  name: string;
  email: string;
  password: string;
  profile_type: ProfileType;
};

type SignInParams = {
  email: string;
  password: string;
};

export const signUp = async ({
  name,
  email,
  password,
  profile_type,
}: SignUpParams) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        profile_type,
      },
    },
  });

  if (error) throw error;

  return {
    user: data.user,
    profile_type,
  };
};

export const signIn = async ({ email, password }: SignInParams) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('profile_type')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;

  return {
    user,
    profile_type: profile.profile_type as ProfileType,
  };
};