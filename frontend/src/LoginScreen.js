import React, { useState } from 'react';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // Volání /api/login
    fetch("https://blissful-connection-production.up.railway.app/api/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(json => {
      // Mame token
      const token = json.token;
      // Pošleme do parent => setToken(token)
      onLoginSuccess(token);
    })
    .catch(err => {
      setError("Neplatné údaje!");
    });
  }

  return (
    <div className="h-screen bg-[#FFFBEF] text-[#C7A324] flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Přihlášení</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow text-black w-full max-w-sm">
        <div className="mb-4">
          <label className="block font-medium mb-1">Uživatel</label>
          <input
            className="border rounded w-full p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Heslo</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="secret"
          />
        </div>
        {error && <div className="text-red-500 mb-3">{error}</div>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Přihlásit
        </button>
      </form>
    </div>
  );
}
