import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, PauseCircle } from 'lucide-react';
import Card from './Card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './AlertDialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Body na ose X (Y=0), když je potřeba přidat chmel.
 * Pokud `payload.hopEvent === 0`, zobrazíme červený bod na ose.
 * Jinak nic (null).
 */
function HopAxisDot({ cx, cy, payload }) {
  // Pokud hopEvent není 0, nic nekreslíme.
  if (payload.hopEvent == null) {
    return null;
  }
  // Vykreslíme větší červený bod.
  return (
    <circle
      cx={cx}
      cy={cy}
      r={8}
      fill="red"
      stroke="white"
      strokeWidth={2}
    />
  );
}

export default function ChmelovarSimulation({ recipe, onFinish }) {
  // Ověření, zda recept existuje
  if (!recipe || !Array.isArray(recipe.steps)) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Neplatný recept (chybí steps)!</h2>
        <button
          onClick={onFinish}
          className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
        >
          Zpět
        </button>
      </div>
    );
  }

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Jediná křivka: actualTemp, startujeme od 0
  const [graphData, setGraphData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState(0);

  // Popupy
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showAddHopDialog, setShowAddHopDialog] = useState(false);

  // Pomůcka, abychom u addHop ukázali popup jen jednou (na zač. kroku).
  const [doneHop, setDoneHop] = useState([]);

  // Součet durations = totalTime
  const totalTime = recipe.steps.reduce((acc, st) => acc + (st.duration || 0), 0);

  /**
   * Můžete definovat, jak se teplota vyvíjí:
   * Zde pro ukázku: "evaporation" (4..10) => cíl 65..95 °C,
   * a posun max 2°C / min z actual temp.
   */
  function computeFinalTemp(evap) {
    // 4 => 65°C, 10 => 95°C => lineární
    return 65 + (evap - 4) * 5;
  }

  /**
   * 1) Generování graphData:
   *    - actualTemp = 0 (zatím),
   *    - hopEvent = 0 v první minutě kroku, pokud addHop===true => trvalý bod na ose X
   */
  useEffect(() => {
    const newData = [];
    let accTime = 0;
    recipe.steps.forEach(step => {
      const dur = step.duration || 0;
      // Vygenerujeme dur záznamů
      for (let m = 0; m < dur; m++) {
        newData.push({
          time: accTime,
          actualTemp: null, // zatím neznáme
          // hopEvent=0 => bod na Y=0 => bude vidět
          hopEvent: (step.addHop && m === 0) ? 0 : null
        });
        accTime++;
      }
    });

    setGraphData(newData);
    setTime(0);
    setCurrentTemp(0);   // start od 0°C
    setIsRunning(false);
    setIsPaused(false);
    setDoneHop([]);
  }, [recipe]);

  /**
   * 2) Vlastní simulace
   *    Každých 400ms => time+1 => spočítáme newTemp, uložíme do graphData.
   */
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTime(prev => {
        const newT = prev + 1;
        if (newT > totalTime) {
          setIsRunning(false);
          return prev;
        }

        // Najdeme stepIndex (ve kterém kroku se nacházíme)
        let acc = 0;
        let stepIndex = -1;
        for (let i = 0; i < recipe.steps.length; i++) {
          const d = recipe.steps[i].duration || 0;
          if (newT <= acc + d - 1) {
            stepIndex = i;
            break;
          }
          acc += d;
        }

        // Spočteme "cílovou" teplotu pro ten krok => finalT
        let finalT = 0;
        if (stepIndex >= 0) {
          const st = recipe.steps[stepIndex];
          finalT = computeFinalTemp(st.evaporation || 4);
        }

        // Aktualizace actualTemp => posun max 2°C
        setCurrentTemp(old => {
          let diff = finalT - old;
          if (Math.abs(diff) > 2) {
            diff = diff > 0 ? 2 : -2;
          }
          const newVal = old + diff * (0.9 + Math.random() * 0.2);

          // Uložíme do graphData
          setGraphData(d => {
            const copy = [...d];
            if (copy[newT]) {
              copy[newT] = {
                ...copy[newT],
                actualTemp: newVal
              };
            }
            return copy;
          });
          return newVal;
        });

        // 3) Kontrola addHop => popup
        // Chceme ho zobrazit v 1. minutě kroku => newT-acc===1
        if (stepIndex >= 0) {
          const st = recipe.steps[stepIndex];
          const stepStart = acc;
          if (st.addHop && !doneHop.includes(stepIndex)) {
            const minuteInStep = newT - stepStart;
            if (minuteInStep === 1) {
              // zobrazit popup
              setIsRunning(false);
              setShowAddHopDialog(true);
              setDoneHop(prev2 => [...prev2, stepIndex]);
            }
          }
        }

        return newT;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, recipe, totalTime, doneHop]);

  // Start/pause tlačítko
  function toggleSimulation() {
    if (!isRunning) {
      // spustit
      if (time >= totalTime) {
        // re-run
        setTime(0);
        setCurrentTemp(0);
        // Re-init graphData?
        // Buď tu zkopírujete kód z useEffect anebo refresh.
      }
      setIsRunning(true);
    } else {
      // pauza
      setIsPaused(!isPaused);
    }
  }

  // Okno pro "přidej chmel" => Zavřít => spustit simulaci
  function handleAddHopContinue() {
    setShowAddHopDialog(false);
    setIsRunning(true);
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      {/* Horní pruh */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => {
            if (isRunning) {
              setShowExitDialog(true);
            } else {
              onFinish();
            }
          }}
          className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full"
        >
          <ArrowLeft size={24}/>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          Simulace Chmelovaru: {recipe.name}
        </h1>
      </div>

      {/* exit dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ukončit chmelovar?</AlertDialogTitle>
            <AlertDialogDescription>
              Simulace běží. Opravdu ukončit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>
              Storno
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onFinish}
              className="bg-red-500 hover:bg-red-600"
            >
              Ukončit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* addHop dialog */}
      <AlertDialog open={showAddHopDialog} onOpenChange={setShowAddHopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Přidej chmel</AlertDialogTitle>
            <AlertDialogDescription>
              Je čas přidat chmel do varu!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleAddHopContinue}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Pokračovat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <p className="text-base">
              Aktuální teplota: <span className="font-bold">{currentTemp.toFixed(1)} °C</span>
            </p>
            {isRunning && (
              <p className="text-base">
                Zbývá: <span className="font-bold">{Math.max(0, totalTime - time)}</span> min
              </p>
            )}
          </div>
          <button
            onClick={toggleSimulation}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg text-white
              ${!isRunning ? 'bg-green-500 hover:bg-green-600' :
               isPaused ? 'bg-green-500 hover:bg-green-600' :
                          'bg-yellow-500 hover:bg-yellow-600'}
            `}
          >
            {!isRunning ? <PlayCircle size={20}/> :
             isPaused ? <PlayCircle size={20}/> :
                        <PauseCircle size={20}/> }
            {!isRunning ? 'Spustit' :
             isPaused ? 'Pokračovat' : 'Pozastavit'}
          </button>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />

              {/* Doména od 0 do auto, abychom začínali y=0 dole */}
              <YAxis domain={[0, 'auto']} />

              <Tooltip />
              <Legend />

              {/* Jen jedna linka pro "skutečnou" teplotu */}
              <Line
                type="monotone"
                dataKey="actualTemp"
                stroke="#4CAF50"
                strokeWidth={2}
                name="Skutečná"
                dot={false}
              />

              {/* Další linka, jen pro body = Y=0 => addHop */}
              <Line
                type="monotone"
                dataKey="hopEvent"
                stroke="none"           // nechceme čáru
                name="Přidat chmel"
                dot={<HopAxisDot />}    // custom dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
