import AsyncStorage from '@react-native-async-storage/async-storage';

const CHILDREN_KEY = '@pediatric-care:children';
const RECORDS_KEY = '@pediatric-care:records';
const CONSULTATIONS_KEY = '@pediatric-care:consultations';
const EPISODES_KEY = '@pediatric-care:episodes';
const EXAMS_KEY = '@pediatric-care:exams';
const HEALTH_BOOKLETS_KEY = '@pediatric-care:health-booklets';

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

export type HealthRecordType =
  | 'symptom'
  | 'food'
  | 'sleep'
  | 'medicine';

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

export type Consultation = {
  id: string;
  childId: string;
  doctorName: string;
  consultationDate: string;
  requestedExams: string;
  mealPlan: string;
  requestedActions: string;
  followUpDate: string;
  notes: string;
  createdAt: string;
};

export type Episode = {
  id: string;
  childId: string;
  title: string;
  date: string;
  temperature?: string;
  hadFever: boolean;
  hadPain: boolean;
  hadCough: boolean;
  symptoms: string;
  description: string;
  createdAt: string;
};

export type ExamReason =
  | 'Rotina'
  | 'Acompanhamento'
  | 'Episódio de doença'
  | 'Investigação';

export type ExamComparisonStatus =
  | 'aumentou'
  | 'diminuiu'
  | 'igual';

export type ExamMarker = {
  name: string;
  value: string;
  unit?: string;
  status?: ExamComparisonStatus;
};

export type Exam = {
  id: string;
  childId: string;
  title: string;
  reason: ExamReason;
  fileName: string;
  fileUri: string;
  registeredAt: string;
  notes?: string;
  markers?: ExamMarker[];
};

export type HealthBooklet = {
  id: string;
  childId: string;

  childFullName: string;
  nickname?: string;
  birthDate: string;
  gender: string;

  nationality?: string;
  nationalityCode?: string;

  birthCountry?: string;
  birthCountryCode?: string;

  birthState?: string;
  birthStateCode?: string;

  birthCity?: string;

  motherName?: string;
  fatherName?: string;
  guardianName?: string;

  address?: string;
  susCard?: string;
  healthUnit?: string;

  birthHospital?: string;
  deliveryType?: string;
  gestationalAge?: string;

  birthWeight?: string;
  birthLength?: string;
  birthHeadCircumference?: string;

  apgarOne?: string;
  apgarFive?: string;

  birthIntercurrences?: string;
  neonatalIcu?: boolean;

  heelPrickTest?: string;
  hearingTest?: string;
  eyeTest?: string;
  heartTest?: string;
  tongueTest?: string;

  neonatalScreeningNotes?: string;

  breastfeedingNotes?: string;
  foodIntroductionNotes?: string;
  foodAllergies?: string;

  currentWeight?: string;
  currentHeight?: string;
  currentHeadCircumference?: string;
  currentBmi?: string;

  growthNotes?: string;

  developmentMilestones?: string;
  developmentAlerts?: string;
  developmentReferrals?: string;

  vaccineNotes?: string;
  pendingVaccines?: string;

  dentalNotes?: string;

  clinicalHistory?: string;
  hospitalizations?: string;
  surgeries?: string;

  continuousMedications?: string;

  allergies?: string;
  chronicConditions?: string;

  pdfFileName?: string;
  pdfFileUri?: string;

  aiTranscriptionStatus?:
    | 'not_started'
    | 'pending_review'
    | 'reviewed';

  createdAt: string;
  updatedAt: string;
};

/* CHILDREN */

export const getChildren = async (): Promise<Child[]> => {
  const data = await AsyncStorage.getItem(CHILDREN_KEY);
  return data ? JSON.parse(data) : [];
};

export const getChildById = async (
  id: string
): Promise<Child | null> => {
  const children = await getChildren();

  return children.find((child) => child.id === id) ?? null;
};

export const saveChild = async (child: Child) => {
  const children = await getChildren();

  const exists = children.some(
    (item) => item.id === child.id
  );

  const updatedChildren = exists
    ? children.map((item) =>
        item.id === child.id ? child : item
      )
    : [child, ...children];

  await AsyncStorage.setItem(
    CHILDREN_KEY,
    JSON.stringify(updatedChildren)
  );
};

export const deleteChild = async (childId: string) => {
  const children = await getChildren();
  const records = await getRecords();
  const consultations = await getConsultations();
  const episodes = await getEpisodes();
  const exams = await getExams();
  const healthBooklets = await getHealthBooklets();

  await AsyncStorage.setItem(
    CHILDREN_KEY,
    JSON.stringify(
      children.filter((child) => child.id !== childId)
    )
  );

  await AsyncStorage.setItem(
    RECORDS_KEY,
    JSON.stringify(
      records.filter((record) => record.childId !== childId)
    )
  );

  await AsyncStorage.setItem(
    CONSULTATIONS_KEY,
    JSON.stringify(
      consultations.filter(
        (consultation) =>
          consultation.childId !== childId
      )
    )
  );

  await AsyncStorage.setItem(
    EPISODES_KEY,
    JSON.stringify(
      episodes.filter(
        (episode) => episode.childId !== childId
      )
    )
  );

  await AsyncStorage.setItem(
    EXAMS_KEY,
    JSON.stringify(
      exams.filter((exam) => exam.childId !== childId)
    )
  );

  await AsyncStorage.setItem(
    HEALTH_BOOKLETS_KEY,
    JSON.stringify(
      healthBooklets.filter(
        (booklet) => booklet.childId !== childId
      )
    )
  );
};

/* HEALTH RECORDS */

export const getRecords = async (): Promise<
  HealthRecord[]
> => {
  const data = await AsyncStorage.getItem(RECORDS_KEY);

  return data ? JSON.parse(data) : [];
};

export const saveRecord = async (
  record: HealthRecord
) => {
  const records = await getRecords();

  await AsyncStorage.setItem(
    RECORDS_KEY,
    JSON.stringify([record, ...records])
  );
};

/* CONSULTATIONS */

export const getConsultations = async (): Promise<
  Consultation[]
> => {
  const data = await AsyncStorage.getItem(
    CONSULTATIONS_KEY
  );

  return data ? JSON.parse(data) : [];
};

export const saveConsultation = async (
  consultation: Consultation
) => {
  const consultations = await getConsultations();

  await AsyncStorage.setItem(
    CONSULTATIONS_KEY,
    JSON.stringify([consultation, ...consultations])
  );
};

export const getConsultationsByChild = async (
  childId: string
): Promise<Consultation[]> => {
  const consultations = await getConsultations();

  return consultations.filter(
    (consultation) =>
      consultation.childId === childId
  );
};

export const getConsultationById = async (
  id: string
): Promise<Consultation | null> => {
  const consultations = await getConsultations();

  return (
    consultations.find(
      (consultation) => consultation.id === id
    ) ?? null
  );
};

export const updateConsultation = async (
  updatedConsultation: Consultation
) => {
  const consultations = await getConsultations();

  const updated = consultations.map((consultation) =>
    consultation.id === updatedConsultation.id
      ? updatedConsultation
      : consultation
  );

  await AsyncStorage.setItem(
    CONSULTATIONS_KEY,
    JSON.stringify(updated)
  );
};

export const deleteConsultation = async (id: string) => {
  const consultations = await getConsultations();

  await AsyncStorage.setItem(
    CONSULTATIONS_KEY,
    JSON.stringify(
      consultations.filter(
        (consultation) => consultation.id !== id
      )
    )
  );
};

/* EPISODES */

export const getEpisodes = async (): Promise<
  Episode[]
> => {
  const data = await AsyncStorage.getItem(EPISODES_KEY);

  return data ? JSON.parse(data) : [];
};

export const saveEpisode = async (
  episode: Episode
) => {
  const episodes = await getEpisodes();

  await AsyncStorage.setItem(
    EPISODES_KEY,
    JSON.stringify([episode, ...episodes])
  );
};

export const getEpisodesByChild = async (
  childId: string
): Promise<Episode[]> => {
  const episodes = await getEpisodes();

  return episodes.filter(
    (episode) => episode.childId === childId
  );
};

export const getEpisodeById = async (
  id: string
): Promise<Episode | null> => {
  const episodes = await getEpisodes();

  return (
    episodes.find(
      (episode) => episode.id === id
    ) ?? null
  );
};

export const updateEpisode = async (
  updatedEpisode: Episode
) => {
  const episodes = await getEpisodes();

  const updated = episodes.map((episode) =>
    episode.id === updatedEpisode.id
      ? updatedEpisode
      : episode
  );

  await AsyncStorage.setItem(
    EPISODES_KEY,
    JSON.stringify(updated)
  );
};

export const deleteEpisode = async (id: string) => {
  const episodes = await getEpisodes();

  await AsyncStorage.setItem(
    EPISODES_KEY,
    JSON.stringify(
      episodes.filter(
        (episode) => episode.id !== id
      )
    )
  );
};

/* EXAMS */

export const getExams = async (): Promise<Exam[]> => {
  const data = await AsyncStorage.getItem(EXAMS_KEY);

  return data ? JSON.parse(data) : [];
};

export const saveExam = async (exam: Exam) => {
  const exams = await getExams();

  await AsyncStorage.setItem(
    EXAMS_KEY,
    JSON.stringify([exam, ...exams])
  );
};

export const getExamsByChild = async (
  childId: string
): Promise<Exam[]> => {
  const exams = await getExams();

  return exams.filter(
    (exam) => exam.childId === childId
  );
};

export const getExamById = async (
  id: string
): Promise<Exam | null> => {
  const exams = await getExams();

  return (
    exams.find((exam) => exam.id === id) ?? null
  );
};

export const updateExam = async (
  updatedExam: Exam
) => {
  const exams = await getExams();

  const updated = exams.map((exam) =>
    exam.id === updatedExam.id
      ? updatedExam
      : exam
  );

  await AsyncStorage.setItem(
    EXAMS_KEY,
    JSON.stringify(updated)
  );
};

export const deleteExam = async (id: string) => {
  const exams = await getExams();

  await AsyncStorage.setItem(
    EXAMS_KEY,
    JSON.stringify(
      exams.filter((exam) => exam.id !== id)
    )
  );
};

export const compareExamMarkers = (
  previousMarkers: ExamMarker[] = [],
  currentMarkers: ExamMarker[] = []
): ExamMarker[] => {
  return currentMarkers.map((current) => {
    const previous = previousMarkers.find(
      (item) =>
        item.name.toLowerCase() ===
        current.name.toLowerCase()
    );

    if (!previous) return current;

    const previousValue = Number(
      previous.value.replace(',', '.')
    );

    const currentValue = Number(
      current.value.replace(',', '.')
    );

    if (
      Number.isNaN(previousValue) ||
      Number.isNaN(currentValue)
    ) {
      return current;
    }

    if (currentValue > previousValue) {
      return {
        ...current,
        status: 'aumentou',
      };
    }

    if (currentValue < previousValue) {
      return {
        ...current,
        status: 'diminuiu',
      };
    }

    return {
      ...current,
      status: 'igual',
    };
  });
};

/* HEALTH BOOKLETS */

export const getHealthBooklets = async (): Promise<
  HealthBooklet[]
> => {
  const data = await AsyncStorage.getItem(
    HEALTH_BOOKLETS_KEY
  );

  return data ? JSON.parse(data) : [];
};

export const saveHealthBooklet = async (
  booklet: HealthBooklet
) => {
  const booklets = await getHealthBooklets();

  await AsyncStorage.setItem(
    HEALTH_BOOKLETS_KEY,
    JSON.stringify([booklet, ...booklets])
  );
};

export const getHealthBookletById = async (
  id: string
): Promise<HealthBooklet | null> => {
  const booklets = await getHealthBooklets();

  return (
    booklets.find(
      (booklet) => booklet.id === id
    ) ?? null
  );
};

export const getHealthBookletByChild = async (
  childId: string
): Promise<HealthBooklet | null> => {
  const booklets = await getHealthBooklets();

  return (
    booklets.find(
      (booklet) => booklet.childId === childId
    ) ?? null
  );
};

export const updateHealthBooklet = async (
  updatedBooklet: HealthBooklet
) => {
  const booklets = await getHealthBooklets();

  const updated = booklets.map((booklet) =>
    booklet.id === updatedBooklet.id
      ? updatedBooklet
      : booklet
  );

  await AsyncStorage.setItem(
    HEALTH_BOOKLETS_KEY,
    JSON.stringify(updated)
  );
};

export const deleteHealthBooklet = async (
  id: string
) => {
  const booklets = await getHealthBooklets();

  await AsyncStorage.setItem(
    HEALTH_BOOKLETS_KEY,
    JSON.stringify(
      booklets.filter(
        (booklet) => booklet.id !== id
      )
    )
  );
};