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
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

/**
 * Spočítá "plán" pro chmelovar –
 * Tady například neděláme rampy, ale jen "plánovanou" teplotu 65..95 podle "evaporation"
 */
function computeTemp(evap) {
  // 4 => ~65°C, 10 => ~95°C => lineárně
  return 65 + (evap - 4) * 5;
}

function calculatePlanChmel(recipe) {
  const data = [];
  const stepMarkers = [];
  let t = 0;
  let temp = 65;

  // Počáteční bod
  data.push({
    time: t,
    plannedTemp: temp,
    actualTemp: null,
    isStepPoint: true,
    stepLabel: "Start"
  });

  let accumulatedTime = 0;

  recipe.steps.forEach((step, index) => {
    // Značka pro začátek kroku
    stepMarkers.push({
      time: accumulatedTime,
      label: `Krok ${index+1}`
    });

    for (let i = 0; i < step.duration; i++) {
      t++;
      temp = computeTemp(step.evaporation || 4);
      const isLastMinute = i === step.duration - 1;
      data.push({
        time: t,
        plannedTemp: temp,
        actualTemp: null,
        isStepPoint: isLastMinute, // Označíme poslední minutu kroku
        stepLabel: isLastMinute ? `Konec kroku ${index+1}` : undefined
      });
    }

    accumulatedTime += step.duration;
  });

  return { data, stepMarkers };
}

function getTotalTime(recipe) {
  return recipe.steps.reduce((acc, s) => acc + (s.duration||0), 0);
}

function getStepIndex(recipe, time) {
  let acc = 0;
  for (let i = 0; i < recipe.steps.length; i++) {
    const d = recipe.steps[i].duration || 0;
    if (time < acc + d) {
      return i;
    }
    acc += d;
  }
  return recipe.steps.length - 1;
}

export default function ChmelovarSimulation({ recipe, onFinish }) {
  const [time, setTime] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(0); // Začínáme od nuly
  const [graphData, setGraphData] = useState([]);
  const [stepMarkers, setStepMarkers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showAddHopDialog, setShowAddHopDialog] = useState(false);

  const [doneHop, setDoneHop] = useState([]);

  // Konstanta pro rychlejší nárůst teploty - vyšší = rychlejší
  const TEMP_RISE_FACTOR = 6; // Zvýšeno pro agresivnější nárůst

  const totalTime = getTotalTime(recipe);

  // reset on recipe change
  useEffect(() => {
    const { data, stepMarkers } = calculatePlanChmel(recipe);
    if (data.length > 0) {
      data[0].actualTemp = null;
    }
    setGraphData(data);
    setStepMarkers(stepMarkers);
    setTime(0);
    setCurrentTemp(0);
    setIsRunning(false);
    setIsPaused(false);
    setShowExitDialog(false);
    setShowAddHopDialog(false);
    setDoneHop([]);
  }, [recipe]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTime(prev => {
        const newT = prev + 1;
        if (newT > totalTime) {
          setIsRunning(false);
          return prev;
        }
        // get step
        const si = getStepIndex(recipe, newT);
        const st = recipe.steps[si];
        const planned = computeTemp(st.evaporation || 4);

        // posun actual temp - UPRAVENO pro agresivnější nárůst teploty
        setCurrentTemp(old => {
          // Speciální případ pro první bod - začínáme od nuly
          if (prev === 0) {
            const initialTemp = 0;

            setGraphData(d => {
              const copy = [...d];
              if (copy[newT]) {
                copy[newT] = {
                  ...copy[newT],
                  actualTemp: initialTemp
                };
              }
              return copy;
            });

            return initialTemp;
          }

          // Agresivnější nárůst v prvních 15 minutách
          let newVal;

          if (newT <= 15) {
            // V prvních 15 minutách rychlejší nárůst
            // Lineární interpolace: 0 -> plannedTemp během 15 minut
            newVal = (planned * newT) / 15;

            // Přidání malého náhodného kolísání pro realističtější průběh
            newVal = newVal + (Math.random() - 0.5);
          } else {
            // Po 15 minutách normální simulace s menšími změnami
            const diff = planned - old;
            const maxChange = TEMP_RISE_FACTOR; // Zvýšená rychlost náběhu

            let used = diff;
            if (Math.abs(diff) > maxChange) {
              used = diff > 0 ? maxChange : -maxChange;
            }

            const randomFactor = 0.9 + Math.random() * 0.2;
            const randomNoise = (Math.random() - 0.5) * 0.5;

            newVal = old + used * randomFactor + randomNoise;
          }

          // Aktualizace grafu
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

        // addHop => popup?
        if (st.addHop && !doneHop.includes(si)) {
          // ukážeme popUp jednou
          if ((newT - recipe.steps.slice(0, si).reduce((a, b) => a + (b.duration || 0), 0)) === 1) {
            // => 1. minuta toho kroku
            setIsRunning(false);
            setShowAddHopDialog(true);
          }
        }

        return newT;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, doneHop, recipe, totalTime]);

  function toggleSimulation() {
    if (!isRunning) {
      if (time >= totalTime) {
        // re-run
        setTime(0);
        setCurrentTemp(0);
        const { data, stepMarkers } = calculatePlanChmel(recipe);
        setGraphData(data);
        setStepMarkers(stepMarkers);
      }
      setIsRunning(true);
    } else {
      setIsPaused(!isPaused);
    }
  }

  function handleAddHopContinue() {
    const si = getStepIndex(recipe, time);
    setDoneHop(prev => [...prev, si]);
    setShowAddHopDialog(false);
    setIsRunning(true);
  }

  // Vlastní tooltip pro body
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      if (data.isStepPoint && data.stepLabel) {
        return (
          <div className="bg-white p-2 border rounded shadow-md">
            <p className="font-bold">{data.stepLabel}</p>
            <p>Čas: {label} min</p>
            <p>Teplota: {payload[0].value?.toFixed(1) || '---'}°C</p>
          </div>
        );
      }

      return (
        <div className="bg-white p-2 border rounded shadow-md">
          <p>Čas: {label} min</p>
          {payload.map((p, i) => (
            <p key={i}>{p.name}: {p.value?.toFixed(1) || '---'}°C</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
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

      <AlertDialog open={showAddHopDialog} onOpenChange={setShowAddHopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Přidat chmel</AlertDialogTitle>
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
          Chmelovar: {recipe.name}
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Svislé čáry označující hranice kroků */}
              {stepMarkers.map((marker, index) => (
                <ReferenceLine
                  key={index}
                  x={marker.time}
                  stroke="#FF9800"
                  strokeDasharray="3 3"
                  label={{
                    value: marker.label,
                    position: 'top',
                    fill: '#FF9800',
                    fontSize: 12
                  }}
                />
              ))}

              <Line
  type="monotone"
  dataKey="plannedTemp"
  stroke="#2196F3"
  strokeWidth={2}
  name="Plánovaná"
  dot={(props) => {
    const { cx, cy, payload } = props;
    // Zobrazit body pouze pro body označující kroky, bez ohledu na stav simulace
    if (payload && payload.isStepPoint) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#2196F3"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null;
  }}
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