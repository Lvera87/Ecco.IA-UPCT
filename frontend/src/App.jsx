import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './context/AppProviders';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import CampusDashboard from './pages/CampusDashboard.jsx';
import Register from './pages/Register.jsx';
import ResultsDashboard from './pages/ResultsDashboard.jsx';
import EnergyAnalysis from './pages/EnergyAnalysis.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EnergyManagement from './pages/EnergyManagement.jsx';
import CarbonFootprint from './pages/CarbonFootprint.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AllCampusesSummary from './pages/AllCampusesSummary.jsx';
import Layout from './components/Layout.jsx';
import InfrastructureConfig from './pages/InfrastructureConfig.jsx';
import InfrastructureAssistant from './pages/InfrastructureAssistant.jsx';

function App() {
  return (
    <AppProviders>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/infrastructure-config" element={<InfrastructureConfig />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/energy-management" element={<EnergyManagement />} />
            <Route path="/appliances" element={<EnergyManagement />} />
            <Route path="/financial-impact" element={<EnergyManagement />} />
            <Route path="/energy-analysis" element={<EnergyAnalysis />} />
            <Route path="/carbon-footprint" element={<CarbonFootprint />} />
            <Route path="/infrastructure-assistant" element={<InfrastructureAssistant />} />
            <Route path="/results-dashboard" element={<ResultsDashboard />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/sedes" element={<AllCampusesSummary />} />
            <Route path="/campus/:id" element={<CampusDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </AppProviders>
  );
}

export default App;

