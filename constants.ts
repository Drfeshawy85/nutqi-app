
import { SoundData } from './types';

export const TARGET_SOUNDS: SoundData[] = [
  {
    phoneme: 'ك',
    name: 'صوت الكاف',
    words: [
      { id: 'k1', word: 'كلب', position: 'initial', phoneme: 'ك', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80' },
      { id: 'k2', word: 'كرة', position: 'initial', phoneme: 'ك', imageUrl: 'https://images.unsplash.com/photo-1518005020251-58296b97bc7c?auto=format&fit=crop&w=400&q=80' },
      { id: 'k3', word: 'سكين', position: 'medial', phoneme: 'ك', imageUrl: 'https://images.unsplash.com/photo-1593510987185-1ec2256148a3?auto=format&fit=crop&w=400&q=80' },
      { id: 'k4', word: 'سمكة', position: 'medial', phoneme: 'ك', imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=400&q=80' },
      { id: 'k5', word: 'ديك', position: 'final', phoneme: 'ك', imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80' },
      { id: 'k6', word: 'ملك', position: 'final', phoneme: 'ك', imageUrl: 'https://images.unsplash.com/photo-1599408162172-7a424f4204b3?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    phoneme: 'ق',
    name: 'صوت القاف',
    words: [
      { id: 'q1', word: 'قلم', position: 'initial', phoneme: 'ق', imageUrl: 'https://images.unsplash.com/photo-1585336139118-107b43c51fcc?auto=format&fit=crop&w=400&q=80' },
      { id: 'q2', word: 'قرد', position: 'initial', phoneme: 'ق', imageUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=400&q=80' },
      { id: 'q3', word: 'صقر', position: 'medial', phoneme: 'ق', imageUrl: 'https://images.unsplash.com/photo-1506544777-64cfbe1142df?auto=format&fit=crop&w=400&q=80' },
      { id: 'q4', word: 'بقرة', position: 'medial', phoneme: 'ق', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80' },
      { id: 'q5', word: 'إبريق', position: 'final', phoneme: 'ق', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80' },
      { id: 'q6', word: 'حلاق', position: 'final', phoneme: 'ق', imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    phoneme: 'خ',
    name: 'صوت الخاء',
    words: [
      { id: 'kh1', word: 'خروف', position: 'initial', phoneme: 'خ', imageUrl: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=400&q=80' },
      { id: 'kh2', word: 'خبز', position: 'initial', phoneme: 'خ', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
      { id: 'kh3', word: 'نخلة', position: 'medial', phoneme: 'خ', imageUrl: 'https://images.unsplash.com/photo-1520262454473-a1a82276a574?auto=format&fit=crop&w=400&q=80' },
      { id: 'kh4', word: 'صخرة', position: 'medial', phoneme: 'خ', imageUrl: 'https://images.unsplash.com/photo-1541844053589-346841d0b34c?auto=format&fit=crop&w=400&q=80' },
      { id: 'kh5', word: 'مطبخ', position: 'final', phoneme: 'خ', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80' },
      { id: 'kh6', word: 'صاروخ', position: 'final', phoneme: 'خ', imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    phoneme: 'غ',
    name: 'صوت الغين',
    words: [
      { id: 'gh1', word: 'غزال', position: 'initial', phoneme: 'غ', imageUrl: 'https://images.unsplash.com/photo-1590420485404-f86d22b8abf8?auto=format&fit=crop&w=400&q=80' },
      { id: 'gh2', word: 'غراب', position: 'initial', phoneme: 'غ', imageUrl: 'https://images.unsplash.com/photo-1514823193307-299f0f971295?auto=format&fit=crop&w=400&q=80' },
      { id: 'gh3', word: 'ببغاء', position: 'medial', phoneme: 'غ', imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&w=400&q=80' },
      { id: 'gh4', word: 'مغناطيس', position: 'medial', phoneme: 'غ', imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=400&q=80' },
      { id: 'gh5', word: 'صمغ', position: 'final', phoneme: 'غ', imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=400&q=80' },
      { id: 'gh6', word: 'دماغ', position: 'final', phoneme: 'غ', imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    phoneme: 'ر',
    name: 'صوت الراء',
    words: [
      { id: 'r1', word: 'رمان', position: 'initial', phoneme: 'ر', imageUrl: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?auto=format&fit=crop&w=400&q=80' },
      { id: 'r2', word: 'رجل', position: 'initial', phoneme: 'ر', imageUrl: 'https://images.unsplash.com/photo-1490192113676-8ee9ad022d1b?auto=format&fit=crop&w=400&q=80' },
      { id: 'r3', word: 'جرس', position: 'medial', phoneme: 'ر', imageUrl: 'https://images.unsplash.com/photo-1540914124281-342729c300f7?auto=format&fit=crop&w=400&q=80' },
      { id: 'r4', word: 'كرسي', position: 'medial', phoneme: 'ر', imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80' },
      { id: 'r5', word: 'تمر', position: 'final', phoneme: 'ر', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80' },
      { id: 'r6', word: 'قمر', position: 'final', phoneme: 'ر', imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=400&q=80' },
    ]
  }
];
