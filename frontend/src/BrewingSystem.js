import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import LandingScreen from './LandingScreen';
import MainMenu from './MainMenu';
import UniversalSelector from './UniversalSelector';
import RecipeEditor from './RecipeEditor';
import BrewingSimulation from './BrewingSimulation';
import ChmelovarEditor from './ChmelovarEditor';
import ChmelovarSimulation from './ChmelovarSimulation';
import ManualControl from './ManualControl';

export default function BrewingSystem() {
  // 1) VŠECHNY HOOKY NAPLOCHO

  // Autentizace
  const [token, setToken] = useState(null);

  // Které „view" chceme vykreslit
  const [view, setView] = useState('landing');

  // Rmut
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Chmelovar
  const [chmelovarRecipes, setChmelovarRecipes] = useState([]);
  const [selectedChmelovar, setSelectedChmelovar] = useState(null);
  const [chmelovarEditing, setChmelovarEditing] = useState(null);
  const [chmelovarEditIndex, setChmelovarEditIndex] = useState(null);

  // Pro fetch
  const BASE_URL = "https://blissful-connection-production.up.railway.app";

  // 2) useEffect – při startu stáhneme recepty (pokud jste přihlášeni?)
  //   Zde pro ukázku nestavíme token, ale klidně můžete chránit i GET tokenem
  useEffect(() => {
    // Rmut
    fetch(`${BASE_URL}/api/recipes`)
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(err => console.error("Chyba rmut GET:", err));

    // Chmelovar
    fetch(`${BASE_URL}/api/chmelovarRecipes`)
      .then(res => res.json())
      .then(data => setChmelovarRecipes(data))
      .catch(err => console.error("Chyba chmelovar GET:", err));
  }, []);

  // 3) Podmíněný render: pokud NEJSI přihlášen -> return <LoginScreen />
  if (!token) {
    return (
      <LoginScreen
        onLoginSuccess={(tok) => setToken(tok)}
      />
    );
  }

  // 4) Teď přepínáme `view` -> co zobrazit
  // LANDING
  if (view === 'landing') {
    return (
      <LandingScreen onEnter={() => setView('menu')} />
    );
  }

  // MENU
  if (view === 'menu') {
    return (
      <MainMenu
        onGoRmutovani={() => setView('rmutSelect')}
        onGoChmelovar={() => setView('chmelovarSelect')}
        onGoManualControl={() => setView('manualControl')}
        token={token}
      />
    );
  }

  // ========== MANUAL CONTROL ==========
  if (view === 'manualControl') {
    return (
      <ManualControl
        onBack={() => setView('menu')}
        token={token}
      />
    );
  }

  // ========== RMUT ==========

  // Seznam
  function handleSelectRecipe(recipe) {
    setSelectedRecipe(recipe);
    setView('rmutSim');
  }
  function handleCreateNew() {
    setEditingRecipe(null);
    setEditingIndex(null);
    setView('rmutEdit');
  }
  function handleEditRecipe(recipe, idx) {
    setEditingRecipe(recipe);
    setEditingIndex(idx);
    setView('rmutEdit');
  }
  function handleDeleteRecipe(idx) {
    // Voláme DELETE -> /api/recipes/:idx
    fetch(`${BASE_URL}/api/recipes/${idx}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(msg => {
      console.log("Delete rmut ok:", msg);
      setRecipes(recipes.filter((_, i)=> i!== idx));
    })
    .catch(err => console.error("Chyba mazani rmut:", err));
  }

  function handleCopyRecipe(recipe) {
    // Vytvoříme kopii receptu s novým názvem
    const copiedRecipe = {
      ...recipe,
      name: `Kopie - ${recipe.name}`
    };

    // POST => /api/recipes
    fetch(`${BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(copiedRecipe)
    })
    .then(res => res.json())
    .then(r => {
      console.log("Recipe copied:", r);
      setRecipes([...recipes, copiedRecipe]);
    })
    .catch(err => console.error("Error copying recipe:", err));
  }

  function handleSaveRecipe(newRec, idx) {
    if (idx!== null) {
      // PUT => /api/recipes/:idx
      fetch(`${BASE_URL}/api/recipes/${idx}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRec)
      })
      .then(res => res.json())
      .then(r=> {
        console.log("Edit rmut ok:", r);
        const arr = [...recipes];
        arr[idx] = newRec;
        setRecipes(arr);
        setSelectedRecipe(newRec);
        setView('rmutSim');
      })
      .catch(err => console.error("Chyba edit rmut:", err));
    } else {
      // POST => /api/recipes
      fetch(`${BASE_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRec)
      })
      .then(res => res.json())
      .then(r => {
        console.log("Create rmut ok:", r);
        setRecipes([...recipes, newRec]);
        setSelectedRecipe(newRec);
        setView('rmutSim');
      })
      .catch(err => console.error("Chyba create rmut:", err));
    }
  }
  function handleCancelEdit() {
    setEditingRecipe(null);
    setEditingIndex(null);
    setView('rmutSelect');
  }
  function handleFinishSimulation() {
    setView('rmutSelect');
  }

  // rmutSelect
  if (view === 'rmutSelect') {
    return (
      <UniversalSelector
        title="Seznam Rmut receptů"
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
  // rmutEdit
  if (view === 'rmutEdit') {
    return (
      <RecipeEditor
        editRecipe={editingRecipe}
        editIndex={editingIndex}
        onSave={handleSaveRecipe}
        onCancel={handleCancelEdit}
      />
    );
  }
  // rmutSim
  if (view === 'rmutSim' && selectedRecipe) {
    return (
      <BrewingSimulation
        recipe={selectedRecipe}
        onFinish={handleFinishSimulation}
      />
    );
  }

  // ========== CHMELOVAR ==========

  function handleSelectChmelovar(recipe) {
    setSelectedChmelovar(recipe);
    setView('chmelovarSim');
  }
  function handleCreateChmelovar() {
    setChmelovarEditing(null);
    setChmelovarEditIndex(null);
    setView('chmelovarEdit');
  }
  function handleEditChmelovar(recipe, idx) {
    setChmelovarEditing(recipe);
    setChmelovarEditIndex(idx);
    setView('chmelovarEdit');
  }
  function handleDeleteChmelovar(idx) {
    fetch(`${BASE_URL}/api/chmelovarRecipes/${idx}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(msg => {
      console.log("Delete chmelovar ok:", msg);
      setChmelovarRecipes(chmelovarRecipes.filter((_, i)=> i!== idx));
    })
    .catch(err => console.error("Chyba del chmelovar:", err));
  }

  function handleCopyChmelovar(recipe) {
    // Vytvoříme kopii chmelovar receptu s novým názvem
    const copiedRecipe = {
      ...recipe,
      name: `Kopie - ${recipe.name}`
    };

    // POST => /api/chmelovarRecipes
    fetch(`${BASE_URL}/api/chmelovarRecipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(copiedRecipe)
    })
    .then(res => res.json())
    .then(msg => {
      console.log("Chmelovar recipe copied:", msg);
      setChmelovarRecipes([...chmelovarRecipes, copiedRecipe]);
    })
    .catch(err => console.error("Error copying chmelovar recipe:", err));
  }

  function handleSaveChmelovar(newRec, idx) {
    if (idx!== null) {
      // PUT => /api/chmelovarRecipes/:idx
      fetch(`${BASE_URL}/api/chmelovarRecipes/${idx}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRec)
      })
      .then(res => res.json())
      .then(msg => {
        console.log("Edit chmelovar ok:", msg);
        const arr = [...chmelovarRecipes];
        arr[idx] = newRec;
        setChmelovarRecipes(arr);
        setSelectedChmelovar(newRec);
        setView('chmelovarSim');
      })
      .catch(err => console.error("Chyba edit chmel:", err));
    } else {
      // POST => /api/chmelovarRecipes
      fetch(`${BASE_URL}/api/chmelovarRecipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRec)
      })
      .then(res => res.json())
      .then(msg => {
        console.log("Create chmelovar ok:", msg);
        setChmelovarRecipes([...chmelovarRecipes, newRec]);
        setSelectedChmelovar(newRec);
        setView('chmelovarSim');
      })
      .catch(err => console.error("Chyba create chmelovar:", err));
    }
  }
  function handleCancelChmelovar() {
    setChmelovarEditing(null);
    setChmelovarEditIndex(null);
    setView('chmelovarSelect');
  }
  function handleFinishChmelovarSim() {
    setView('chmelovarSelect');
  }

  if (view === 'chmelovarSelect') {
    return (
      <UniversalSelector
        title="Seznam Chmelovar receptů"
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
  if (view === 'chmelovarEdit') {
    return (
      <ChmelovarEditor
        editRecipe={chmelovarEditing}
        editIndex={chmelovarEditIndex}
        onSave={handleSaveChmelovar}
        onCancel={handleCancelChmelovar}
      />
    );
  }
  if (view === 'chmelovarSim' && selectedChmelovar) {
    return (
      <ChmelovarSimulation
        recipe={selectedChmelovar}
        onFinish={handleFinishChmelovarSim}
      />
    );
  }

  return <div>Neznámé view: {view}</div>;
}