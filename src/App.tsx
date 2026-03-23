import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/ToastProvider';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FinanceLayout } from './pages/FinanceLayout';
import { Profile } from './pages/Profile';
import { Assets } from './pages/Assets';
import { Income } from './pages/Income';
import { Feedback } from './pages/Feedback';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Profile />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="finance" element={<FinanceLayout />}>
              <Route index element={<Navigate to="/finance/assets" replace />} />
              <Route path="assets" element={<Assets />} />
              <Route path="income" element={<Income />} />
            </Route>
            <Route path="profile" element={<Navigate to="/settings" replace />} />
            <Route path="assets" element={<Navigate to="/finance/assets" replace />} />
            <Route path="income" element={<Navigate to="/finance/income" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
