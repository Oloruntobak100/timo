/**
 * Sidebar Component
 * Navigation sidebar with collapsible menu items
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  DollarSign, 
  Truck, 
  HardHat, 
  Calendar,
  ChevronRight,
  BarChart3,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useActiveCompany } from '@/store/entityStore';

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  children?: NavItem[];
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'jobs',
    label: 'Job Management',
    icon: Briefcase,
    href: '/jobs',
    badge: 8,
    children: [
      { id: 'jobs-all', label: 'All Jobs', icon: Briefcase, href: '/jobs' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/customers',
    children: [
      { id: 'clients', label: 'Clients', icon: Users, href: '/customers/clients' },
      { id: 'policy-holders', label: 'Policy Holders', icon: Users, href: '/customers/policy-holders' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    href: '/finance',
    children: [
      { id: 'invoices', label: 'Sales Invoices', icon: FileText, href: '/finance/invoices' },
      { id: 'receipts', label: 'Receipts', icon: DollarSign, href: '/finance/receipts' },
      { id: 'purchase-invoices', label: 'Purchase Invoices', icon: FileText, href: '/finance/purchase-invoices' },
      { id: 'cis-returns', label: 'CIS Returns', icon: FileText, href: '/finance/cis-returns' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce',
    icon: HardHat,
    href: '/workforce',
    children: [
      { id: 'employees', label: 'Employees', icon: Users, href: '/workforce/employees' },
      { id: 'timesheets', label: 'Timesheets', icon: Calendar, href: '/workforce/timesheets' },
      { id: 'labour', label: 'Labour', icon: HardHat, href: '/workforce/labour' },
    ],
  },
  {
    id: 'planner',
    label: 'Planner',
    icon: Calendar,
    href: '/planner',
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain',
    icon: Truck,
    href: '/supply-chain',
    children: [
      { id: 'suppliers', label: 'Suppliers', icon: Truck, href: '/supply-chain/suppliers' },
      { id: 'subcontractors', label: 'Subcontractors', icon: HardHat, href: '/supply-chain/subcontractors' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  isOpen: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPath, onNavigate }) => {
  const activeCompany = useActiveCompany();
  const [expandedItems, setExpandedItems] = useState<string[]>(['jobs']);
  
  const theme = activeCompany.theme;
  
  const toggleSubmenu = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };
  
  return (
    <motion.aside
      className="fixed left-0 top-16 bottom-0 z-30 overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(20px)'
      }}
      initial={{ width: 260 }}
      animate={{ width: isOpen ? 260 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full flex flex-col py-4">
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAVIGATION_ITEMS.map((item, index) => (
            <div key={item.id}>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => {
                  if (item.children) {
                    toggleSubmenu(item.id);
                  } else {
                    onNavigate(item.href);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                style={{
                  backgroundColor: isActive(item.href) 
                    ? `${theme.primary}20` 
                    : 'transparent',
                  border: isActive(item.href) 
                    ? `1px solid ${theme.primary}40` 
                    : '1px solid transparent'
                }}
                whileHover={{ x: isOpen ? 4 : 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex-shrink-0">
                  <item.icon 
                    className="w-5 h-5" 
                    style={{ color: isActive(item.href) ? theme.primary : undefined }}
                  />
                  {item.badge && (
                    <span 
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-medium flex items-center justify-center text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      className="text-sm font-medium flex-1 text-left"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isOpen && item.children && (
                  <motion.div
                    animate={{ rotate: expandedItems.includes(item.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>
              
              <AnimatePresence>
                {isOpen && item.children && expandedItems.includes(item.id) && (
                  <motion.div
                    className="ml-4 mt-1 space-y-1 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.children.map((child, childIndex) => (
                      <motion.button
                        key={child.id}
                        onClick={() => onNavigate(child.href)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive(child.href)
                            ? 'text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                        style={{
                          backgroundColor: isActive(child.href) 
                            ? `${theme.primary}15` 
                            : 'transparent'
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: childIndex * 0.05 }}
                      >
                        <div 
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive(child.href) 
                              ? '' 
                              : 'bg-slate-600'
                          }`}
                          style={{ 
                            backgroundColor: isActive(child.href) ? theme.primary : undefined 
                          }}
                        />
                        <span>{child.label}</span>
                        {isActive(child.href) && (
                          <ChevronRight 
                            className="w-3 h-3 ml-auto" 
                            style={{ color: theme.primary }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="px-4 pt-4 mt-4 border-t"
              style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: `${theme.primary}10`,
                  border: `1px solid ${theme.primary}20`
                }}
              >
                <p className="text-xs text-slate-400 mb-1">Current Entity</p>
                <p className="text-sm font-medium text-white">{activeCompany.shortName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-xs text-slate-400">Active</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
