import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SpreadsheetPage from './SpreadsheetPage'; // This will contain current App.jsx logic

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sheet/:id" element={<SpreadsheetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;