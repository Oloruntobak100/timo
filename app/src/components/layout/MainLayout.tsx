/**
 * Main Layout Component
 * Wraps the entire application with header, sidebar, and content area
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { JourneyPanel } from '@/components/custom/GuidanceTooltip';
import { useEntityStore } from '@/store/entityStore';

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPath,
  onNavigate 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isTransitioning } = useEntityStore();
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(20, 184, 166, 0.05) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Header */}
      <Header 
        onMenuToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
      
      {/* Main Content */}
      <motion.main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? '260px' : '72px'
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>
      
      {/* Journey Panel */}
      <JourneyPanel />
      
      {/* Transition Overlay */}
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
};

export default MainLayout;
