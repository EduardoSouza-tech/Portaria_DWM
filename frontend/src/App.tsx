import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import './global-select.css';
import './theme.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Moradores from './pages/Moradores';
import Visitantes from './pages/Visitantes';
import Visitas from './pages/Visitas';
import Correspondencias from './pages/Correspondencias';
import PortariaDashboard from './pages/PortariaDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/portaria"
            element={isAuthenticated ? <PortariaDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/moradores"
            element={isAuthenticated ? <Moradores /> : <Navigate to="/login" />}
          />
          <Route
            path="/visitantes"
            element={isAuthenticated ? <Visitantes /> : <Navigate to="/login" />}
          />
          <Route
            path="/visitas"
            element={isAuthenticated ? <Visitas /> : <Navigate to="/login" />}
          />
          <Route
            path="/correspondencias"
            element={isAuthenticated ? <Correspondencias /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
