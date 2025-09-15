import React from 'react';

export default function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-2 border-b pb-2">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-t-lg transition 
            ${active === t ? 'bg-white shadow text-black' : 'text-gray-600 hover:text-black'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
