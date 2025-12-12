import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dumbbell, Calendar, MessageSquare, User, Activity,
  ChevronRight, Plus, Clock, Check, X, FileText,
  Settings, LogOut, TrendingUp, Users, Play, Pause,
  ChevronDown, Search, Upload, Lock, Phone, Mail, ShieldAlert,
  ToggleLeft, Menu, ArrowLeft
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithCustomToken, signInAnonymously,
  onAuthStateChanged, signOut, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, updateProfile
} from 'firebase/auth';
import {
  getFirestore, collection, doc, setDoc, getDoc,
  onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where
} from 'firebase/firestore';

// --- Firebase Initialization ---
// Placeholder config for development to avoid crash
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};
// const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'health-hub-v1';

// --- Configuration ---
const BYPASS_AUTH = true; // Set to false to enable real Login page

// --- Design System Constants (Enhanced for Personality) ---
const COLORS = {
  bg: 'bg-slate-50',
  primaryGradient: 'bg-gradient-to-r from-indigo-600 to-blue-500',
  primaryHover: 'hover:opacity-90',
  textMain: 'text-slate-900',
  textSub: 'text-slate-500',
  card: 'bg-white',
  border: 'border-slate-200',
  accent: 'text-indigo-600'
};

const STYLES = {
  card: `${COLORS.card} rounded-3xl shadow-lg shadow-slate-200/50 border ${COLORS.border} overflow-hidden transition-all hover:shadow-xl`,
  cardPadding: 'p-4 md:p-6',
  btnPrimary: `${COLORS.primaryGradient} ${COLORS.primaryHover} text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-200 active:scale-95`,
  btnSecondary: `bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 font-bold px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95`,
  input: `w-full px-5 py-3 rounded-xl border ${COLORS.border} focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white font-medium`,
  label: `block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide`,
  h1: `text-2xl md:text-3xl font-extrabold ${COLORS.textMain} tracking-tight`,
  h2: `text-lg md:text-xl font-bold ${COLORS.textMain}`,
};

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => new Date(date?.seconds * 1000 || Date.now()).toLocaleDateString('pt-BR');

// --- Mock Data for Bypass Mode ---
const MOCK_USERS = {
  patient: {
    uid: 'mock-patient-1',
    name: 'Leonardo Neto',
    email: 'leo@plucucci.com.br',
    role: 'patient',
    plan: 'free',
    status: 'active'
  },
  professional: {
    uid: 'mock-pro-1',
    name: 'Dr. Fridman',
    email: 'dr@fridman.com',
    role: 'professional',
    plan: 'professional_tier',
    status: 'active'
  },
  admin: {
    uid: 'mock-admin-1',
    name: 'Admin User',
    email: 'admin@fridman.com',
    role: 'admin',
    plan: 'admin_tier',
    status: 'active'
  }
};

// --- Components ---

// 1. Authentication & Onboarding
const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        const userData = {
          uid: userCredential.user.uid,
          name,
          email,
          role,
          plan: role === 'patient' ? 'free' : (role === 'admin' ? 'admin_tier' : 'professional_tier'),
          status: role === 'professional' ? 'pending' : 'active',
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userCredential.user.uid), userData);
      }
    } catch (err) {
      let msg = "Ocorreu um erro.";
      if (err.message.includes("auth/wrong-password")) msg = "Senha incorreta.";
      if (err.message.includes("auth/user-not-found")) msg = "Usuário não encontrado.";
      if (err.message.includes("auth/email-already-in-use")) msg = "Este email já está em uso.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className={`${STYLES.card} w-full max-w-md p-6 md:p-10 border-t-8 border-t-indigo-600`}>
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-5 text-white shadow-lg shadow-indigo-300 transform -rotate-6">
            <Activity size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fridman Care</h1>
          <p className="text-slate-500 mt-2 font-medium">Excelência em Saúde e Performance</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 font-semibold border border-red-100">
            <ShieldAlert size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className={STYLES.label}>Nome Completo</label>
              <input
                required
                type="text"
                className={STYLES.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ana Silva"
              />
            </div>
          )}

          <div>
            <label className={STYLES.label}>Email</label>
            <input
              required
              type="email"
              className={STYLES.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label className={STYLES.label}>Senha</label>
            <input
              required
              type="password"
              className={STYLES.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className={STYLES.label}>Eu sou:</label>
              <div className="grid grid-cols-3 gap-2">
                {['patient', 'professional', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border-2 text-center transition-all font-bold text-sm ${role === r
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                  >
                    {r === 'patient' ? 'Paciente' : r === 'professional' ? 'Profissional' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${STYLES.btnPrimary} w-full mt-8 text-lg`}
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar no Sistema' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
          >
            {isLogin ? "Novo na Fridman Care? Crie sua conta" : "Já tem conta? Faça login"}
          </button>
        </div>
      </div>
    </div>
  );
};
// 2. Active Workout
const ActiveWorkout = ({ workout, onClose, onFinish }) => {
  const [startTime] = useState(Date.now());
  const [duration, setDuration] = useState(0);
  const [exercises, setExercises] = useState(
    workout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map((s, i) => ({
        id: i,
        reps: s.reps,
        weight: s.weight,
        completed: false,
        type: 'normal'
      }))
    }))
  );
  const [restTimer, setRestTimer] = useState(null);
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    let interval;
    if (restTimer > 0) {
      interval = setInterval(() => setRestTimer(t => t - 1), 1000);
    } else if (restTimer === 0) {
      setShowRest(false);
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const toggleSet = (exIndex, setIndex) => {
    const newEx = [...exercises];
    const set = newEx[exIndex].sets[setIndex];
    set.completed = !set.completed;
    setExercises(newEx);

    if (set.completed) {
      setRestTimer(60);
      setShowRest(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const finishSession = () => {
    const logData = {
      workoutId: workout.id,
      title: workout.title,
      duration,
      date: serverTimestamp(),
      exercises: exercises.map(e => ({
        name: e.name,
        sets: e.sets.filter(s => s.completed)
      })),
      totalVolume: exercises.reduce((acc, ex) =>
        acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0)
        , 0)
    };
    onFinish(logData);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronDown className="text-slate-600" />
        </button>
        <div className="text-center">
          <h2 className="font-extrabold text-slate-900 text-base md:text-lg">{workout.title}</h2>
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-mono font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full mt-1">
            <Clock size={14} /> {formatTime(duration)}
          </div>
        </div>
        <button
          onClick={finishSession}
          className="bg-indigo-600 text-white px-4 md:px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
        >
          Finalizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 pb-32 p-4 space-y-4">
        {exercises.map((ex, exIdx) => (
          <div key={exIdx} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl shadow-inner flex-shrink-0">
                {ex.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{ex.name}</h3>
                <p className="text-xs text-slate-500 font-medium bg-slate-100 inline-block px-2 py-1 rounded mt-1">Descanso: 60s</p>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Carga</div>
              <div className="col-span-3">Reps</div>
              <div className="col-span-3">Status</div>
            </div>

            <div className="space-y-2">
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className={`grid grid-cols-10 gap-2 md:gap-3 items-center transition-all ${set.completed ? 'opacity-40' : ''}`}>
                  <div className="col-span-1 flex justify-center">
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                      {setIdx + 1}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-lg p-2 text-center font-mono font-bold text-slate-700 outline-none transition-colors"
                      defaultValue={set.weight}
                      onBlur={(e) => {
                        const newEx = [...exercises];
                        newEx[exIdx].sets[setIdx].weight = Number(e.target.value);
                        setExercises(newEx);
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-lg p-2 text-center font-mono font-bold text-slate-700 outline-none transition-colors"
                      defaultValue={set.reps}
                      onBlur={(e) => {
                        const newEx = [...exercises];
                        newEx[exIdx].sets[setIdx].reps = Number(e.target.value);
                        setExercises(newEx);
                      }}
                    />
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <button
                      onClick={() => toggleSet(exIdx, setIdx)}
                      className={`w-full h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${set.completed ? 'bg-green-500 text-white shadow-green-200 scale-95' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}
                    >
                      <Check size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showRest && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 border border-slate-700">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Descansando</span>
            <div className="text-3xl font-mono font-bold text-indigo-400">{formatTime(restTimer)}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRestTimer(t => t + 30)} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors">+30s</button>
            <button onClick={() => { setShowRest(false); setRestTimer(null); }} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Pular</button>
          </div>
        </div>
      )}
    </div>
  );
};
