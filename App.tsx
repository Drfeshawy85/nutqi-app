
import React, { useState, useEffect, useRef } from 'react';
import { TargetWord, SoundData, DiagnosisResult, StudentSession } from './types';
import { TARGET_SOUNDS } from './constants';
import { analyzeSpeech } from './services/geminiService';

// --- Local Storage Keys ---
const STORAGE_KEYS = {
  CURRENT_STUDENT: 'nutqi_current_student',
  CURRENT_RESULTS: 'nutqi_current_results',
  TOTAL_POINTS: 'nutqi_total_points',
  SOUND_ENABLED: 'nutqi_sound_enabled',
};

// --- Sound Asset URLs ---
const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  WRONG: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  CELEBRATE: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3',
};

declare const confetti: any;

const playAudio = (url: string, enabled: boolean) => {
  if (!enabled) return;
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <div className={`flex items-center gap-3 ${size === 'lg' ? 'flex-col' : ''}`}>
    <div className={`bg-gradient-to-br from-green-400 to-indigo-600 p-2.5 rounded-[1.5rem] shadow-xl transform transition-transform hover:rotate-6 ${size === 'lg' ? 'w-24 h-24' : 'w-10 h-10'}`}>
      <svg className="text-white w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>
    <div className="flex flex-col items-center">
      <h1 className={`font-brand text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-500 to-indigo-600 pb-2 ${size === 'lg' ? 'text-6xl mt-4' : 'text-2xl'}`}>نطقي</h1>
      {size === 'lg' && <div className="h-1.5 w-20 bg-gradient-to-r from-green-400 to-indigo-400 rounded-full mt-1 animate-pulse"></div>}
    </div>
  </div>
);

const Header: React.FC<{ 
  points: number; 
  soundEnabled: boolean; 
  onToggleSound: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}> = ({ points, soundEnabled, onToggleSound, onLogout, onGoHome }) => (
  <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm py-3 px-6 mb-6 border-b border-green-50">
    <div className="max-w-5xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={onGoHome}><Logo /></div>
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-1.5 rounded-2xl items-center gap-2 border border-yellow-200">
          <span className="text-xl animate-bounce">⭐</span>
          <span className="font-bold text-yellow-700">{points} نقطة</span>
        </div>
        <button onClick={onToggleSound} className={`p-2.5 rounded-xl border ${soundEnabled ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400'}`}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button onClick={onLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100">خروج</button>
      </div>
    </div>
  </header>
);

const LoginScreen: React.FC<{ onLogin: (name: string, code: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) onLogin(name, code);
  };
  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-[3rem] shadow-2xl border-4 border-white">
      <div className="text-center mb-10"><Logo size="lg" /></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 rounded-[1.5rem] text-right" placeholder="اسم البطل" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 rounded-[1.5rem] text-right" placeholder="الكود" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="w-full bg-green-500 text-white py-4 rounded-[1.5rem] text-xl font-bold">انطلاق! 🚀</button>
      </form>
    </div>
  );
};

const DiagnosisSession: React.FC<{
  sound: SoundData;
  onUpdateResults: (result: DiagnosisResult | null, wordId?: string) => void;
  onFinish: () => void;
  onBack: () => void;
  existingResults: DiagnosisResult[];
  soundEnabled: boolean;
}> = ({ sound, onUpdateResults, onFinish, onBack, existingResults, soundEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentWord = sound.words[currentIndex];
  const currentResult = existingResults.find(r => r.wordId === currentWord.id);

  const SILENCE_THRESHOLD = 0.015;
  const SILENCE_DURATION = 1500;

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const startRecording = async () => {
    try {
      if (isRecording) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let lastVoiceTime = Date.now();

      const checkSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        let maxVal = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = Math.abs(dataArray[i] / 128.0 - 1.0);
          if (val > maxVal) maxVal = val;
        }
        if (maxVal > SILENCE_THRESHOLD) lastVoiceTime = Date.now();
        else if (Date.now() - lastVoiceTime > SILENCE_DURATION) { stopRecording(); return; }
        animationFrameRef.current = requestAnimationFrame(checkSilence);
      };

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
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } else playAudio(SOUNDS.WRONG, soundEnabled);
          onUpdateResults({ ...result, pointsEarned });
          setIsAnalyzing(false);
        };
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      checkSilence();
    } catch (err) { alert("الميكروفون مطلوب للتشخيص"); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-green-700 font-bold bg-white px-4 py-2 rounded-xl shadow-sm">العودة</button>
        <div className="font-black text-xl text-green-700">تحدي صوت ({sound.phoneme})</div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border-[12px] border-white text-center p-10 space-y-8">
        <div className="relative aspect-video bg-slate-50 rounded-[3rem] overflow-hidden">
          <img src={currentWord.imageUrl} alt={currentWord.word} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-center pb-6">
            <span className="bg-white/90 px-10 py-4 rounded-3xl text-5xl font-black shadow-xl">{currentWord.word}</span>
          </div>
        </div>

        {!currentResult ? (
          <div className="space-y-6">
            <button onClick={isRecording ? stopRecording : startRecording} disabled={isAnalyzing} className={`w-32 h-32 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-xl'} text-white flex items-center justify-center mx-auto`}>
              {isAnalyzing ? '...' : '🎤'}
            </button>
            <p className="text-slate-500 font-bold text-lg">{isRecording ? "أسمعك... تكلم" : "اضغط وتكلم"}</p>
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-[3rem] text-right space-y-6 border-2 border-white shadow-inner">
            <div className="flex items-center justify-between">
               <span className={`px-6 py-2 rounded-full text-white font-bold ${currentResult.isCorrect ? 'bg-green-500' : 'bg-orange-500'}`}>
                 {currentResult.isCorrect ? 'نطق صحيح ✅' : currentResult.errorType === 'substitution' ? 'إبدال 🔄' : 'حذف ❌'}
               </span>
               <span className="text-2xl font-black text-green-600">+{currentResult.pointsEarned} ⭐</span>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-sm mb-1">سمعتك تقول:</p>
              <p className="text-3xl font-bold text-slate-700 italic">"{currentResult.transcribed}"</p>
            </div>

            {!currentResult.isCorrect && (
              <div className="bg-white p-6 rounded-2xl border-r-8 border-orange-400">
                <p className="font-bold text-orange-700">
                  {currentResult.errorType === 'substitution' ? currentResult.substitutionDetails : currentResult.omissionDetails}
                </p>
              </div>
            )}

            <p className="text-green-600 font-bold">{currentResult.comment}</p>

            <div className="flex gap-4">
              <button onClick={() => onUpdateResults(null, currentWord.id)} className="flex-1 bg-white py-4 rounded-2xl border-2 font-bold text-slate-500">إعادة</button>
              <button onClick={() => currentIndex < sound.words.length - 1 ? setCurrentIndex(currentIndex + 1) : onFinish()} className="flex-[2] bg-slate-800 text-white py-4 rounded-2xl font-bold text-xl">التالي</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportView: React.FC<{ 
  session: StudentSession;
  onRestart: () => void;
  onLogout: () => void;
}> = ({ session, onRestart, onLogout }) => {
  const correct = session.results.filter(r => r.isCorrect);
  const substitutions = session.results.filter(r => r.errorType === 'substitution');
  const omissions = session.results.filter(r => r.errorType === 'omission');

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 text-right">
      <div className="bg-white rounded-[4rem] shadow-2xl p-12 border-[12px] border-white">
        <h2 className="text-4xl font-black mb-10 text-slate-800 border-b-4 border-green-100 pb-4 inline-block">تقرير البطل {session.name} 🏆</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-green-50 p-8 rounded-3xl text-center shadow-sm">
            <span className="block text-5xl font-black text-green-600 mb-2">{correct.length}</span>
            <span className="font-bold text-green-800">كلمات صحيحة</span>
          </div>
          <div className="bg-orange-50 p-8 rounded-3xl text-center shadow-sm">
            <span className="block text-5xl font-black text-orange-600 mb-2">{substitutions.length}</span>
            <span className="font-bold text-orange-800">حالات إبدال</span>
          </div>
          <div className="bg-red-50 p-8 rounded-3xl text-center shadow-sm">
            <span className="block text-5xl font-black text-red-600 mb-2">{omissions.length}</span>
            <span className="font-bold text-red-800">حالات حذف</span>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-black mb-6 text-indigo-700">الملخص التشخيصي:</h3>
          <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border-2 border-indigo-100 space-y-4 text-lg">
            {substitutions.length > 0 && (
              <p className="flex items-start gap-2">
                <span>📍</span>
                <span>يميل البطل إلى <strong>إبدال</strong> الأصوات المستهدفة، تكرر ذلك {substitutions.length} مرات.</span>
              </p>
            )}
            {omissions.length > 0 && (
              <p className="flex items-start gap-2">
                <span>📍</span>
                <span>تم رصد <strong>حذف</strong> لبعض المقاطع أو الحروف في {omissions.length} كلمات.</span>
              </p>
            )}
            {correct.length > (session.results.length / 2) ? (
              <p className="flex items-start gap-2">
                <span>🌟</span>
                <span>أداء رائع! معظم الكلمات نُطقت بشكل سليم وواضح.</span>
              </p>
            ) : (
              <p className="flex items-start gap-2">
                <span>💪</span>
                <span>نحتاج إلى المزيد من التدريب على مخارج الحروف لزيادة الوضوح.</span>
              </p>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black mb-6">تفاصيل الكلمات:</h3>
        <div className="space-y-4 mb-10">
          {session.results.map((res, i) => (
            <div key={i} className="bg-white border-2 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <span className="text-3xl font-black text-slate-700">{res.word}</span>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${res.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {res.isCorrect ? 'نطق صحيح' : res.errorType === 'substitution' ? 'إبدال' : 'حذف'}
                </span>
              </div>
              <p className="text-slate-500 font-medium">
                {!res.isCorrect && (res.errorType === 'substitution' ? res.substitutionDetails : res.omissionDetails)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 no-print">
          <button onClick={onRestart} className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl">مغامرة جديدة</button>
          <button onClick={() => window.print()} className="bg-slate-100 px-10 rounded-2xl font-bold">طباعة</button>
          <button onClick={onLogout} className="bg-red-50 text-red-600 px-6 rounded-2xl font-bold">خروج</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<number>(0); // 0: Login, 1: Selection, 2: Diagnosis, 3: Report
  const [student, setStudent] = useState<{ name: string; code: string } | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundData | null>(null);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    const r = localStorage.getItem(STORAGE_KEYS.CURRENT_RESULTS);
    const p = localStorage.getItem(STORAGE_KEYS.TOTAL_POINTS);
    if (s) { setStudent(JSON.parse(s)); setCurrentView(1); }
    if (r) setResults(JSON.parse(r));
    if (p) setPoints(parseInt(p));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (student) localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
    localStorage.setItem(STORAGE_KEYS.CURRENT_RESULTS, JSON.stringify(results));
    localStorage.setItem(STORAGE_KEYS.TOTAL_POINTS, points.toString());
  }, [student, results, points, isLoaded]);

  const handleUpdateResults = (res: DiagnosisResult | null, wordId?: string) => {
    if (res === null && wordId) {
      setResults(prev => {
        const existing = prev.find(r => r.wordId === wordId);
        if (existing) setPoints(p => Math.max(0, p - existing.pointsEarned));
        return prev.filter(r => r.wordId !== wordId);
      });
      return;
    }
    if (!res) return;
    setResults(prev => {
      const idx = prev.findIndex(r => r.wordId === res.wordId);
      if (idx > -1) {
        const updated = [...prev];
        setPoints(p => p - updated[idx].pointsEarned + res.pointsEarned);
        updated[idx] = res;
        return updated;
      }
      setPoints(p => p + res.pointsEarned);
      return [...prev, res];
    });
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pb-12">
      {currentView !== 0 && (
        <Header points={points} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(!soundEnabled)} onLogout={() => {if(confirm('خروج؟')){setStudent(null); setCurrentView(0);}}} onGoHome={() => setCurrentView(1)} />
      )}
      <main className="container mx-auto">
        {currentView === 0 && <LoginScreen onLogin={(n, c) => { setStudent({ name: n, code: c }); setCurrentView(1); playAudio(SOUNDS.SUCCESS, soundEnabled); }} />}
        {currentView === 1 && (
          <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-700">
            <div className="text-center px-6">
              <h2 className="text-5xl font-black text-slate-800 mb-6">أهلاً يا بطل، {student?.name}! 👋</h2>
              <p className="text-2xl text-slate-500 font-medium">أي صوت رائع سنكتشف اليوم؟</p>
            </div>
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {TARGET_SOUNDS.map(s => (
                <button key={s.phoneme} onClick={() => { setSelectedSound(s); setCurrentView(2); playAudio(SOUNDS.CLICK, soundEnabled); }} className="bg-white p-10 rounded-[3rem] shadow-xl hover:scale-105 transition-all">
                  <span className="text-8xl font-black text-green-600 block mb-4">{s.phoneme}</span>
                  <span className="text-2xl font-bold text-slate-700">{s.name}</span>
                </button>
              ))}
            </div>
            {results.length > 0 && <div className="text-center"><button onClick={() => setCurrentView(3)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg">📊 عرض التقرير</button></div>}
          </div>
        )}
        {currentView === 2 && selectedSound && (
          <DiagnosisSession sound={selectedSound} existingResults={results} onUpdateResults={handleUpdateResults} onFinish={() => { setCurrentView(3); playAudio(SOUNDS.CELEBRATE, soundEnabled); }} onBack={() => setCurrentView(1)} soundEnabled={soundEnabled} />
        )}
        {currentView === 3 && student && (
          <ReportView session={{ ...student, results, totalPoints: points }} onRestart={() => setCurrentView(1)} onLogout={() => {setStudent(null); setCurrentView(0);}} />
        )}
      </main>
    </div>
  );
}
