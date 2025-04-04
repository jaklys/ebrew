import React, { useState, useEffect } from 'react';
import { PlayCircle, PauseCircle, ArrowLeft } from 'lucide-react';
import Card from './Card';
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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * Funkce pro vytvoření "plánované" křivky na základě steps
 */
function calculatePlannedCurve(recipe) {
  const data = [];
  let time = 0;
  let temp = 20;
  data.push({ time, plannedTemp: temp, actualTemp: null });

  recipe.steps.forEach(step => {
    if (step.isEndStep) return;  // endStep -> nepřidáváme
    const diff = step.targetTemp - temp;
    const rampTime = Math.abs(diff) / (step.rampRate || 1);

    // rampa
    for (let i = 0; i < rampTime; i++) {
      time++;
      temp += diff / rampTime;
      data.push({ time, plannedTemp: temp, actualTemp: null });
    }

    // holdTime
    for (let j=0; j<step.holdTime; j++) {
      time++;
      data.push({ time, plannedTemp: step.targetTemp, actualTemp: null });
    }
    temp = step.targetTemp;
  });
  return data;
}

/**
 * Funkce: spočítat "cílovou" teplotu v čase newT
 * pro rmut steps
 */
function getPlannedTempAtTime(recipe, newT) {
  let timeAcc = 0;
  let temp = 20;
  for (const step of recipe.steps) {
    if (step.isEndStep) break;
    const diff = step.targetTemp - temp;
    const rampTime = Math.abs(diff) / (step.rampRate || 1);

    if (newT < timeAcc + rampTime) {
      // Běží rampa
      const fraction = (newT - timeAcc) / rampTime;
      return temp + fraction * diff;
    }
    timeAcc += rampTime;
    temp = step.targetTemp;

    // Držení
    if (newT < timeAcc + step.holdTime) {
      return step.targetTemp;
    }
    timeAcc += step.holdTime;
  }
  return temp;
}

function getCurrentStepIndex(recipe, t) {
  let timeAcc = 0;
  let lastTemp = 20;
  for (let i=0; i<recipe.steps.length; i++) {
    const step = recipe.steps[i];
    if (step.isEndStep) return i;
    const diff = step.targetTemp - lastTemp;
    const rampTime = Math.abs(diff)/(step.rampRate || 1);
    const dur = rampTime + step.holdTime;
    if (t < timeAcc + dur) {
      return i;
    }
    timeAcc += dur;
    lastTemp = step.targetTemp;
  }
  // pak endStep
  const endI = recipe.steps.findIndex(s => s.isEndStep);
  return endI >=0 ? endI : -1;
}

export default function BrewingSimulation({ recipe, onFinish }) {
  const [time, setTime] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(20);
  const [graphData, setGraphData] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false); // jódovka
  const [showEndStepDialog, setShowEndStepDialog] = useState(false);

  const [donePauses, setDonePauses] = useState([]); // abychom jód. zkoušku neukazovali vícekrát

  // maxTime
  function getTotalTime() {
    let total = 0;
    let last = 20;
    for (const step of recipe.steps) {
      if (step.isEndStep) break;
      const diff = step.targetTemp - last;
      const ramp = Math.abs(diff)/(step.rampRate||1);
      total += ramp + step.holdTime;
      last = step.targetTemp;
    }
    return Math.floor(total);
  }
  const totalTime = getTotalTime();

  // 1) Při změně receptu => reset
  useEffect(() => {
    const initialData = calculatePlannedCurve(recipe);
    setGraphData(initialData);
    setTime(0);
    setCurrentTemp(20);
    setIsRunning(false);
    setIsPaused(false);
    setShowExitDialog(false);
    setShowPauseDialog(false);
    setShowEndStepDialog(false);
    setDonePauses([]);
  }, [recipe]);

  // 2) Simulace
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTime(prev => {
        const newT = prev + 1;
        if (newT > totalTime) {
          // končíme => endStep => zkusíme najít isEndStep
          const endI = recipe.steps.findIndex(s=> s.isEndStep);
          if (endI >=0) {
            setShowEndStepDialog(true);
          }
          setIsRunning(false);
          return prev;
        }
        const planned = getPlannedTempAtTime(recipe, newT);
        setCurrentTemp(old => {
          // posun max 2°C
          const diff = planned - old;
          const maxChange = 2;
          let used = diff;
          if (Math.abs(diff)> maxChange) {
            used = diff>0 ? maxChange : -maxChange;
          }
          const randomFactor = 0.85 + Math.random()*0.3;
          const newVal = old + used*randomFactor + (Math.random()-0.5)*0.5;

          // do grafu
          setGraphData(d => {
            if (d[newT]) {
              const clone = [...d];
              clone[newT] = {
                ...clone[newT],
                actualTemp: newVal
              };
              return clone;
            }
            return d;
          });
          return newVal;
        });

        // check manualPause
        const idx = getCurrentStepIndex(recipe, newT);
        if (idx>=0 && idx<recipe.steps.length) {
          const step = recipe.steps[idx];
          if (step.isEndStep) {
            setIsRunning(false);
            setShowEndStepDialog(true);
          }
          else if (step.manualPause && !donePauses.includes(idx)) {
            // jódovka
            setIsRunning(false);
            setShowPauseDialog(true);
          }
        }

        return newT;
      });
    }, 500); // 500ms = 1 "min"

    return () => clearInterval(interval);
  }, [isRunning, isPaused, donePauses, recipe, totalTime]);

  function toggleSimulation() {
    if (!isRunning) {
      // spustit
      if (time>= totalTime) {
        // re-run
        setTime(0);
        setCurrentTemp(20);
        setGraphData(calculatePlannedCurve(recipe));
      }
      setIsRunning(true);
    } else {
      setIsPaused(!isPaused);
    }
  }

  function handlePauseDialogContinue() {
    const idx = getCurrentStepIndex(recipe, time);
    setDonePauses([...donePauses, idx]);
    setShowPauseDialog(false);
    setIsRunning(true);
  }

  function handleEndOk() {
    setShowEndStepDialog(false);
    onFinish();
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      {/* exitDialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ukončit vaření?</AlertDialogTitle>
            <AlertDialogDescription>
              Proces je rozběhnutý. Opravdu ukončit?
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

      {/* jódová zkouška */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jódová zkouška</AlertDialogTitle>
            <AlertDialogDescription>
              Proveďte jódovou zkoušku a klikněte "Pokračovat".
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

      {/* endStep => Čerpat? */}
      <AlertDialog open={showEndStepDialog} onOpenChange={setShowEndStepDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konec (čerpaní)</AlertDialogTitle>
            <AlertDialogDescription>
              Hotovo? Nebo čerpej pivo dál?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleEndOk}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Konec
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center mb-4">
        <button
          onClick={() => {
            if (isRunning) setShowExitDialog(true);
            else onFinish();
          }}
          className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full"
        >
          <ArrowLeft size={24}/>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          Rmutování: {recipe.name}
        </h1>
      </div>

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
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="time"/>
              <YAxis domain={[0,100]}/>
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="plannedTemp"
                stroke="#2196F3"
                strokeWidth={2}
                name="Plánovaná"
                dot={{ r: 3, fill: "#2196F3" }}
              />
              <Line
                type="monotone"
                dataKey="actualTemp"
                stroke="#4CAF50"
                strokeWidth={2}
                name="Skutečná"
                dot={{ r: 3, fill: "#4CAF50" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}