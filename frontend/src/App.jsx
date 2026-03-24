import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RepoDetails from './pages/RepoDetails';
import ConflictResolver from './pages/ConflictResolver';
import Repositories from './pages/Repositories';
import Issues from './pages/Issues';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    // AnimatePresence enables exit animations when components are removed from the tree
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repo/:id" element={<RepoDetails />} />
          <Route path="/conflict" element={<ConflictResolver />} />
          <Route path="/repos" element={<Repositories />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
