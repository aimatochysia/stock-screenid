import React from 'react';

const tabIcons = {
  'Overview': '📊',
  'Financial': '💰',
  'Technical': '📈',
  'Heatmap': '🗺️'
};

export default function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-2 border-b-2 border-gray-200">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-3 font-medium rounded-t-lg transition-all flex items-center gap-2
            ${active === t 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg -mb-0.5 border-b-2 border-transparent' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
          <span className="text-lg">{tabIcons[t] || '📄'}</span>
          <span>{t}</span>
        </button>
      ))}
    </div>
  );
}
