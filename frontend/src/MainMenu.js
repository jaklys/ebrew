import React, { useState, useEffect } from 'react';

export default function MainMenu({ onGoRmutovani, onGoChmelovar }) {
  // Lokální stav pro teploty z backendu
  const [temps, setTemps] = useState({
    boiler: 0,
    varna: 0,
    scezovac: 0,
    mladina: 0,
  });

  useEffect(() => {
    // Načteme teploty z /api/temperatures
    fetch("https://blissful-connection-production.up.railway.app/api/temperatures")
      .then(res => res.json())
      .then(data => {
        setTemps(data);
      })
      .catch(err => {
        console.error("Chyba při načítání teplot:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] flex flex-col items-center pt-8">

      {/* Horní pruh: vlevo nápisy, vpravo tabulka */}
      <div className="flex justify-between items-start w-full max-w-5xl px-4 mb-8">
        {/* Levý blok */}
        <div>
          <h1 className="text-4xl font-bold mb-1">Pivní dílna</h1>
          <h2 className="text-lg">e-Brew Assistant</h2>
        </div>

        {/* Pravý blok: tabulka teplot */}
        {/* Pravý blok: tabulka teplot */}
        <div className="bg-white rounded-xl shadow border border-[#C7A324] p-4 text-sm min-w-[220px]">
          <h3 className="font-semibold text-base mb-3 text-[#C7A324]">Aktuální teploty</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span>Voda v bojleru</span>
              </div>
              <span className="font-medium">{temps.boiler} °C</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>🍲</span>
                <span>Ve varně</span>
              </div>
              <span className="font-medium">{temps.varna} °C</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>🧺</span>
                <span>Ve scezovačce</span>
              </div>
              <span className="font-medium">{temps.scezovac} °C</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>🍺</span>
                <span>Mladina</span>
              </div>
              <span className="font-medium">{temps.mladina} °C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spodní část: 3 boxy / tlačítka */}
      <div className="grid grid-cols-3 gap-4 max-w-4xl">
        {/* 1) Rmutování */}
        <button
          onClick={onGoRmutovani}
          className="border-2 border-[#C7A324] rounded-lg p-4 hover:bg-[#FFF2B5] flex flex-col items-center"
        >
          <div className="text-[#C7A324] text-4xl mb-2">🌡️</div>
          <h3 className="text-xl font-semibold">Rmutování</h3>
          <p className="text-sm">Proces rmutování...</p>
        </button>

        {/* 2) Chmelovar (aktivní) */}
        <button
          onClick={onGoChmelovar}
          className="border-2 border-[#C7A324] rounded-lg p-4 hover:bg-[#FFF2B5] flex flex-col items-center"
        >
          <div className="text-[#C7A324] text-4xl mb-2">💧</div>
          <h3 className="text-xl font-semibold">Chmelovar</h3>
          <p className="text-sm">Kroky, odpar, chmel...</p>
        </button>

        {/* 3) Chlazení (zatím disable) */}
        <button
          disabled
          className="border-2 border-[#C7A324] rounded-lg p-4 opacity-50 flex flex-col items-center"
        >
          <div className="text-[#C7A324] text-4xl mb-2">❄️</div>
          <h3 className="text-xl font-semibold">Chlazení</h3>
          <p className="text-sm">Zatím nedostupné</p>
        </button>
      </div>
    </div>
  );
}
