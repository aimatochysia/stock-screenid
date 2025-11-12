import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const tabIcons = {
  'Overview': '📊',
  'Financial': '💰',
  'Technical': '📈'
};

export default function Tabs({ tabs = [], active, onChange }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex gap-2 border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-3 font-medium rounded-t-lg transition-all flex items-center gap-2
            ${active === t 
              ? `bg-gradient-to-r ${isDark ? 'from-blue-600 to-purple-600' : 'from-blue-500 to-purple-500'} text-white shadow-lg -mb-0.5 border-b-2 border-transparent` 
              : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
        >
          <span className="text-lg">{tabIcons[t] || '📄'}</span>
          <span>{t}</span>
        </button>
      ))}
    </div>
  );
}
