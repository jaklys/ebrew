import React from 'react';
import RecipeSelector from './RecipeSelector';
import { ArrowLeft } from 'lucide-react';

export default function Rmutovani({
  recipes,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
  onCopy,
  onBack,
}) {
  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#C7A324] p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-2 text-[#C7A324] hover:text-[#af9120] rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-3xl font-bold">
          Rmutování
        </h1>
      </div>

      <RecipeSelector
        recipes={recipes}
        onSelect={onSelect}
        onCreateNew={onCreateNew}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopy={onCopy}
      />
    </div>
  );
}
