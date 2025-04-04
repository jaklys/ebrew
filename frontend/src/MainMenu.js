import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Snowflake, Settings, Droplet } from 'lucide-react';
import Card from './Card';
import ImportRecipe from './ImportRecipe';

export default function MainMenu({ onGoRmutovani, onGoChmelovar, onGoManualControl, token }) {
  const [showImport, setShowImport] = useState(false);
  const [temps, setTemps] = useState({
    boiler: 0,
    varna: 0,
    scezovac: 0,
    mladina: 0,
  });

  // Přidáno: stav pro objem vody v bojleru
  const [waterLevel, setWaterLevel] = useState(0);

  // Pro počty receptů
  const [recipesCount, setRecipesCount] = useState(0);
  const [chmelovarCount, setChmelovarCount] = useState(0);

  useEffect(() => {
    // Načtení teplot
    fetch("https://blissful-connection-production.up.railway.app/api/temperatures")
      .then(res => res.json())
      .then(data => {
        setTemps(data);
      })
      .catch(err => console.error("Chyba při načítání teplot:", err));

    // Načtení objemu vody - mockovaná data, nahraďte skutečným API endpointem
    // fetch("http://127.0.0.1:5000/api/water-level")
    //   .then(res => res.json())
    //   .then(data => {
    //     setWaterLevel(data.boilerLevel);
    //   })
    //   .catch(err => console.error("Chyba při načítání objemu vody:", err));

    // Pro demonstraci použijeme statická data
    setWaterLevel(25.5);

    // Načtení počtu receptů
    fetch("https://blissful-connection-production.up.railway.app/api/recipes")
      .then(res => res.json())
      .then(data => {
        setRecipesCount(data.length || 0);
      })
      .catch(err => {
        console.error("Chyba při načítání počtu rmut receptů:", err);
        setRecipesCount(0);
      });

    // Načtení počtu chmelovar receptů
    fetch("https://blissful-connection-production.up.railway.app/api/chmelovarRecipes")
      .then(res => res.json())
      .then(data => {
        setChmelovarCount(data.length || 0);
      })
      .catch(err => {
        console.error("Chyba při načítání počtu chmelovar receptů:", err);
        setChmelovarCount(0);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBEF] p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-[#C7A324] mb-1">Pivní dílna</h1>
            <h2 className="text-lg text-[#C7A324]">e-Brew Assistant</h2>
          </div>

          <button
            onClick={() => setShowImport(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
          >
            Nahrát recept
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Karta s teplotami a objemem vody */}
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

              {/* Přidáno: Zobrazení objemu vody v bojleru */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-2 text-[#C7A324]">Objem vody</h3>
                <div className="flex items-center gap-2">
                  <Droplet size={20} className="text-blue-600" />
                  <span className="font-medium">Bojler:</span>
                  <span className="ml-auto text-xl font-bold">{waterLevel.toFixed(1)} L</span>
                </div>

                {/* Vizuální indikátor objemu */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${Math.min(100, (waterLevel / 50) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 L</span>
                  <span>25 L</span>
                  <span>50 L</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Karta s menu volbami */}
          <Card className="p-6 text-gray-800">
            <h2 className="text-xl font-bold mb-4 text-[#C7A324]">Procesy vaření</h2>

            <div className="space-y-4">
              <button
                onClick={onGoRmutovani}
                className="w-full p-4 border-2 border-[#C7A324] rounded-lg hover:bg-[#FFF2B5] transition-colors
                          flex items-center gap-3"
              >
                <div className="bg-[#C7A324] text-white p-3 rounded-lg shadow-md">
                  <Thermometer size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Rmutování</h3>
                  <p className="text-sm text-gray-600">Proces rmutování...</p>
                </div>
              </button>

              <button
                onClick={onGoChmelovar}
                className="w-full p-4 border-2 border-[#C7A324] rounded-lg hover:bg-[#FFF2B5] transition-colors
                          flex items-center gap-3"
              >
                <div className="bg-[#C7A324] text-white p-3 rounded-lg shadow-md">
                  <Droplets size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Chmelovar</h3>
                  <p className="text-sm text-gray-600">Kroky, odpar, chmel...</p>
                </div>
              </button>

              <button
                disabled
                className="w-full p-4 border-2 border-[#C7A324] rounded-lg opacity-50
                          flex items-center gap-3"
              >
                <div className="bg-[#C7A324] text-white p-3 rounded-lg shadow-md opacity-50">
                  <Snowflake size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Chlazení</h3>
                  <p className="text-sm text-gray-600">Zatím nedostupné</p>
                </div>
              </button>

              <button
                onClick={onGoManualControl}
                className="w-full p-4 border-2 border-[#C7A324] rounded-lg hover:bg-[#FFF2B5] transition-colors
                          flex items-center gap-3"
              >
                <div className="bg-[#C7A324] text-white p-3 rounded-lg shadow-md">
                  <Settings size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Manuální ovládání</h3>
                  <p className="text-sm text-gray-600">Přímé ovládání varny, čerpadel a topných těles</p>
                </div>
              </button>
            </div>
          </Card>
        </div>

        {/* Statistiky nebo info sekce */}
        <div className="mt-6">
          <Card className="p-6 text-gray-800">
            <h2 className="text-xl font-bold mb-4 text-[#C7A324]">Informace o systému</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border p-4 rounded-lg text-center bg-gray-50">
                <div className="font-bold text-2xl">{recipesCount}</div>
                <div className="text-sm text-gray-600">Rmut receptů</div>
              </div>

              <div className="border p-4 rounded-lg text-center bg-gray-50">
                <div className="font-bold text-2xl">{chmelovarCount}</div>
                <div className="text-sm text-gray-600">Chmelovar receptů</div>
              </div>

              <div className="border p-4 rounded-lg text-center bg-gray-50">
                <div className="font-bold text-2xl">25°C</div>
                <div className="text-sm text-gray-600">Teplota okolí</div>
              </div>

              <div className="border p-4 rounded-lg text-center bg-gray-50">
                <div className="font-bold text-2xl">Normal</div>
                <div className="text-sm text-gray-600">Stav systému</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <ImportRecipe
            token={token}
            onClose={() => setShowImport(false)}
          />
        </div>
      )}
    </div>
  );
}