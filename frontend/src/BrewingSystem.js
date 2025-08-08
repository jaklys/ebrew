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
import { BASE_URL, BASE_WS_URL } from './config';

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

  // 2) Load initial state and subscribe to websocket updates
  useEffect(() => {
    fetch(`${BASE_URL}/api/state`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data.recipes || []);
        setChmelovarRecipes(data.chmelovarRecipes || []);
      })
      .catch(err => console.error("Chyba state GET:", err));

    const ws = new WebSocket(`${BASE_WS_URL}/ws`);
    ws.onmessage = evt => {
      try {
        const data = JSON.parse(evt.data);
        setRecipes(data.recipes || []);
        setChmelovarRecipes(data.chmelovarRecipes || []);
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };
    return () => ws.close();
  }, []);

  function postState(newRecipes, newChmelovar) {
    fetch(`${BASE_URL}/api/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipes: newRecipes, chmelovarRecipes: newChmelovar })
    }).catch(err => console.error("Chyba state POST:", err));
  }

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
    const arr = recipes.filter((_, i) => i !== idx);
    setRecipes(arr);
    postState(arr, chmelovarRecipes);
  }

  function handleCopyRecipe(recipe) {
    const copiedRecipe = {
      ...recipe,
      name: `Kopie - ${recipe.name}`
    };
    const arr = [...recipes, copiedRecipe];
    setRecipes(arr);
    postState(arr, chmelovarRecipes);
  }

  function handleSaveRecipe(newRec, idx) {
    const arr = [...recipes];
    if (idx !== null) {
      arr[idx] = newRec;
    } else {
      arr.push(newRec);
    }
    setRecipes(arr);
    setSelectedRecipe(newRec);
    postState(arr, chmelovarRecipes);
    setView('rmutSim');
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
    const arr = chmelovarRecipes.filter((_, i) => i !== idx);
    setChmelovarRecipes(arr);
    postState(recipes, arr);
  }

  function handleCopyChmelovar(recipe) {
    const copiedRecipe = {
      ...recipe,
      name: `Kopie - ${recipe.name}`
    };
    const arr = [...chmelovarRecipes, copiedRecipe];
    setChmelovarRecipes(arr);
    postState(recipes, arr);
  }

  function handleSaveChmelovar(newRec, idx) {
    const arr = [...chmelovarRecipes];
    if (idx !== null) {
      arr[idx] = newRec;
    } else {
      arr.push(newRec);
    }
    setChmelovarRecipes(arr);
    setSelectedChmelovar(newRec);
    postState(recipes, arr);
    setView('chmelovarSim');
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
