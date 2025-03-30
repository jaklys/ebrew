import React from 'react';

export function AlertDialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      {children}
    </div>
  );
}

export function AlertDialogContent({ children }) {
  return (
    <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function AlertDialogTitle({ children }) {
  return <h3 className="text-xl font-bold mb-2">{children}</h3>;
}

export function AlertDialogDescription({ children }) {
  return <p className="mb-4">{children}</p>;
}

export function AlertDialogFooter({ children, className }) {
  return <div className={`mt-2 ${className}`}>{children}</div>;
}

export function AlertDialogAction({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white rounded ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Tohle je důležité – „zrušit“ tlačítko
 */
export function AlertDialogCancel({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
    >
      {children}
    </button>
  );
}
