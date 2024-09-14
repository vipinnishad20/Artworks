// src/App.tsx
import React from 'react';
import ArtworksTable from './ArtworksTable';
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme
import 'primereact/resources/primereact.min.css';          // Core styles
import 'primeicons/primeicons.css';                        // Icons
import './App.css';                                        // Your custom styles

const App: React.FC = () => {
  return (
    <div className="App">
      <ArtworksTable />
    </div>
  );
};

export default App;
