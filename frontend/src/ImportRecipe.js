import React, { useState } from 'react';

export default function ImportRecipe({ token, onClose }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Přečteme JSON
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      try {
        const recipeObj = JSON.parse(text);
        // Odeslat do /api/importRecipe
        fetch("http://127.0.0.1:5000/api/importRecipe", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(recipeObj)
        })
        .then(res => {
          if (!res.ok) throw new Error("Import failed");
          return res.json();
        })
        .then(json => {
          console.log("Import ok:", json);
          setSuccess("Recept byl úspěšně importován!");
          setIsLoading(false);
          // Po 2 sekundách zavřeme modal
          setTimeout(() => {
            onClose();
          }, 2000);
        })
        .catch(err => {
          setError("Chyba při importu receptu!");
          setIsLoading(false);
        });
      } catch (parseErr) {
        setError("Neplatný JSON soubor!");
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl text-black w-full max-w-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Nahrát recept (JSON)</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Vyberte JSON soubor s receptem:</label>
        <input
          type="file"
          accept=".json"
          onChange={handleFile}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Prosím čekejte..." : "Zrušit"}
        </button>
      </div>
    </div>
  );
}