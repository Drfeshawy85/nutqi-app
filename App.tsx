
import React, { useState, useEffect, useRef } from 'react';
import { TargetWord, SoundData, DiagnosisResult, StudentSession, Achievement } from './types';
import { TARGET_SOUNDS } from './constants';
import { analyzeSpeech } from './services/geminiService';

// --- Local Storage Keys ---
const STORAGE_KEYS = {
  CURRENT_STUDENT: 'nutqi_current_student',
  CURRENT_RESULTS: 'nutqi_current_results',
  TOTAL_POINTS: 'nutqi_total_points',
  SOUND_ENABLED: 'nutqi_sound_enabled',
};

// --- Sound Asset URLs (Royalty Free) ---
const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  WRONG: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  CELEBRATE: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3',
};

declare const confetti: any;

// --- Helper for Playing Sounds ---
const playAudio = (url: string, enabled: boolean) => {
  if (!enabled) return;
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {/* Ignore browsers blocking autoplay */});
};

// --- Sub-components ---

const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <div className={`flex items-center gap-3 ${size === 'lg' ? 'flex-col' : ''}`}>
    <div className={`bg-gradient-to-br from-green-400 to-indigo-600 p-2.5 rounded-[1.5rem] shadow-xl transform transition-transform hover:rotate-6 ${size === 'lg' ? 'w-24 h-24' : 'w-10 h-10'}`}>
      <svg className="text-white w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>
    <div className="flex flex-col items-center">
      <h1 className={`font-brand text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-500 to-indigo-600 pb-2 ${size === 'lg' ? 'text-6xl mt-4' : 'text-2xl'}`}>
        نطقي
      </h1>
      {size === 'lg' && <div className="h-1.5 w-20 bg-gradient-to-r from-green-400 to-indigo-400 rounded-full mt-1 animate-pulse"></div>}
    </div>
  </div>
);

const Header: React.FC<{ 
  points: number; 
  soundEnabled: boolean; 
  onToggleSound: () => void;
  onLogout: () => void;
}> = ({ points, soundEnabled, onToggleSound, onLogout }) => (
  <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm py-3 px-6 mb-6 border-b border-green-50">
    <div className="max-w-5xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Logo />
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-1.5 rounded-2xl items-center gap-2 border border-yellow-200 shadow-sm">
          <span className="text-xl animate-bounce">⭐</span>
          <span className="font-bold text-yellow-700">{points} نقطة</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl transition-all shadow-sm border ${soundEnabled ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
            title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            )}
          </button>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">تسجيل خروج</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

const LoginScreen: React.FC<{ onLogin: (name: string, code: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      onLogin(name, code);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-[3rem] shadow-2xl border-4 border-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 opacity-60"></div>
      <div className="text-center mb-10">
        <Logo size="lg" />
        <p className="text-slate-500 mt-4 font-medium leading-relaxed">
          أهلاً بك في رحلة التعلم الممتعة!<br/>
          سجل دخولك لنبدأ مغامرة التحدث بوضوح.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 mr-2">اسم البطل الصغير</label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all text-right text-lg font-medium"
            placeholder="أدخل اسمك الجميل"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 mr-2">كود المغامرة</label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all text-right text-lg font-medium"
            placeholder="رمز الدخول الخاص بك"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-[1.5rem] text-xl font-extrabold hover:shadow-green-200 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl group"
        >
          انطلاق للمغامرة! 🚀
        </button>
      </form>
    </div>
  );
};

const SoundSelection: React.FC<{ 
  onSelect: (sound: SoundData) => void;
  hasResults: boolean;
  onViewReport: () => void;
  soundEnabled: boolean;
}> = ({ onSelect, hasResults, onViewReport, soundEnabled }) => {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex justify-end mb-10">
        {hasResults && (
          <button 
            onClick={() => {
              playAudio(SOUNDS.CLICK, soundEnabled);
              onViewReport();
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-base font-bold hover:bg-indigo-700 transition-all shadow-indigo-100 shadow-xl hover:-translate-y-0.5"
          >
            📊 عرض التقرير الحالي
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {TARGET_SOUNDS.map((sound) => (
          <button
            key={sound.phoneme}
            onClick={() => {
              playAudio(SOUNDS.CLICK, soundEnabled);
              onSelect(sound);
            }}
            className="group relative bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl border-4 border-transparent hover:border-green-400 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full group-hover:scale-125 transition-transform -z-0 opacity-40" />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-8xl font-black text-green-600 group-hover:scale-110 transition-transform mb-6 drop-shadow-md">
                {sound.phoneme}
              </span>
              <span className="text-2xl font-extrabold text-slate-700">{sound.name}</span>
              <div className="mt-6 flex gap-1.5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-green-300" />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const DiagnosisSession: React.FC<{
  sound: SoundData;
  onUpdateResults: (result: DiagnosisResult) => void;
  onFinish: () => void;
  onBack: () => void;
  existingResults: DiagnosisResult[];
  soundEnabled: boolean;
}> = ({ sound, onUpdateResults, onFinish, onBack, existingResults, soundEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const currentWord = sound.words[currentIndex];
  const currentResult = existingResults.find(r => r.wordId === currentWord.id);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsAnalyzing(true);
          const result = await analyzeSpeech(base64Audio, currentWord);
          
          const pointsEarned = result.isCorrect ? 50 : 10;
          if (result.isCorrect) {
            playAudio(SOUNDS.CORRECT, soundEnabled);
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#4ade80', '#22c55e', '#ffffff', '#fbbf24']
            });
          } else {
            playAudio(SOUNDS.WRONG, soundEnabled);
          }
          
          onUpdateResults({ ...result, pointsEarned });
          setIsAnalyzing(false);
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("يرجى السماح بالوصول للميكروفون لبدء التسجيل");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const nextWord = () => {
    playAudio(SOUNDS.CLICK, soundEnabled);
    if (currentIndex < sound.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => { playAudio(SOUNDS.CLICK, soundEnabled); onBack(); }} className="text-green-700 font-bold flex items-center gap-2 hover:bg-white px-5 py-3 rounded-[1.2rem] transition-all shadow-sm">
          <span>&rarr;</span> العودة للأصوات
        </button>
        <div className="bg-white px-6 py-2.5 rounded-2xl shadow-sm border border-green-50 font-black text-xl text-green-700">
           تحدي صوت ({sound.phoneme})
        </div>
      </div>

      <div className="mb-10 space-y-5">
        <div className="flex justify-between items-end mb-2 px-1">
           <span className="text-slate-500 font-bold">مستوى إنجازك</span>
           <span className="text-green-600 font-black text-lg">{currentIndex + 1} / {sound.words.length}</span>
        </div>
        <div className="flex gap-3">
          {sound.words.map((w, i) => {
            const hasRes = existingResults.find(r => r.wordId === w.id);
            return (
              <div 
                key={w.id} 
                className={`flex-1 h-3.5 rounded-full transition-all duration-500 ${
                  i === currentIndex ? 'bg-indigo-500 ring-4 ring-indigo-100 shadow-lg' : 
                  hasRes ? (hasRes.isCorrect ? 'bg-green-500' : 'bg-orange-400') : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border-[12px] border-white relative">
        <div className="p-10 text-center space-y-10">
          <div className="relative group">
            <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-[3rem] overflow-hidden shadow-inner border-4 border-slate-50">
              <img 
                src={currentWord.imageUrl} 
                alt={currentWord.word} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-12 py-5 rounded-[2.5rem] shadow-2xl border border-white">
                <h3 className="text-6xl font-black text-slate-800 tracking-tight">{currentWord.word}</h3>
              </div>
            </div>
            {currentResult?.isCorrect && (
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-300 to-yellow-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl animate-bounce border-4 border-white z-20">
                ⭐
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <span className="bg-indigo-50 text-indigo-700 px-8 py-3 rounded-2xl font-bold text-lg border border-indigo-100 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              مكان الصوت: 
              {currentWord.position === 'initial' && ' بداية الكلمة'}
              {currentWord.position === 'medial' && ' وسط الكلمة'}
              {currentWord.position === 'final' && ' آخر الكلمة'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-8 py-4">
            {!currentResult ? (
              <div className="space-y-8">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isAnalyzing}
                  className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse scale-115 shadow-red-200 shadow-[0_0_60px_rgba(239,68,68,0.4)]' 
                      : 'bg-gradient-to-br from-green-500 to-indigo-600 hover:scale-110 shadow-green-200 shadow-2xl active:scale-95'
                  } text-white disabled:bg-slate-300`}
                >
                  {isAnalyzing ? (
                    <div className="w-12 h-12 border-[5px] border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="flex flex-col items-center">
                       <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                      </svg>
                      {isRecording && <span className="absolute -bottom-12 text-red-500 font-black text-lg animate-bounce">سجل الآن!</span>}
                    </div>
                  )}
                </button>
                {!isRecording && <p className="text-slate-400 font-bold text-xl">المس الميكروفون وتحدث ببراعة!</p>}
              </div>
            ) : (
              <div className="bg-green-50/40 p-10 rounded-[3rem] w-full border-4 border-white shadow-xl animate-in zoom-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className={`flex items-center gap-3 px-8 py-3 rounded-full text-white font-black text-2xl shadow-lg ${currentResult.isCorrect ? 'bg-green-500' : 'bg-orange-500 animate-shake'}`}>
                    <span>{currentResult.isCorrect ? 'أحسنت يا بطل!' : 'حاول مرة أخرى'}</span>
                    <span className="text-3xl">{currentResult.isCorrect ? '✨' : '💪'}</span>
                  </div>
                  <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-green-100 text-green-700 font-black text-3xl">
                    +{currentResult.pointsEarned} ⭐
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-green-100 mb-8 text-right relative">
                   <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">سمعت:</div>
                   <p className="text-3xl font-bold text-slate-700 italic leading-relaxed">" {currentResult.transcribed} "</p>
                   {!currentResult.isCorrect && (
                    <div className="mt-6 p-5 bg-red-50 rounded-[1.5rem] border border-red-100">
                       <p className="text-red-700 font-bold text-lg">{currentResult.substitutionDetails || 'هناك اختلاف بسيط في النطق'}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-5">
                  <button 
                    onClick={() => {
                       playAudio(SOUNDS.CLICK, soundEnabled);
                       onUpdateResults(null as any);
                    }}
                    className="flex-1 bg-white text-slate-500 py-5 rounded-[1.5rem] font-black text-lg border-2 border-slate-100 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={nextWord}
                    className="flex-[2] bg-slate-800 text-white py-5 rounded-[1.5rem] font-black text-2xl hover:bg-slate-900 transition-all shadow-xl hover:-translate-y-1"
                  >
                    {currentIndex === sound.words.length - 1 ? 'إنهاء التحدي وجمع الجوائز 🏆' : 'الكلمة التالية 🚀'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportView: React.FC<{ 
  session: StudentSession;
  onRestart: () => void;
  onClearResults: () => void;
  onLogout: () => void;
  soundEnabled: boolean;
}> = ({ session, onRestart, onClearResults, onLogout, soundEnabled }) => {
  const correctCount = session.results.filter(r => r.isCorrect).length;
  const incorrectCount = session.results.length - correctCount;
  const accuracy = Math.round((correctCount / session.results.length) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto px-6 pb-24">
      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden p-12 border-[12px] border-white relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-br-full -z-10 opacity-30"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-right">
          <div className="order-2 md:order-1">
            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">إنجازات البطل {session.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-5 text-slate-500 font-bold text-lg">
              <span className="bg-slate-100 px-6 py-2 rounded-2xl shadow-sm">المغامر: {session.code}</span>
              <span className="bg-slate-100 px-6 py-2 rounded-2xl shadow-sm">تاريخ المغامرة: {new Date().toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-6xl shadow-[0_20px_50px_rgba(234,179,8,0.3)] border-8 border-white ring-8 ring-yellow-50 animate-pulse">🏆</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-10 rounded-[3rem] text-white text-center shadow-2xl shadow-green-100 transform hover:-translate-y-2 transition-all">
            <span className="text-base font-black block mb-3 opacity-90 uppercase tracking-widest">نطق صحيح</span>
            <span className="text-6xl font-black block mb-3">{correctCount}</span>
            <span className="text-lg font-bold">كلمات رائعة</span>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-10 rounded-[3rem] text-white text-center shadow-2xl shadow-orange-100 transform hover:-translate-y-2 transition-all">
            <span className="text-base font-black block mb-3 opacity-90 uppercase tracking-widest">محاولات للتدريب</span>
            <span className="text-6xl font-black block mb-3">{incorrectCount}</span>
            <span className="text-lg font-bold">تحديات متبقية</span>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-700 p-10 rounded-[3rem] text-white text-center shadow-2xl shadow-indigo-100 transform hover:-translate-y-2 transition-all">
            <span className="text-base font-black block mb-3 opacity-90 uppercase tracking-widest">إجمالي النجوم</span>
            <span className="text-6xl font-black block mb-3">{session.totalPoints}</span>
            <span className="text-lg font-bold">نجم جمعتها</span>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-black text-slate-800">تفاصيل رحلة النطق:</h3>
            <div className="flex items-center gap-3">
               <span className="text-slate-400 font-bold">وضوح الكلام:</span>
               <span className="text-indigo-600 font-black text-2xl bg-indigo-50 px-6 py-2 rounded-2xl border border-indigo-100 shadow-sm">{accuracy}%</span>
            </div>
          </div>
          
          <div className="grid gap-5">
            {session.results.map((res, i) => (
              <div key={i} className={`flex flex-col sm:flex-row items-center justify-between p-8 rounded-[2.5rem] border-4 transition-all hover:shadow-lg ${res.isCorrect ? 'bg-green-50/20 border-green-100' : 'bg-red-50/20 border-red-100'}`}>
                <div className="flex items-center gap-8 mb-4 sm:mb-0">
                   <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-md ${res.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {res.isCorrect ? '✅' : '❌'}
                   </div>
                   <div>
                     <p className="text-3xl font-black text-slate-800 mb-1">{res.word}</p>
                     <p className="text-lg text-slate-500 font-bold">صوت ({res.phoneme}) • {res.position === 'initial' ? 'بداية الكلمة' : res.position === 'medial' ? 'وسط الكلمة' : 'آخر الكلمة'}</p>
                   </div>
                </div>
                {!res.isCorrect && (
                   <div className="w-full sm:w-auto mt-4 sm:mt-0">
                      <div className="bg-red-100 text-red-700 px-6 py-3 rounded-2xl font-black text-center shadow-sm">
                        {res.substitutionDetails}
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
          <button 
            onClick={() => { playAudio(SOUNDS.CLICK, soundEnabled); window.print(); }}
            className="bg-slate-100 text-slate-700 py-6 rounded-[1.5rem] font-black text-xl hover:bg-slate-200 transition-all border-2 border-slate-200 shadow-sm"
          >
            🖨️ طباعة شهادة البطل
          </button>
          <button 
            onClick={() => { playAudio(SOUNDS.CLICK, soundEnabled); onRestart(); }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-6 rounded-[1.5rem] font-black text-2xl hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1"
          >
            🏠 العودة للأصوات
          </button>
          <button 
            onClick={() => { playAudio(SOUNDS.CLICK, soundEnabled); onLogout(); }}
            className="bg-red-50 text-red-600 py-6 rounded-[1.5rem] font-black text-xl hover:bg-red-100 transition-all border-2 border-red-100 shadow-sm"
          >
            🚪 تسجيل خروج نهائي
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

enum View {
  Login,
  Selection,
  Diagnosis,
  Report
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.Login);
  const [student, setStudent] = useState<{ name: string; code: string } | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundData | null>(null);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const savedStudent = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    const savedResults = localStorage.getItem(STORAGE_KEYS.CURRENT_RESULTS);
    const savedPoints = localStorage.getItem(STORAGE_KEYS.TOTAL_POINTS);
    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);

    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
      setCurrentView(View.Selection);
    }
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
    if (savedPoints) {
      setPoints(parseInt(savedPoints));
    }
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    
    if (student) localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);

    if (results.length > 0) localStorage.setItem(STORAGE_KEYS.CURRENT_RESULTS, JSON.stringify(results));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_RESULTS);

    localStorage.setItem(STORAGE_KEYS.TOTAL_POINTS, points.toString());
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, soundEnabled.toString());
  }, [student, results, points, isLoaded, soundEnabled]);

  const handleLogin = (name: string, code: string) => {
    playAudio(SOUNDS.SUCCESS, soundEnabled);
    setStudent({ name, code });
    setCurrentView(View.Selection);
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟ سيتم مسح بياناتك والعودة لشاشة الدخول.')) {
      setStudent(null);
      setResults([]);
      setPoints(0);
      setSelectedSound(null);
      setCurrentView(View.Login);
      localStorage.clear();
      playAudio(SOUNDS.CLICK, soundEnabled);
    }
  };

  const handleSoundSelect = (sound: SoundData) => {
    setSelectedSound(sound);
    setCurrentView(View.Diagnosis);
  };

  const handleUpdateResults = (newResult: DiagnosisResult | null) => {
    if (!newResult) {
       return;
    }
    setResults(prev => {
        const existingIndex = prev.findIndex(r => r.wordId === newResult.wordId);
        if (existingIndex > -1) {
            const updated = [...prev];
            setPoints(p => Math.max(0, p - (updated[existingIndex].pointsEarned || 0) + newResult.pointsEarned));
            updated[existingIndex] = newResult;
            return updated;
        }
        setPoints(p => p + newResult.pointsEarned);
        return [...prev, newResult];
    });
  };

  const handleDiagnosisFinish = () => {
    playAudio(SOUNDS.CELEBRATE, soundEnabled);
    setCurrentView(View.Report);
    confetti({
      particleCount: 250,
      spread: 180,
      origin: { y: 0.5 },
      ticks: 400
    });
  };

  const handleRestart = () => {
    setSelectedSound(null);
    setCurrentView(View.Selection);
  };

  const handleClearResults = () => {
    if (confirm('هل تريد مسح جميع نتائج التشخيص الحالية والبدء من جديد؟')) {
      setResults([]);
      setPoints(0);
      setSelectedSound(null);
      setCurrentView(View.Selection);
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) playAudio(SOUNDS.CLICK, true);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pb-12">
      {currentView !== View.Login && (
        <Header 
          points={points} 
          soundEnabled={soundEnabled} 
          onToggleSound={toggleSound}
          onLogout={handleLogout}
        />
      )}

      <main className="container mx-auto">
        {currentView === View.Login && <LoginScreen onLogin={handleLogin} />}

        {currentView === View.Selection && (
          <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center px-6">
              <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-tight">أهلاً بك يا بطل، {student?.name}! 👋</h2>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed">أي صوت رائع سنكتشف وننطق اليوم؟</p>
            </div>
            <SoundSelection 
              onSelect={handleSoundSelect} 
              hasResults={results.length > 0}
              onViewReport={() => setCurrentView(View.Report)}
              soundEnabled={soundEnabled}
            />
          </div>
        )}

        {currentView === View.Diagnosis && selectedSound && (
          <DiagnosisSession 
            sound={selectedSound} 
            existingResults={results}
            onUpdateResults={handleUpdateResults}
            onFinish={handleDiagnosisFinish}
            onBack={() => setCurrentView(View.Selection)}
            soundEnabled={soundEnabled}
          />
        )}

        {currentView === View.Report && student && (
          <ReportView 
            session={{ ...student, results, totalPoints: points }} 
            onRestart={handleRestart}
            onClearResults={handleClearResults}
            onLogout={handleLogout}
            soundEnabled={soundEnabled}
          />
        )}
      </main>
    </div>
  );
}
