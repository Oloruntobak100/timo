/**
 * Header Component
 * Top navigation bar with entity switcher, notifications, and user menu
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EntitySwitcher } from '@/components/custom/EntitySwitcher';
import { useActiveCompany } from '@/store/entityStore';
import { useGuidanceStore } from '@/store/guidanceStore';

// ============================================================================
// NOTIFICATIONS MOCK DATA
// ============================================================================

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Job N-001234 Completed',
    message: 'Field engineer marked visit as complete',
    time: '5 minutes ago',
    type: 'success',
    read: false,
  },
  {
    id: '2',
    title: 'CIS Verification Required',
    message: 'Subcontractor ABC Ltd needs verification',
    time: '1 hour ago',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: 'Invoice Overdue',
    message: 'Invoice INV-001 for £2,400 is 7 days overdue',
    time: '2 hours ago',
    type: 'error',
    read: true,
  },
  {
    id: '4',
    title: 'New Job Created',
    message: 'Job N-001235 has been created and allocated',
    time: '3 hours ago',
    type: 'info',
    read: true,
  },
];

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const activeCompany = useActiveCompany();
  const { toggleGuidance, guidanceEnabled } = useGuidanceStore();
  
  const theme = activeCompany.theme;
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;
  
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 h-16"
      style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onMenuToggle}
            className="p-2 rounded-xl transition-colors"
            style={{ 
              backgroundColor: isSidebarOpen 
                ? `${theme.primary}20` 
                : 'rgba(30, 41, 59, 0.5)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: theme.gradient,
                boxShadow: `0 0 20px ${theme.glow}` 
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-lg font-bold text-white">P</span>
            </motion.div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-white">Data Stream</h1>
              <p className="text-xs text-slate-400">Business Management System</p>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, clients, invoices..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-400 transition-all duration-200 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs rounded bg-slate-700 text-slate-400">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-xs rounded bg-slate-700 text-slate-400">K</kbd>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <EntitySwitcher />
          
          <motion.button
            onClick={toggleGuidance}
            className={`p-2 rounded-xl transition-all duration-200 ${
              guidanceEnabled 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-slate-800/50 text-slate-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={guidanceEnabled ? 'Guidance On' : 'Guidance Off'}
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="relative p-2 rounded-xl transition-colors"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-slate-300" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-medium text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(71, 85, 105, 0.5)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="text-white">Notifications</span>
                <span className="text-xs text-slate-400">{unreadCount} unread</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ backgroundColor: 'rgba(71, 85, 105, 0.3)' }} />
              <div className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                      />
                      <span className={`text-sm font-medium flex-1 ${
                        notification.read ? 'text-slate-400' : 'text-white'
                      }`}>
                        {notification.title}
                      </span>
                      <span className="text-xs text-slate-500">{notification.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-4">{notification.message}</p>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator style={{ backgroundColor: 'rgba(71, 85, 105, 0.3)' }} />
              <DropdownMenuItem className="justify-center text-sm text-slate-400 cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-colors"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: theme.gradient }}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">Sarah Johnson</p>
                  <p className="text-xs text-slate-400">Office Manager</p>
                </div>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(71, 85, 105, 0.5)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator style={{ backgroundColor: 'rgba(71, 85, 105, 0.3)' }} />
              <DropdownMenuItem className="text-slate-300 cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ backgroundColor: 'rgba(71, 85, 105, 0.3)' }} />
              <DropdownMenuItem className="text-red-400 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
