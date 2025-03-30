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
    fetch("http://127.0.0.1:5000/api/temperatures")
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
        <table className="bg-white rounded-lg border border-[#C7A324] text-left text-sm">
          <tbody>
            <tr>
              <td className="px-3 py-2 border-b border-[#C7A324] flex items-center gap-2">
                <span>🔥</span>
                <span>Voda v bojleru</span>
              </td>
              <td className="px-3 py-2 border-b border-[#C7A324]">
                {temps.boiler} °C
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 border-b border-[#C7A324] flex items-center gap-2">
                <span>🍲</span>
                <span>Teplota ve varně</span>
              </td>
              <td className="px-3 py-2 border-b border-[#C7A324]">
                {temps.varna} °C
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 border-b border-[#C7A324] flex items-center gap-2">
                <span>🧺</span>
                <span>Teplota ve scezovači</span>
              </td>
              <td className="px-3 py-2 border-b border-[#C7A324]">
                {temps.scezovac} °C
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 flex items-center gap-2">
                <span>🍺</span>
                <span>Teplota mladiny</span>
              </td>
              <td className="px-3 py-2">
                {temps.mladina} °C
              </td>
            </tr>
          </tbody>
        </table>
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
