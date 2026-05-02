import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Play, FileText, ChevronLeft, Volume2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bluetooth, BluetoothConnected, StopCircle, CheckCircle, Clock, Gauge, RefreshCw } from 'lucide-react';

export default function ZaliTherapyApp() {
  const [view, setView] = useState('patients'); 
  const [patients, setPatients] = useState([
    { id: 1, name: 'Mateo G.', age: 6, notes: 'Sensibilidad auditiva moderada' },
    { id: 2, name: 'Sofía R.', age: 8, notes: 'Le gusta el color azul' }
  ]);
  const [therapies, setTherapies] = useState([]);
  const [activePatient, setActivePatient] = useState(null);

  // --- ESTADO BLUETOOTH ---
  const [isConnected, setIsConnected] = useState(false);
  const [bleDevice, setBleDevice] = useState(null);
  const [bleCharacteristic, setBleCharacteristic] = useState(null);

  const goHome = () => setView('patients');
  const goMenu = (patient) => { setActivePatient(patient); setView('patientMenu'); };
  
  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Zali' }],
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] 
      });
      
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      const characteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
      
      setBleCharacteristic(characteristic);
      setBleDevice(device);
      setIsConnected(true);

      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setBleCharacteristic(null);
        alert("Zalí se ha desconectado. Verifica la batería del pez.");
      });
    } catch (error) {
      console.log("Bluetooth cancelado", error);
    }
  };

  const sendCommand = async (cmd) => {
    if (bleCharacteristic) {
      try {
        const encoder = new TextEncoder();
        await bleCharacteristic.writeValue(encoder.encode(cmd + '\n'));
      } catch (e) {
        console.error("Error enviando:", e);
      }
    } else {
      console.log("Simulando comando (sin conexión):", cmd);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col h-screen">
        
        <header className="bg-[#0F766E] text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'patients' && (
              <button onClick={view === 'patientMenu' ? goHome : () => goMenu(activePatient)} className="p-1 hover:bg-teal-700 rounded-lg transition-colors">
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-wide">Zalí Clínica</h1>
          </div>
          <button 
            onClick={connectBluetooth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isConnected ? 'bg-teal-900 text-teal-200' : 'bg-rose-500 text-white'}`}
          >
            {isConnected ? <BluetoothConnected size={14} /> : <Bluetooth size={14} />}
            {isConnected ? 'Zalí Conectado' : 'Vincular Pez'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {view === 'patients' && <PatientsView patients={patients} setPatients={setPatients} onSelect={goMenu} />}
          {view === 'patientMenu' && <PatientMenuView patient={activePatient} setView={setView} />}
          {view === 'metrics' && <MetricsView patient={activePatient} therapies={therapies} />}
          {view === 'therapy' && (
            <TherapySession 
              patient={activePatient} 
              sendCommand={sendCommand} 
              onFinish={(newTherapy) => {
                setTherapies([...therapies, newTherapy]);
                setView('metrics');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// --- VISTA DE PACIENTES ---
function PatientsView({ patients, setPatients, onSelect }) {
  const [newName, setNewName] = useState('');
  const addPatient = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setPatients([...patients, { id: Date.now(), name: newName, age: '', notes: '' }]);
    setNewName('');
  };
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 text-teal-800">
        <Users size={28} />
        <h2 className="text-2xl font-bold">Mis Pacientes</h2>
      </div>
      <form onSubmit={addPatient} className="mb-8 flex gap-2">
        <input 
          type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del nuevo paciente..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button type="submit" className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700">
          <UserPlus size={24} />
        </button>
      </form>
      <div className="space-y-3">
        {patients.map(p => (
          <div key={p.id} onClick={() => onSelect(p)} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer hover:border-teal-400 transition-all">
            <div><h3 className="font-bold text-lg text-slate-700">{p.name}</h3></div>
            <ChevronLeft size={20} className="text-slate-300 rotate-180" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MENÚ DEL PACIENTE ---
function PatientMenuView({ patient, setView }) {
  return (
    <div className="p-6 flex flex-col items-center pt-12">
      <div className="w-24 h-24 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
        {patient.name.charAt(0)}
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-1">{patient.name}</h2>
      <p className="text-slate-500 mb-12">Perfil Terapéutico</p>
      <div className="w-full space-y-4">
        <button onClick={() => setView('therapy')} className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95">
          <Play size={24} /> Iniciar Nueva Terapia
        </button>
        <button onClick={() => setView('metrics')} className="w-full bg-white text-slate-700 border-2 border-slate-200 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-sm active:scale-95">
          <FileText size={24} /> Ver Métricas (Historial)
        </button>
      </div>
    </div>
  );
}

// --- PANTALLA DE TERAPIA Y CONTROL ---
function TherapySession({ patient, sendCommand, onFinish }) {
  const [phase, setPhase] = useState('idle'); 
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [routineNumber, setRoutineNumber] = useState(1);
  const [metrics, setMetrics] = useState([]);
  
  // Estado de velocidad (Comienza en nivel 2 = Velocidad Media)
  const [speedLevel, setSpeedLevel] = useState(2); 

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const id = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(id);
      } else {
        setPhase('adaptation');
        setTimer(0);
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    let interval;
    if (phase === 'adaptation' || phase === 'routine') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // --- BOTÓN CÍCLICO ACTUALIZADO A 2, 5 y 9 ---
  const cycleVelocity = () => {
    let nextLevel = speedLevel + 1;
    if (nextLevel > 3) nextLevel = 1; // Si pasa del 3, reinicia al 1
    
    setSpeedLevel(nextLevel); // Actualiza la UI

    // Comunica la velocidad elegida al ESP32
    if (nextLevel === 1) {
      sendCommand('2'); // Nivel 1: Lento
    } else if (nextLevel === 2) {
      sendCommand('5'); // Nivel 2: Medio
    } else if (nextLevel === 3) {
      sendCommand('9'); // Nivel 3: Rápido
    }
  };

  const handleContinue = () => {
    if (phase === 'adaptation') {
      setMetrics([...metrics, { section: 'Adaptación', time: timer }]);
      setPhase('routine');
      setTimer(0);
    } else if (phase === 'routine') {
      setMetrics([...metrics, { section: `Rutina ${routineNumber}`, time: timer }]);
      setRoutineNumber(r => r + 1);
      setTimer(0);
    }
  };

  const handleFinish = () => {
    setMetrics([...metrics, { section: `Rutina ${routineNumber}`, time: timer }]);
    setPhase('summary');
    sendCommand('S'); 
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Play size={40} className="text-teal-600 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Preparar Terapia</h2>
        <button onClick={() => setPhase('countdown')} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-xl mt-10 shadow-lg">
          Iniciar Rutina
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-teal-600 text-white">
        <h2 className="text-2xl font-bold mb-8">Comenzando en...</h2>
        <span className="text-9xl font-black">{countdown}</span>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex flex-col items-center mb-8 pt-8">
          <CheckCircle size={60} className="text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold">Terapia Finalizada</h2>
        </div>
        <button onClick={() => onFinish({ id: Date.now(), patientId: patient.id, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), data: metrics })} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold mt-auto shadow-lg">
          Guardar y Salir
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className={`p-4 text-white flex justify-between items-center shadow-md ${phase === 'adaptation' ? 'bg-amber-500' : 'bg-teal-600'}`}>
        <div>
          <span className="text-xs font-bold uppercase">Fase Actual</span>
          <h2 className="text-xl font-bold">{phase === 'adaptation' ? 'Tiempo de Adaptación' : `Rutina ${routineNumber}`}</h2>
        </div>
        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl">
          <Clock size={20} />
          <span className="text-2xl font-mono font-bold tracking-widest">{formatTime(timer)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center py-4 px-4 overflow-y-auto">
        
        {/* BOTÓN CÍCLICO DE VELOCIDAD */}
        <div className="w-full mb-6">
          <button 
            onClick={cycleVelocity}
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                <Gauge size={24} />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-bold uppercase">Velocidad del Nado</p>
                <p className="text-lg font-bold text-slate-800">
                  {speedLevel === 1 && "Nivel 1 (Lento)"}
                  {speedLevel === 2 && "Nivel 2 (Medio)"}
                  {speedLevel === 3 && "Nivel 3 (Rápido)"}
                </p>
              </div>
            </div>
            <RefreshCw size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Joystick D-PAD */}
        <div className="relative w-64 h-64 bg-slate-200 rounded-full shadow-inner flex items-center justify-center p-2 mb-6">
          <div className="absolute top-0"><JoyButton icon={<ArrowUp size={32}/>} cmd="F" sendCommand={sendCommand} /></div>
          <div className="absolute bottom-0"><JoyButton icon={<ArrowDown size={32}/>} cmd="B" sendCommand={sendCommand} /></div>
          <div className="absolute left-0"><JoyButton icon={<ArrowLeft size={32}/>} cmd="L" sendCommand={sendCommand} /></div>
          <div className="absolute right-0"><JoyButton icon={<ArrowRight size={32}/>} cmd="R" sendCommand={sendCommand} /></div>
          
          <div className="w-20 h-20 bg-slate-300 rounded-full shadow-sm flex items-center justify-center">
            <button 
              onMouseDown={(e) => { e.preventDefault(); sendCommand('C'); }}
              onMouseUp={(e) => { e.preventDefault(); sendCommand('S'); }}
              onTouchStart={(e) => { e.preventDefault(); sendCommand('C'); }}
              onTouchEnd={(e) => { e.preventDefault(); sendCommand('S'); }}
              className="w-16 h-16 bg-teal-500 hover:bg-teal-400 rounded-full text-sm font-bold text-white shadow-lg active:scale-95 flex items-center justify-center transition-transform"
            >
              ZIG
            </button>
          </div>
        </div>

        {/* Botón de Sonido */}
        <button 
          onMouseDown={(e) => { e.preventDefault(); sendCommand('T'); }} 
          onTouchStart={(e) => { e.preventDefault(); sendCommand('T'); }} 
          className="bg-indigo-500 hover:bg-indigo-600 text-white w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-3 shadow-lg active:scale-95 transition-transform"
        >
          <Volume2 size={24} /> Estímulo Auditivo
        </button>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex gap-3 pb-8 shrink-0">
        {phase === 'routine' && (
          <button onClick={handleFinish} className="flex-1 bg-rose-100 text-rose-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-rose-200">
            <StopCircle size={20} /> Finalizar
          </button>
        )}
        <button onClick={handleContinue} className="flex-[2] bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
          {phase === 'adaptation' ? 'Terminar Adaptación' : 'Siguiente Rutina'} 
          <ChevronLeft size={20} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}

// COMPONENTE DEL JOYSTICK
function JoyButton({ icon, cmd, sendCommand }) {
  const handleTouch = (e, command) => { e.preventDefault(); sendCommand(command); }
  return (
    <button
      onMouseDown={(e) => handleTouch(e, cmd)}
      onMouseUp={(e) => handleTouch(e, 'S')}
      onMouseLeave={(e) => handleTouch(e, 'S')}
      onTouchStart={(e) => handleTouch(e, cmd)}
      onTouchEnd={(e) => handleTouch(e, 'S')}
      className="w-16 h-16 bg-white rounded-full shadow-lg border-b-4 border-slate-300 flex items-center justify-center text-slate-600 active:border-b-0 active:translate-y-1 transition-all"
    >
      {icon}
    </button>
  );
}

// --- VISTA DE MÉTRICAS ---
function MetricsView({ patient, therapies }) {
  const patientTherapies = therapies.filter(t => t.patientId === patient.id).reverse();
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Historial Médico</h2>
        <p className="text-slate-500">Métricas de {patient.name}</p>
      </div>
      {patientTherapies.length === 0 ? (
        <div className="text-center bg-slate-100 p-8 rounded-2xl border border-slate-200 mt-10">
          <p className="text-slate-500 font-medium">Aún no hay terapias registradas.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {patientTherapies.map(t => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-4 border-b flex justify-between">
                <span className="font-bold text-slate-700">{t.date}</span>
                <span className="text-sm text-slate-500">{t.time}</span>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {t.data.map((m, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-3 pl-4 text-slate-600 font-medium">{m.section}</td>
                      <td className="p-3 pr-4 text-right font-mono text-teal-600 font-bold">
                        {Math.floor(m.time / 60).toString().padStart(2, '0') + ':' + (m.time % 60).toString().padStart(2, '0')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
