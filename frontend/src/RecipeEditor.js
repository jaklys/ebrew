import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Save, Plus } from 'lucide-react';
import Card from './Card';

export default function RecipeEditor({
  onSave,
  onCancel,
  editRecipe = null,
  editIndex = null,
}) {
  const [steps, setSteps] = useState([]);
  const [recipeName, setRecipeName] = useState('');

  useEffect(() => {
    if (editRecipe) {
      setRecipeName(editRecipe.name);
      // Zkopírujeme kroky a pokud chybí endStep, doplníme
      const hasEnd = editRecipe.steps.some(s => s.isEndStep);
      if (!hasEnd) {
        setSteps([...editRecipe.steps, endStepObject()]);
      } else {
        setSteps([...editRecipe.steps]);
      }
    } else {
      // nový => prázdné, ale endStep
      setRecipeName('');
      setSteps([ endStepObject() ]);
    }
  }, [editRecipe]);

  function endStepObject() {
    return {
      targetTemp: 0,
      rampRate: 0,
      holdTime: 0,
      manualPause: false,
      mixing: false,
      isEndStep: true
    };
  }

  const addStep = () => {
    const endIndex = steps.findIndex(s => s.isEndStep);
    if (endIndex < 0) {
      // fallback
      setSteps(prev => [...prev, endStepObject()]);
      return;
    }
    const newStep = {
      targetTemp: 50,
      rampRate: 1,
      holdTime: 10,
      manualPause: false,
      mixing: false,
      isEndStep: false,
    };
    const clone = [...steps];
    clone.splice(endIndex, 0, newStep);
    setSteps(clone);
  };

  const removeStep = (index) => {
    if (steps[index].isEndStep) {
      // nelze
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStepField = (idx, field, value) => {
    const arr = [...steps];
    arr[idx][field] = value;
    setSteps(arr);
  };

  const handleSave = () => {
    if (!recipeName) return;
    onSave({
      name: recipeName,
      steps,
    }, editIndex);
  };

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      <div className="flex items-center mb-4">
        <button onClick={onCancel} className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full">
          <ArrowLeft size={24}/>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          {editRecipe ? 'Upravit recept' : 'Nový recept'}
        </h1>
      </div>

      <Card className="p-6 text-black">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Název receptu
          </label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="space-y-4 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              {step.isEndStep ? (
                <div className="flex items-center justify-between">
                  <span className="text-xl font-medium">Konec (čerpání)</span>
                  <p className="text-sm text-gray-500">
                    Nelze odstranit
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Krok {index + 1}</span>
                    <button onClick={() => removeStep(index)} className="text-red-500">
                      <Trash2 size={20}/>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="flex flex-col">
                      <label className="block text-sm mb-1 text-gray-600">
                        Cílová teplota (°C)
                      </label>
                      <input
                        type="number"
                        value={step.targetTemp}
                        onChange={(e) => updateStepField(index, 'targetTemp', Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm mb-1 text-gray-600">
                        Ohřev (°C/min)
                      </label>
                      <input
                        type="number"
                        value={step.rampRate}
                        onChange={(e) => updateStepField(index, 'rampRate', Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm mb-1 text-gray-600">
                        Výdrž (min)
                      </label>
                      <input
                        type="number"
                        value={step.holdTime}
                        onChange={(e) => updateStepField(index, 'holdTime', Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={step.manualPause}
                        onChange={(e) => updateStepField(index, 'manualPause', e.target.checked)}
                      />
                      Jódová zkouška (pauza)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={step.mixing}
                        onChange={(e) => updateStepField(index, 'mixing', e.target.checked)}
                      />
                      Míchání
                    </label>
                  </div>
                </>
              )}
            </div>
          ))}

          <button
            onClick={addStep}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
                     flex items-center justify-center gap-2 hover:border-blue-500"
          >
            <Plus size={20} />
            Přidat krok
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={!recipeName}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white
                        ${recipeName ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'}`}
          >
            <Save size={20}/>
            {editRecipe ? 'Uložit změny' : 'Uložit recept'}
          </button>
        </div>
      </Card>
    </div>
  );
}
