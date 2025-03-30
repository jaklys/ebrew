import React, { useState, useEffect } from 'react';
import { PlayCircle, PauseCircle, ArrowLeft } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './AlertDialog';

import Card from './Card';

/**
 * Vypočítá "plán" ohřevu a držení teploty pro kroky
 * s vynecháním endStep (konec/čerpadlo).
 */
function calculatePlannedCurve(recipe) {
  const data = [];
  let time = 0;
  let temp = 20;
  data.push({ time, plannedTemp: temp, actualTemp: null });

  for (const step of recipe.steps) {
    if (step.isEndStep) break;
    const diff = step.targetTemp - temp;
    const rampTime = Math.abs(diff) / (step.rampRate || 1);

    // rampa
    for (let i = 0; i < rampTime; i++) {
      time++;
      temp += diff / rampTime;
      data.push({ time, plannedTemp: temp, actualTemp: null });
    }

    // holdTime
    for (let h = 0; h < step.holdTime; h++) {
      time++;
      data.push({ time, plannedTemp: step.targetTemp, actualTemp: null });
    }
    temp = step.targetTemp;
  }
  return data;
}

/**
 * Spočítá celkový čas receptu (rampa + hold)
 * mimo endStep.
 */
function getTotalTime(recipe) {
  let total = 0;
  let lastTemp = 20;
  for (const step of recipe.steps) {
    if (step.isEndStep) break;
    const diff = step.targetTemp - lastTemp;
    const rampTime = Math.abs(diff) / (step.rampRate || 1);
    total += rampTime + step.holdTime;
    lastTemp = step.targetTemp;
  }
  return Math.floor(total);
}

function getPlannedTempAtTime(recipe, t) {
  let timeAcc = 0;
  let temp = 20;
  for (const step of recipe.steps) {
    if (step.isEndStep) break;
    const diff = step.targetTemp - temp;
    const rampTime = Math.abs(diff)/(step.rampRate || 1);

    if (t < timeAcc + rampTime) {
      const frac = (t - timeAcc)/rampTime;
      return temp + frac*diff;
    }
    timeAcc += rampTime;
    temp = step.targetTemp;

    if (t < timeAcc + step.holdTime) {
      return step.targetTemp;
    }
    timeAcc += step.holdTime;
  }
  return temp;
}

function computeNextActualTemp(oldT, plannedT) {
  const diff = plannedT - oldT;
  const maxChange = 2;
  let eff = diff;
  if (Math.abs(diff) > maxChange) {
    eff = diff>0 ? maxChange : -maxChange;
  }
  const randomFactor = 0.85 + Math.random()*0.3;
  const oscillation = (Math.random()-0.5)*0.8;
  return oldT + eff*randomFactor + oscillation;
}

/**
 * Určí index kroku, v němž se nacházíme pro daný time.
 * Pokud narazíme na isEndStep, vrátíme index endStep.
 */
function getCurrentStepIndex(recipe, t) {
  let timeAcc = 0;
  let lastTemp = 20;
  for (let i=0; i<recipe.steps.length; i++) {
    const step = recipe.steps[i];
    if (step.isEndStep) {
      return i;
    }
    const diff = step.targetTemp - lastTemp;
    const rampTime = Math.abs(diff)/(step.rampRate || 1);
    const stepDur = rampTime + step.holdTime;
    if (t < timeAcc + stepDur) {
      return i;
    }
    timeAcc += stepDur;
    lastTemp = step.targetTemp;
  }
  const endIndex = recipe.steps.findIndex(s => s.isEndStep);
  if (endIndex >=0) return endIndex;
  return -1;
}

export default function BrewingSimulation({ recipe, onFinish }) {
  const [time, setTime] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(20);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [graphData, setGraphData] = useState([]);

  // Pro odchod (pokud je simulace rozjetá)
  const [showExitDialog, setShowExitDialog] = useState(false);
  // Pro jódovku
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  // Pro koncové čerpání
  const [showPumpDialog, setShowPumpDialog] = useState(false);

  // Abysme nezobrazovali jódovou pauzu víckrát
  const [donePauses, setDonePauses] = useState([]);

  const SIMULATION_SPEED = 5;
  const totalTime = getTotalTime(recipe);

  // Načtení / reset při změně receptu
  useEffect(() => {
    const curve = calculatePlannedCurve(recipe);
    setGraphData(curve);
    setTime(0);
    setCurrentTemp(20);
    setIsRunning(false);
    setIsPaused(false);
    setShowExitDialog(false);
    setShowPauseDialog(false);
    setShowPumpDialog(false);
    setDonePauses([]);
  }, [recipe]);

  // Hlavní simulace
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTime(prev => {
        const newTime = prev + 1;
        if (newTime > totalTime) {
          // dospěli jsme na konec => endStep?
          const endIndex = recipe.steps.findIndex(s => s.isEndStep);
          if (endIndex>=0) {
            setShowPumpDialog(true);
          }
          setIsRunning(false);
          return prev;
        }

        // spočítáme novou reálnou teplotu
        const plannedT = getPlannedTempAtTime(recipe, newTime);
        setCurrentTemp(oldT => {
          const newT = computeNextActualTemp(oldT, plannedT);
          // zapsat do grafu
          setGraphData(data => {
            const copy = [...data];
            if (copy[newTime]) {
              copy[newTime] = {
                ...copy[newTime],
                actualTemp: newT
              };
            }
            return copy;
          });
          return newT;
        });

        // zkontrolujeme, jestli je manuální pauza
        const idx = getCurrentStepIndex(recipe, newTime);
        if (idx>=0 && idx< recipe.steps.length) {
          const step = recipe.steps[idx];
          if (step.isEndStep) {
            // end => okno s čerpáním
            setIsRunning(false);
            setShowPumpDialog(true);
          } else if (step.manualPause && !donePauses.includes(idx)) {
            // jódová zkouška => pauzneme
            setIsRunning(false);
            setShowPauseDialog(true);
          }
        }
        return newTime;
      });
    }, 1000/SIMULATION_SPEED);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, recipe, donePauses, totalTime]);

  // Start / Pause
  const toggleSimulation = () => {
    if (!isRunning) {
      if (time> totalTime) {
        // re-run
        setTime(0);
        setCurrentTemp(20);
        setGraphData(calculatePlannedCurve(recipe));
      }
      setIsRunning(true);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // Potvrdit jódovku => nezobrazíme znovu
  const handlePauseDialogContinue = () => {
    const idx = getCurrentStepIndex(recipe, time);
    if (idx>=0) {
      setDonePauses([...donePauses, idx]);
    }
    setShowPauseDialog(false);
    setIsRunning(true);
  };

  // endStep => stop čerpání => onFinish
  const handlePumpOk = () => {
    setShowPumpDialog(false);
    onFinish();
  };

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      {/* Horní pruh */}
      <div className="flex items-center mb-4">
        <button
          className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full"
          onClick={() => {
            if (isRunning) {
              // zobrazení exit dialogu
              setShowExitDialog(true);
            } else {
              onFinish();
            }
          }}
        >
          <ArrowLeft size={24}/>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          Simulace: {recipe.name}
        </h1>
      </div>

      {/* Dialog pro odchod ze simulace */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ukončit vaření?</AlertDialogTitle>
            <AlertDialogDescription>
              Proces je rozběhnutý. Opravdu ukončit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* TLAČÍTKO STORNO */}
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>
              Storno
            </AlertDialogCancel>
            {/* TLAČÍTKO UKONČIT */}
            <AlertDialogAction
              onClick={onFinish}
              className="bg-red-500 hover:bg-red-600"
            >
              Ukončit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Jódová zkouška => jediné tlačítko Pokračovat */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jódová zkouška</AlertDialogTitle>
            <AlertDialogDescription>
              Proveďte jódovou zkoušku a poté klikněte na "Pokračovat".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handlePauseDialogContinue}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Pokračovat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Konečný krok => dialog s čerpej vlevo, čerpej vpravo, stop čerpání */}
      <AlertDialog open={showPumpDialog} onOpenChange={setShowPumpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konec (čerpání)</AlertDialogTitle>
            <AlertDialogDescription>
              Ovládání čerpadla:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex gap-2">
              {/* Čerpej vlevo */}
              <button className="px-4 py-2 bg-green-500 text-white rounded">
                Čerpej vlevo
              </button>
              {/* Čerpej vpravo */}
              <button className="px-4 py-2 bg-green-500 text-white rounded">
                Čerpej vpravo
              </button>
              {/* Stop čerpání => handlePumpOk => onFinish */}
              <button
                onClick={handlePumpOk}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Stop čerpání
              </button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="p-6">
        {/* Ovládací panel */}
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
          {/* Start / Pause */}
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
             isPaused ? 'Pokračovat' :
                        'Pozastavit'}
          </button>
        </div>

        {/* Graf */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-white p-2 rounded shadow border">
                        <p><b>Čas:</b> {p.time} min</p>
                        <p className="text-blue-600">
                          Plán: {p.plannedTemp?.toFixed(1)} °C
                        </p>
                        <p className="text-green-600">
                          Skutečná: {p.actualTemp?.toFixed(1) ?? '—'} °C
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="plannedTemp"
                stroke="#2196F3"
                strokeWidth={2}
                name="Plánovaná"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actualTemp"
                stroke="#4CAF50"
                strokeWidth={2}
                name="Skutečná"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
