import React, { useState, useEffect } from 'react';

// Rmutování
import LandingScreen from './LandingScreen';
import MainMenu from './MainMenu';
import Rmutovani from './Rmutovani';          // zobrazí RecipeSelector
import RecipeEditor from './RecipeEditor';
import BrewingSimulation from './BrewingSimulation';

// Chmelovar
import ChmelovarSelector from './ChmelovarSelector';
import ChmelovarEditor from './ChmelovarEditor';
import ChmelovarSimulation from './ChmelovarSimulation';

export default function BrewingSystem() {
  const [view, setView] = useState('landing');

  // =========== STAVY: RMUT ===========
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // =========== STAVY: CHMELOVAR ===========
  const [chmelovarRecipes, setChmelovarRecipes] = useState([]);
  const [selectedChmelovar, setSelectedChmelovar] = useState(null);
  const [chmelovarEditing, setChmelovarEditing] = useState(null);
  const [chmelovarEditIndex, setChmelovarEditIndex] = useState(null);

  // =========== NAČTENÍ DAT Z BACKENDU ===========
  useEffect(() => {
    // 1) Načíst rmutovací recepty
    fetch("http://127.0.0.1:5000/api/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Chyba při načítání /api/recipes:", err));

    // 2) Načíst chmelovarové recepty
    fetch("http://127.0.0.1:5000/api/chmelovarRecipes")
      .then((res) => res.json())
      .then((data) => setChmelovarRecipes(data))
      .catch((err) => console.error("Chyba při načítání /api/chmelovarRecipes:", err));
  }, []);

  // =========== LANDING A MENU ===========
  function handleEnterApp() {
    setView('menu');
  }
  function handleGoRmutovani() {
    setView('rmutSelect');
  }
  function handleGoChmelovar() {
    setView('chmelovarSelect');
  }

  // =========== LOGIKA RMUT ===========
  // 1) Zobrazení seznamu (Rmutovani => RecipeSelector)
  function handleSelectRecipe(recipe) {
    setSelectedRecipe(recipe);
    setView('rmutSim');
  }
  function handleCreateNew() {
    setEditingRecipe(null);
    setEditingIndex(null);
    setView('rmutEdit');
  }
  function handleEditRecipe(recipe, index) {
    setEditingRecipe(recipe);
    setEditingIndex(index);
    setView('rmutEdit');
  }

  // Mazání receptu (poslat DELETE do backendu?):
  function handleDeleteRecipe(index) {
    // 1) Zjistit ID, pokud existuje, nebo poslat do backendu tělo
    // V ukázce jen lokálně:
    const newArr = recipes.filter((_, i) => i !== index);
    setRecipes(newArr);

    // (Volitelně) fetch(".../api/recipes/XYZ", { method: "DELETE" }) ...
  }

  function handleCopyRecipe(recipe) {
    // Tady buď pošlu fetch("POST /api/recipes"),
    // nebo udělám jen lokální kopii:
    const baseName = recipe.name.replace(/\s*copy\d*$/, '');
    const copies = recipes.filter(r => r.name.startsWith(baseName) && /\s*copy(\d+)$/.test(r.name));
    let copyNum = 1;
    if (copies.length > 0) {
      const nums = copies.map(r => {
        const m = r.name.match(/copy(\d+)$/);
        return m ? parseInt(m[1]) : 0;
      }).filter(n => !isNaN(n));
      if (nums.length>0) {
        copyNum = Math.max(...nums) + 1;
      }
    }
    const newRec = {
      ...recipe,
      name: `${baseName} copy${copyNum}`,
    };
    setRecipes([...recipes, newRec]);

    // fetch("POST /api/recipes", { body: JSON.stringify(newRec) }) ...
  }

  // 2) Uložení receptu => simulace
  function handleSaveRecipe(newRec, index) {
    if (index !== null) {
      // edit
      const arr = [...recipes];
      arr[index] = newRec;
      setRecipes(arr);
      // fetch("PUT /api/recipes", { ...})
    } else {
      // nový
      setRecipes([...recipes, newRec]);
      // fetch("POST /api/recipes", {...})
    }
    setSelectedRecipe(newRec);
    setView('rmutSim');
  }
  function handleCancelEdit() {
    setEditingRecipe(null);
    setEditingIndex(null);
    setView('rmutSelect');
  }

  // 3) Simulace
  function handleFinishSimulation() {
    setView('rmutSelect');
    setSelectedRecipe(null);
  }

  // =========== LOGIKA CHMELOVAR ===========
  // 1) Seznam => ChmelovarSelector
  function handleSelectChmelovar(recipe) {
    setSelectedChmelovar(recipe);
    setView('chmelovarSim');
  }
  function handleCreateChmelovar() {
    setChmelovarEditing(null);
    setChmelovarEditIndex(null);
    setView('chmelovarEdit');
  }
  function handleEditChmelovar(recipe, index) {
    setChmelovarEditing(recipe);
    setChmelovarEditIndex(index);
    setView('chmelovarEdit');
  }
  function handleDeleteChmelovar(index) {
    const newArr = chmelovarRecipes.filter((_, i) => i !== index);
    setChmelovarRecipes(newArr);
    // fetch DELETE ...
  }
  function handleCopyChmelovar(recipe) {
    const baseName = recipe.name.replace(/\s*copy\d*$/, '');
    const copies = chmelovarRecipes.filter(r =>
      r.name.startsWith(baseName) && /\s*copy(\d+)$/.test(r.name));
    let copyNum = 1;
    if (copies.length>0) {
      const nums = copies.map(r => {
        const m = r.name.match(/copy(\d+)$/);
        return m ? parseInt(m[1]) : 0;
      }).filter(n => !isNaN(n));
      if (nums.length>0) {
        copyNum = Math.max(...nums)+1;
      }
    }
    const newRec = {
      ...recipe,
      name: `${baseName} copy${copyNum}`
    };
    setChmelovarRecipes([...chmelovarRecipes, newRec]);
  }

  // 2) Uložení => simulace
  function handleSaveChmelovar(newRec, index) {
    if (index !== null) {
      const arr = [...chmelovarRecipes];
      arr[index] = newRec;
      setChmelovarRecipes(arr);
    } else {
      setChmelovarRecipes([...chmelovarRecipes, newRec]);
    }
    setSelectedChmelovar(newRec);
    setView('chmelovarSim');
  }
  function handleCancelChmelovar() {
    setChmelovarEditing(null);
    setChmelovarEditIndex(null);
    setView('chmelovarSelect');
  }

  // 3) Simulace
  function handleFinishChmelovarSim() {
    setSelectedChmelovar(null);
    setView('chmelovarSelect');
  }

  // =========== RENDER PODLE `view` ===========

  if (view==='landing') {
    return <LandingScreen onEnter={handleEnterApp} />;
  }
  if (view==='menu') {
    return (
      <MainMenu
        onGoRmutovani={handleGoRmutovani}
        onGoChmelovar={handleGoChmelovar}
      />
    );
  }

  // RMUT
  if (view==='rmutSelect') {
    return (
      <Rmutovani
        recipes={recipes}
        onSelect={handleSelectRecipe}
        onCreateNew={handleCreateNew}
        onEdit={handleEditRecipe}
        onDelete={handleDeleteRecipe}
        onCopy={handleCopyRecipe}
        onBack={() => setView('menu')}
      />
    );
  }
  if (view==='rmutEdit') {
    return (
      <RecipeEditor
        editRecipe={editingRecipe}
        editIndex={editingIndex}
        onSave={handleSaveRecipe}
        onCancel={handleCancelEdit}
      />
    );
  }
  if (view==='rmutSim' && selectedRecipe) {
    return (
      <BrewingSimulation
        recipe={selectedRecipe}
        onFinish={handleFinishSimulation}
      />
    );
  }

  // CHMELOVAR
  if (view==='chmelovarSelect') {
    return (
      <ChmelovarSelector
        recipes={chmelovarRecipes}
        onSelect={handleSelectChmelovar}
        onCreateNew={handleCreateChmelovar}
        onEdit={handleEditChmelovar}
        onDelete={handleDeleteChmelovar}
        onCopy={handleCopyChmelovar}
        onBack={() => setView('menu')}
      />
    );
  }
  if (view==='chmelovarEdit') {
    return (
      <ChmelovarEditor
        editRecipe={chmelovarEditing}
        editIndex={chmelovarEditIndex}
        onSave={handleSaveChmelovar}
        onCancel={handleCancelChmelovar}
      />
    );
  }
  if (view==='chmelovarSim' && selectedChmelovar) {
    return (
      <ChmelovarSimulation
        recipe={selectedChmelovar}
        onFinish={handleFinishChmelovarSim}
      />
    );
  }

  // Fallback
  return <div>Neznámé view: {view}</div>;
}
