import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Save, Plus } from 'lucide-react';
import Card from './Card';

/**
 * ChmelovarEditor
 * - Má pole "name" (název receptu).
 * - Kroky: duration (min), evaporation (4–10 %), addHop (bool).
 * - Pokud `editRecipe` je vyplněn, načteme je do stavu (včetně `name`).
 * - onSave({name, steps}, editIndex) => volá parent pro uložení.
 * - onCancel() => zrušení => typicky zpět do seznamu (ChmelovarSelector).
 */
export default function ChmelovarEditor({
  onSave,
  onCancel,
  editRecipe = null,
  editIndex = null
}) {
  // Název receptu
  const [recipeName, setRecipeName] = useState('');
  // Pole kroků
  const [steps, setSteps] = useState([]);

  // Pokud se jedná o editaci existujícího receptu, načteme do stavu
  useEffect(() => {
    if (editRecipe) {
      setRecipeName(editRecipe.name || '');
      setSteps([...editRecipe.steps]);
    } else {
      setRecipeName('');
      setSteps([]);
    }
  }, [editRecipe]);

  // Přidat krok
  const addStep = () => {
    setSteps(prev => [
      ...prev,
      { duration: 10, evaporation: 4, addHop: false }
    ]);
  };

  // Odebrat krok
  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Upravit pole
  const updateStep = (index, field, value) => {
    const clone = [...steps];
    clone[index][field] = value;
    setSteps(clone);
  };

  // Uložit
  const handleSave = () => {
    if (!recipeName) {
      alert("Zadejte název receptu.");
      return;
    }
    if (steps.length === 0) {
      alert("Musí být aspoň 1 krok pro chmelovar.");
      return;
    }
    // Vrátíme objekt: { name, steps }
    onSave({
      name: recipeName,
      steps
    }, editIndex);
  };

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      {/* Horní lišta */}
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
        {/* NÁZEV RECEPTU */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Název receptu (chmelovar)
          </label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Např. IPA Chmelovar"
          />
        </div>

        {/* KROKY */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Krok {index + 1}</span>
                <button
                  onClick={() => removeStep(index)}
                  className="text-red-500"
                >
                  <Trash2 size={20}/>
                </button>
              </div>

              {/* Doba kroku */}
              <label className="block mb-1 text-sm text-gray-600">
                Doba kroku (min)
              </label>
              <input
                type="number"
                value={step.duration}
                onChange={(e) => updateStep(index, 'duration', Number(e.target.value))}
                className="w-full p-2 border rounded mb-3"
                min={1}
                max={120}
              />

              {/* Odpar vody (%) */}
              <label className="block mb-1 text-sm text-gray-600">
                Odpar vody (4–10 %)
              </label>
              <input
                type="number"
                value={step.evaporation}
                onChange={(e) => updateStep(index, 'evaporation', Number(e.target.value))}
                className="w-full p-2 border rounded mb-3"
                min={4}
                max={10}
              />

              {/* Checkbox addHop */}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={step.addHop}
                  onChange={(e) => updateStep(index, 'addHop', e.target.checked)}
                />
                Přidat chmel v tomto kroku
              </label>
            </div>
          ))}

          {/* Tlačítko "Přidat krok" */}
          <button
            onClick={addStep}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
                     flex items-center justify-center gap-2 hover:border-blue-500"
          >
            <Plus size={20}/>
            Přidat krok
          </button>
        </div>

        {/* Tlačítka dole */}
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
          >
            <Save size={20}/>
            {editRecipe ? 'Uložit změny' : 'Uložit recept'}
          </button>
        </div>
      </Card>
    </div>
  );
}
