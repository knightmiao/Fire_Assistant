import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/ToastProvider';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Assets } from './pages/Assets';
import { Income } from './pages/Income';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="assets" element={<Assets />} />
            <Route path="income" element={<Income />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
