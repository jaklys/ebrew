import React, { useEffect, useState } from 'react';

export default function LandingScreen({ onEnter }) {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const date = now.toLocaleDateString('cs-CZ', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      const time = now.toLocaleTimeString('cs-CZ', { hour12: false });
      setTimeString(`${date}\n${time}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FFFBEF]">
      <h1 className="text-5xl font-bold text-[#C7A324] mb-2">
        Pivní dílna
      </h1>
      <h2 className="text-xl text-[#C7A324] mb-8">e-Brew Assistant</h2>
      <div className="text-[#C7A324] text-xl whitespace-pre-line mb-8 text-center">
        {timeString}
      </div>
      <button 
        className="px-6 py-3 bg-[#C7A324] text-white rounded-lg hover:bg-[#af9120]"
        onClick={onEnter}
      >
        Vstoupit do aplikace
      </button>
    </div>
  );
}
