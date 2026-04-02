/**
 * Phillips Data Stream Application
 * Full Production ERP with all modules functional
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import JobsPage from '@/pages/jobs/JobsPage';
import JobDetailPage from '@/pages/jobs/JobDetailPage';
import ClientsPage from '@/pages/customers/ClientsPage';
import PolicyHoldersPage from '@/pages/customers/PolicyHoldersPage';
import InvoicesPage from '@/pages/finance/InvoicesPage';
import ReceiptsPage from '@/pages/finance/ReceiptsPage';
import PurchaseInvoicesPage from '@/pages/finance/PurchaseInvoicesPage';
import EmployeesPage from '@/pages/workforce/EmployeesPage';
import TimesheetsPage from '@/pages/workforce/TimesheetsPage';
import LabourPage from '@/pages/workforce/LabourPage';
import PlannerPage from '@/pages/planner/PlannerPage';
import SuppliersPage from '@/pages/supplychain/SuppliersPage';
import SubcontractorsPage from '@/pages/supplychain/SubcontractorsPage';
import CISReturnsPage from '@/pages/finance/CISReturnsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useEntityStore } from '@/store/entityStore';
import { api } from '@/lib/api';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { activeCompany, activeCompanyType } = useEntityStore();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Initialize app and check for saved session
  useEffect(() => {
    const init = async () => {
      try {
        // Check if user has completed welcome before
        const saved = localStorage.getItem('phillips-welcome-completed');
        if (saved === 'true') {
          setHasCompletedWelcome(true);
        }
        
        // Test API connection
        await api.get('/health');
      } catch (error) {
        console.log('API not available, using mock data');
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  // Show entity switch notification when company changes
  useEffect(() => {
    if (hasCompletedWelcome) {
      toast.info(
        `Viewing ${activeCompany.shortName}`,
        { 
          description: `All data is now filtered for ${activeCompanyType === 'construction' ? 'Construction' : 'Environmental'} operations.`,
          duration: 3000 
        }
      );
    }
  }, [activeCompanyType, activeCompany, hasCompletedWelcome]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('phillips-welcome-completed', 'true');
    setHasCompletedWelcome(true);
    toast.success('Welcome to Phillips Data Stream!', {
      description: 'Your ERP system is ready.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-xl"
          style={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)' 
          }}
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity }
          }}
        />
      </div>
    );
  }

  if (!hasCompletedWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <MainLayout currentPath={location.pathname} onNavigate={handleNavigate}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname + activeCompanyType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Jobs Module */}
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            
            {/* Customers Module */}
            <Route path="/customers/clients" element={<ClientsPage />} />
            <Route path="/customers/policy-holders" element={<PolicyHoldersPage />} />
            
            {/* Finance Module */}
            <Route path="/finance/invoices" element={<InvoicesPage />} />
            <Route path="/finance/receipts" element={<ReceiptsPage />} />
            <Route path="/finance/purchase-invoices" element={<PurchaseInvoicesPage />} />
            <Route path="/finance/cis-returns" element={<CISReturnsPage />} />
            
            {/* Workforce Module */}
            <Route path="/workforce/employees" element={<EmployeesPage />} />
            <Route path="/workforce/timesheets" element={<TimesheetsPage />} />
            <Route path="/workforce/labour" element={<LabourPage />} />
            
            {/* Planner Module */}
            <Route path="/planner" element={<PlannerPage />} />
            
            {/* Supply Chain Module */}
            <Route path="/supply-chain/suppliers" element={<SuppliersPage />} />
            <Route path="/supply-chain/subcontractors" element={<SubcontractorsPage />} />
            
            {/* Reports & Settings */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}

// ============================================================================
// 404 PAGE
// ============================================================================

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-8xl font-bold mb-4"
        style={{ 
          background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        404
      </motion.div>
      <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
      <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-xl font-medium text-white transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)' 
        }}
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default App;
