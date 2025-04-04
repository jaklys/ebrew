import React, { useState, useEffect } from 'react';
import { ArrowLeft, Thermometer, Power, RotateCw, RefreshCw } from 'lucide-react';
import Card from './Card';

export default function ManualControl({ onBack, token }) {
  // Stavy pro čerpadlo
  const [pumpActive, setPumpActive] = useState(false);
  const [pumpDirection, setPumpDirection] = useState('forward'); // 'forward' nebo 'backward'

  // Stavy pro míchání
  const [mixerActive, setMixerActive] = useState(false);

  // Stavy pro topné spirály
  const [boilerHeaterActive, setBoilerHeaterActive] = useState(false);
  const [boilerTargetTemp, setBoilerTargetTemp] = useState(60);
  const [boilerTime, setBoilerTime] = useState(30);

  const [kettleHeaterActive, setKettleHeaterActive] = useState(false);
  const [kettleTargetTemp, setKettleTargetTemp] = useState(65);
  const [kettleTime, setKettleTime] = useState(30);

  // Aktuální teploty
  const [temps, setTemps] = useState({
    boiler: 0,
    varna: 0,
    scezovac: 0,
    mladina: 0,
  });

  // Načtení teplot
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://blissful-connection-production.up.railway.app/api/temperatures")
        .then(res => res.json())
        .then(data => {
          setTemps(data);
        })
        .catch(err => console.error("Chyba při načítání teplot:", err));
    }, 5000); // Aktualizace každých 5 sekund

    return () => clearInterval(interval);
  }, []);

  // Funkce pro ovládání zařízení
  function togglePump() {
    // Zde by byl API call
    setPumpActive(!pumpActive);
    // Příklad API volání:
    // fetch("http://127.0.0.1:5000/api/control/pump", {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ active: !pumpActive, direction: pumpDirection })
    // })
    // .then(res => res.json())
    // .then(data => console.log("Pump control:", data))
    // .catch(err => console.error("Error:", err));
  }

  function togglePumpDirection() {
    const newDirection = pumpDirection === 'forward' ? 'backward' : 'forward';
    setPumpDirection(newDirection);
    // API call pokud je čerpadlo aktivní
    if (pumpActive) {
      // API call pro změnu směru
    }
  }

  function toggleMixer() {
    setMixerActive(!mixerActive);
    // API call
  }

  function activateBoilerHeater() {
    setBoilerHeaterActive(true);
    // API call s parametry boilerTargetTemp a boilerTime
  }

  function deactivateBoilerHeater() {
    setBoilerHeaterActive(false);
    // API call
  }

  function activateKettleHeater() {
    setKettleHeaterActive(true);
    // API call s parametry kettleTargetTemp a kettleTime
  }

  function deactivateKettleHeater() {
    setKettleHeaterActive(false);
    // API call
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full"
        >
          <ArrowLeft size={24}/>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          Manuální ovládání
        </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card pro čerpadlo a míchání */}
        <Card className="p-6 text-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#C7A324]">Čerpadlo a míchání</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Čerpání</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={togglePump}
                className={`flex-1 px-4 py-2 rounded flex items-center justify-center gap-2
                  ${pumpActive
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Power size={18} />
                {pumpActive ? 'Vypnout' : 'Zapnout'}
              </button>

              <button
                onClick={togglePumpDirection}
                className={`flex-1 px-4 py-2 rounded flex items-center justify-center gap-2
                  ${pumpDirection === 'forward'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                disabled={!pumpActive}
              >
                <RotateCw size={18} className={pumpDirection === 'backward' ? 'transform -scale-x-100' : ''} />
                {pumpDirection === 'forward' ? 'Vpřed' : 'Vzad'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Míchání</h3>
            <button
              onClick={toggleMixer}
              className={`w-full px-4 py-2 rounded flex items-center justify-center gap-2
                ${mixerActive
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <RefreshCw size={18} className={mixerActive ? 'animate-spin' : ''} />
              {mixerActive ? 'Vypnout míchání' : 'Zapnout míchání'}
            </button>
          </div>
        </Card>

        {/* Card pro aktuální teploty */}
        <Card className="p-6 text-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#C7A324]">Aktuální teploty</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer size={20} className="text-red-500" />
              <span className="font-medium">Bojler:</span>
              <span className="ml-auto text-xl font-bold">{temps.boiler} °C</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={20} className="text-orange-500" />
              <span className="font-medium">Varna:</span>
              <span className="ml-auto text-xl font-bold">{temps.varna} °C</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={20} className="text-blue-500" />
              <span className="font-medium">Scezovačka:</span>
              <span className="ml-auto text-xl font-bold">{temps.scezovac} °C</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={20} className="text-green-500" />
              <span className="font-medium">Mladina:</span>
              <span className="ml-auto text-xl font-bold">{temps.mladina} °C</span>
            </div>
          </div>
        </Card>

        {/* Card pro topnou spirálu bojleru */}
        <Card className="p-6 text-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#C7A324]">Topná spirála - Bojler</h2>

          {boilerHeaterActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Stav:</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Aktivní
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cílová teplota:</span>
                <span>{boilerTargetTemp} °C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Nastavený čas:</span>
                <span>{boilerTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Aktuální teplota:</span>
                <span className="text-xl font-bold">{temps.boiler} °C</span>
              </div>
              <button
                onClick={deactivateBoilerHeater}
                className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Deaktivovat topení
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Cílová teplota (°C)</label>
                <input
                  type="number"
                  value={boilerTargetTemp}
                  onChange={(e) => setBoilerTargetTemp(Number(e.target.value))}
                  className="p-2 border rounded"
                  min="20"
                  max="100"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Čas (min)</label>
                <input
                  type="number"
                  value={boilerTime}
                  onChange={(e) => setBoilerTime(Number(e.target.value))}
                  className="p-2 border rounded"
                  min="1"
                />
              </div>
              <button
                onClick={activateBoilerHeater}
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Aktivovat topení
              </button>
            </div>
          )}
        </Card>

        {/* Card pro topnou spirálu varny */}
        <Card className="p-6 text-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#C7A324]">Topná spirála - Varna</h2>

          {kettleHeaterActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Stav:</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Aktivní
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cílová teplota:</span>
                <span>{kettleTargetTemp} °C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Nastavený čas:</span>
                <span>{kettleTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Aktuální teplota:</span>
                <span className="text-xl font-bold">{temps.varna} °C</span>
              </div>
              <button
                onClick={deactivateKettleHeater}
                className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Deaktivovat topení
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Cílová teplota (°C)</label>
                <input
                  type="number"
                  value={kettleTargetTemp}
                  onChange={(e) => setKettleTargetTemp(Number(e.target.value))}
                  className="p-2 border rounded"
                  min="20"
                  max="100"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Čas (min)</label>
                <input
                  type="number"
                  value={kettleTime}
                  onChange={(e) => setKettleTime(Number(e.target.value))}
                  className="p-2 border rounded"
                  min="1"
                />
              </div>
              <button
                onClick={activateKettleHeater}
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Aktivovat topení
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}