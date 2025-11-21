import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} transition-colors duration-300`}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center animate-fade-in">
          {/* Main Title */}
          <h1 className={`text-6xl md:text-7xl font-bold mb-6 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'}`}>
            Stock Screener
          </h1>
          <h2 className={`text-3xl md:text-4xl font-semibold mb-8 ${isDark ? 'text-blue-300' : 'text-gray-700'}`}>
            Dashboard
          </h2>
          
          {/* Subtitle */}
          <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Real-time market insights with advanced analytics, comprehensive technical indicators, and intuitive visualizations
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`group relative px-10 py-5 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }`}
          >
            <span className="relative z-10">Launch Dashboard</span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 animate-slide-up">
          <FeatureCard
            icon="📊"
            title="Real-Time Data"
            description="Live stock data with 12-hour intelligent caching for optimal performance"
            isDark={isDark}
          />
          <FeatureCard
            icon="🎯"
            title="Advanced Filtering"
            description="Powerful sorting and filtering across multiple data dimensions"
            isDark={isDark}
          />
          <FeatureCard
            icon="📈"
            title="Technical Analysis"
            description="Comprehensive technical indicators including RSI, SMA, ATR, and more"
            isDark={isDark}
          />
          <FeatureCard
            icon="💰"
            title="Financial Metrics"
            description="Deep dive into company financials with P/E ratios, ROE, margins, and debt analysis"
            isDark={isDark}
          />
          <FeatureCard
            icon="🗺️"
            title="Visual Heatmap"
            description="Intuitive heatmap visualization showing market performance at a glance"
            isDark={isDark}
          />
          <FeatureCard
            icon="⬇️"
            title="Export Data"
            description="Download your filtered data in CSV format for further analysis"
            isDark={isDark}
          />
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid md:grid-cols-4 gap-6 animate-slide-up">
          <StatCard value="50+" label="Stocks Tracked" isDark={isDark} />
          <StatCard value="15+" label="Technical Indicators" isDark={isDark} />
          <StatCard value="12h" label="Cache Duration" isDark={isDark} />
          <StatCard value="100%" label="Real-Time" isDark={isDark} />
        </div>
      </div>

      {/* Footer */}
      <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="text-sm">Built with React, Vite, and TailwindCSS</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, isDark }) {
  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
      isDark 
        ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' 
        : 'bg-white shadow-lg'
    }`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
        {description}
      </p>
    </div>
  );
}

function StatCard({ value, label, isDark }) {
  return (
    <div className={`p-6 rounded-xl text-center transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-gray-700' 
        : 'bg-white shadow-lg'
    }`}>
      <div className={`text-4xl font-bold mb-2 ${
        isDark ? 'text-blue-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
      }`}>
        {value}
      </div>
      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
}
