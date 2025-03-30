import React, { useState, useRef, useEffect } from 'react';
import { FileText, MoreVertical, Edit, Copy, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Card from './Card';

/**
 * Zobrazuje seznam chmelovar receptů (props.recipes).
 * Umožňuje:
 *  - onSelect(recipe) po kliku na recept
 *  - onCreateNew() po kliku na "Vytvořit nový"
 *  - onEdit(recipe, index), onDelete(index), onCopy(recipe)
 *  - onBack() => tlačítko zpět (volitelně)
 */
export default function ChmelovarSelector({
  recipes,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
  onCopy,
  onBack
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleMenu(index, e) {
    e.stopPropagation();
    setActiveMenu(activeMenu === index ? null : index);
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">

      {/* Pokud chcete šipku zpět nahoru, přidáme: */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 p-2 text-[#C7A324] hover:text-[#af9120]"
        >
          <ArrowLeft size={24}/>
          <span>Zpět</span>
        </button>
      )}

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Seznam chmelovar receptů</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="relative p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 flex justify-between items-center"
            >
              {/* Klik na recept => spustí onSelect(recipe) */}
              <button
                onClick={() => onSelect(recipe)}
                className="text-left flex-1"
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  <div>
                    <h3 className="font-semibold">{recipe.name}</h3>
                    {/* Např. zobrazíme počet kroků */}
                    <p className="text-sm text-gray-600">{recipe.steps.length} kroků</p>
                  </div>
                </div>
              </button>

              {/* Menu (3 tečky) - edit, copy, delete */}
              <button
                onClick={(e) => toggleMenu(index, e)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical size={20} />
              </button>

              {activeMenu === index && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border z-10"
                >
                  <div className="p-1">
                    <button
                      onClick={() => {
                        onEdit(recipe, index);
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-2 w-full p-2 text-left rounded hover:bg-gray-100"
                    >
                      <Edit size={16} />
                      <span>Editovat</span>
                    </button>
                    <button
                      onClick={() => {
                        onCopy(recipe);
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-2 w-full p-2 text-left rounded hover:bg-gray-100"
                    >
                      <Copy size={16} />
                      <span>Kopírovat</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete(index);
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-2 w-full p-2 text-left text-red-500 rounded hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      <span>Smazat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tlačítko "Vytvořit nový" */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg
                   hover:bg-blue-600 mx-auto"
        >
          <Plus size={20} />
          Vytvořit nový recept
        </button>
      </Card>
    </div>
  );
}
