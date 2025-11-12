# Stock Screener Dashboard

A modern, feature-rich stock screening dashboard built with React, Vite, and TailwindCSS. Track market performance, analyze technical indicators, and export data for deeper analysis.

![Dashboard Preview](https://github.com/user-attachments/assets/ab64e650-5481-44ae-bfa7-e644113b8cd1)

## ✨ Features

### 🌓 Dark Mode
- Beautiful dark theme with smooth transitions
- Automatic system preference detection
- Persistent theme preference (saved in localStorage)
- Toggle between light and dark modes with a single click

### 📊 Interactive Dashboard
- **Overview Tab**: Quick glance at all stocks with sortable/filterable table
- **Financial Tab**: Deep dive into financial metrics (P/E, ROE, margins, debt)
- **Technical Tab**: Technical indicators (RSI, SMA, ATR, market stages)
- **Summary Cards**: Real-time stats for total stocks, gainers/losers, market cap, and RSI

### 🗺️ Visual Heatmap
- Color-coded stock performance visualization
- Size represents market cap, color represents price vs SMA50%
- Interactive tooltips with detailed stock information
- Responsive layout adapts to screen size

### ⬇️ CSV Export
- Download stock data with a single click
- Exports directly from API or uses cached data
- Date-stamped filenames for easy organization
- Includes all available metrics

### 🎨 Modern UI/UX
- Eye-catching landing page with feature highlights
- Smooth animations and transitions
- Responsive design for all screen sizes
- Custom scrollbar styling
- Professional gradient backgrounds

### 🚀 Performance
- 12-hour data caching for optimal performance
- Lazy loading and code splitting
- Optimized build size (218KB JS, 28KB CSS)
- Fast refresh during development

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Context API** - State management

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🎯 Usage

1. **Landing Page**: Click "Launch Dashboard" to enter the application
2. **Theme Toggle**: Click the sun/moon icon in the header to switch themes
3. **Navigation**: Use the tabs to switch between Overview, Financial, and Technical views
4. **Sorting**: Click any column header to sort (click again to reverse)
5. **Filtering**: Click the ⚲ icon next to column headers to filter data
6. **CSV Export**: Click the "CSV" button to download all stock data
7. **Heatmap**: View the visual heatmap in the Overview tab (toggle with "Hide Heatmap")

## 📊 Data Source

Data is fetched from:
- **Info API**: `https://stock-results.vercel.app/api/info`
- **Technical API**: `https://stock-results.vercel.app/api/technical/latest`

The app includes 12-hour caching and mock data fallback for offline development.

## 🎨 Features Showcase

### Light Mode
![Light Mode](https://github.com/user-attachments/assets/ab64e650-5481-44ae-bfa7-e644113b8cd1)

### Dark Mode
![Dark Mode](https://github.com/user-attachments/assets/6522bc5f-fffd-41b8-9b27-a3e036cde8e0)

### Landing Page
![Landing Page](https://github.com/user-attachments/assets/e7d2de87-03da-40a8-aaea-5defd2ef0af8)

## 🔧 Development

### Project Structure
```
src/
├── api/              # API integration and mock data
├── components/       # React components
│   ├── Dashboard.jsx
│   ├── LandingPage.jsx
│   ├── DataTable.jsx
│   ├── StockHeatmap.jsx
│   ├── SummaryCards.jsx
│   └── Tabs.jsx
├── contexts/         # React contexts
│   └── ThemeContext.jsx
├── hooks/            # Custom React hooks
│   └── useStockData.js
├── utils/            # Utility functions
│   └── csvExport.js
└── App.jsx           # Main app component
```

### Key Components

- **ThemeContext**: Manages dark/light mode state
- **LandingPage**: Entry point with feature showcase
- **Dashboard**: Main container with tabs and data
- **DataTable**: Sortable/filterable table with advanced features
- **StockHeatmap**: Visual representation of stock performance
- **SummaryCards**: Key metrics at a glance

## 🧪 Testing

All code passes:
- ✅ ESLint validation (zero errors)
- ✅ Production build
- ✅ CodeQL security scan (zero vulnerabilities)

## 📝 License

MIT

## 🙏 Acknowledgments

Built with React, Vite, and TailwindCSS
