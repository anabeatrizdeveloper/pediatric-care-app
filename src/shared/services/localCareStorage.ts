import AsyncStorage from '@react-native-async-storage/async-storage';

const CHILDREN_KEY = '@pediatric-care:children';
const RECORDS_KEY = '@pediatric-care:records';

export type Child = {
  id: string;
  name: string;
  nickname: string;
  birthDate: string;
  gender: string;
  weight: string;
  height: string;
  heightUnit: 'cm' | 'm';
  emoji: string;
  photoUri?: string;
  allergies?: string;
  intolerances?: string;
  conditions?: string;
  pediatricianName?: string;
};

export type HealthRecordType = 'symptom' | 'food' | 'sleep' | 'medicine';

export type HealthRecord = {
  id: string;
  childId: string;
  type: HealthRecordType;
  title: string;
  description: string;
  time: string;
  date: string;
  checked?: boolean;
};

export const getChildren = async (): Promise<Child[]> => {
  const data = await AsyncStorage.getItem(CHILDREN_KEY);
  return data ? JSON.parse(data) : [];
};

export const getChildById = async (id: string): Promise<Child | null> => {
  const children = await getChildren();
  return children.find((child) => child.id === id) ?? null;
};

export const saveChild = async (child: Child) => {
  const children = await getChildren();
  const exists = children.some((item) => item.id === child.id);

  const updatedChildren = exists
    ? children.map((item) => (item.id === child.id ? child : item))
    : [child, ...children];

  await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(updatedChildren));
};

export const getRecords = async (): Promise<HealthRecord[]> => {
  const data = await AsyncStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecord = async (record: HealthRecord) => {
  const records = await getRecords();
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify([record, ...records]));
};