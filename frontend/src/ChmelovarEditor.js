import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Save, Plus } from 'lucide-react';
import Card from './Card';

export default function ChmelovarEditor({
  onSave,
  onCancel,
  editRecipe = null,
  editIndex = null
}) {
  const [recipeName, setRecipeName] = useState('');
  const [steps, setSteps] = useState([]);

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
    setSteps([...steps, { duration: 10, evaporation: 4, addHop: false }]);
  }
  function removeStep(idx) {
    setSteps(steps.filter((_, i) => i !== idx));
  }
  function updateStep(idx, field, val) {
    const arr = [...steps];
    arr[idx][field] = field === 'addHop' ? val : Number(val);
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
          <ArrowLeft size={24}/>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold">
          {editRecipe ? 'Upravit Chmelovar' : 'Nový Chmelovar'}
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
          />
        </div>

        <div className="space-y-4 mb-6">
          {steps.map((step, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Krok {idx + 1}</span>
                <button
                  onClick={() => removeStep(idx)}
                  className="text-red-500"
                >
                  <Trash2 size={20}/>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Doba kroku (min)
                  </label>
                  <input
                    type="number"
                    value={step.duration}
                    onChange={(e) => updateStep(idx, 'duration', e.target.value)}
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Odpar (%)
                  </label>
                  <input
                    type="number"
                    value={step.evaporation}
                    onChange={(e) => updateStep(idx, 'evaporation', e.target.value)}
                    className="w-full p-2 border rounded"
                    min="4"
                    max="10"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Přidat chmel?
                  </label>
                  <input
                    type="checkbox"
                    checked={step.addHop}
                    onChange={(e) => updateStep(idx, 'addHop', e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addStep}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
                       flex items-center justify-center gap-2 hover:border-blue-500"
          >
            <Plus size={20}/>
            Přidat krok
          </button>
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
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            disabled={!recipeName}
          >
            <Save size={20}/>
            {editRecipe ? 'Uložit změny' : 'Uložit recept'}
          </button>
        </div>
      </Card>
    </div>
  );
}
