import React, { useState, useEffect } from 'react';
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
      setSteps([...editRecipe.steps]);
    } else {
      setRecipeName('');
      setSteps([]);
    }
  }, [editRecipe]);

  function addStep() {
    if (steps.length < 10) {
      setSteps([...steps, { targetTemp: '', rampRate: '', holdTime: '' }]);
    }
  }

  function removeStep(index) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  function updateStep(index, field, value) {
    const arr = [...steps];
    arr[index][field] = Number(value);
    setSteps(arr);
  }

  function handleSave() {
    if (!recipeName) return;
    onSave({ name: recipeName, steps }, editIndex);
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onCancel}
          className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          {editRecipe ? 'Upravit Rmut Recept' : 'Nový Rmut Recept'}
        </h1>
      </div>

      <Card className="p-6 text-black">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Název receptu</label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Zadejte název receptu"
          />
        </div>

        <div className="space-y-4 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Krok {index + 1}</span>
                <button
                  onClick={() => removeStep(index)}
                  className="text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Cílová teplota (°C)</label>
                  <input
                    type="number"
                    value={step.targetTemp}
                    onChange={(e) => updateStep(index, 'targetTemp', e.target.value)}
                    className="w-full p-2 border rounded"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Ohřev (°C/min)</label>
                  <input
                    type="number"
                    value={step.rampRate}
                    onChange={(e) => updateStep(index, 'rampRate', e.target.value)}
                    className="w-full p-2 border rounded"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Výdrž (min)</label>
                  <input
                    type="number"
                    value={step.holdTime}
                    onChange={(e) => updateStep(index, 'holdTime', e.target.value)}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}

          {steps.length < 10 && (
            <button
              onClick={addStep}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
                         flex items-center justify-center gap-2 hover:border-blue-500"
            >
              <Plus size={20} />
              Přidat krok
            </button>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 border rounded hover:bg-gray-50 text-black"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white
                       rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            disabled={!recipeName}
          >
            <Save size={20} />
            {editRecipe ? 'Uložit změny' : 'Uložit recept'}
          </button>
        </div>
      </Card>
    </div>
  );
}
