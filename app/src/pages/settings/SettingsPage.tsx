import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Palette,
  Save,
  CheckCircle2,
  Globe,
  Clock,
  FileText,
  Users,
  Database,
  Key,
  Smartphone,
} from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { toast } from 'sonner';

interface CompanySettings {
  name: string;
  registrationNumber: string;
  vatNumber: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    postcode: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;
}

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  jobUpdates: boolean;
  invoiceReminders: boolean;
  cisReminders: boolean;
  weeklyReports: boolean;
  mentions: boolean;
}

const SettingsPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [activeTab, setActiveTab] = useState<'company' | 'user' | 'notifications' | 'integrations'>('company');
  const [isSaving, setIsSaving] = useState(false);

  const accentColor = activeCompany.id === 1 ? '#3B82F6' : '#14B8A6';

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: activeCompany.id === 1 ? 'Phillips Construction' : 'Phillips Barnes Environmental',
    registrationNumber: '12345678',
    vatNumber: 'GB123456789',
    address: {
      line1: '123 Construction Way',
      line2: 'Industrial Estate',
      city: 'Taunton',
      postcode: 'TA1 1AA',
      country: 'United Kingdom',
    },
    phone: '01823 123456',
    email: 'info@phillips.co.uk',
    website: 'www.phillips.co.uk',
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: 'Admin User',
    email: 'admin@phillips.co.uk',
    phone: '07700 900000',
    role: 'Administrator',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    currency: 'GBP',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    jobUpdates: true,
    invoiceReminders: true,
    cisReminders: true,
    weeklyReports: false,
    mentions: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'user', label: 'User Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  const timezones = [
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Dubai',
    'Asia/Singapore',
    'Australia/Sydney',
  ];

  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  const currencies = ['GBP (£)', 'USD ($)', 'EUR (€)', 'AUD ($)'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your application preferences and company details</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-700/50 text-white border-l-2'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
                style={activeTab === tab.id ? { borderLeftColor: accentColor } : {}}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-3">Current Entity</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Building2 className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{activeCompany.name}</p>
                <p className="text-xs text-slate-400">{activeCompany.id === 1 ? 'Construction' : 'Environmental'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Company Settings */}
          {activeTab === 'company' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: accentColor }} />
                Company Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Registration Number</label>
                  <input
                    type="text"
                    value={companySettings.registrationNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">VAT Number</label>
                  <input
                    type="text"
                    value={companySettings.vatNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, vatNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Website</label>
                  <input
                    type="text"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Phone</label>
                    <input
                      type="tel"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Email</label>
                    <input
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-300">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={companySettings.address.line1}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          address: { ...companySettings.address, line1: e.target.value },
                        })
                      }
                      placeholder="Address Line 1"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={companySettings.address.line2}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          address: { ...companySettings.address, line2: e.target.value },
                        })
                      }
                      placeholder="Address Line 2"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={companySettings.address.city}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          address: { ...companySettings.address, city: e.target.value },
                        })
                      }
                      placeholder="City"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={companySettings.address.postcode}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          address: { ...companySettings.address, postcode: e.target.value },
                        })
                      }
                      placeholder="Postcode"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* User Settings */}
          {activeTab === 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: accentColor }} />
                User Profile
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                  {userSettings.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{userSettings.name}</p>
                  <p className="text-sm text-slate-400">{userSettings.role}</p>
                  <button className="mt-2 text-sm" style={{ color: accentColor }}>
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={userSettings.name}
                    onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone</label>
                  <input
                    type="tel"
                    value={userSettings.phone}
                    onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Role</label>
                  <select
                    value={userSettings.role}
                    onChange={(e) => setUserSettings({ ...userSettings, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="User">User</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Timezone</label>
                    <select
                      value={userSettings.timezone}
                      onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Date Format</label>
                    <select
                      value={userSettings.dateFormat}
                      onChange={(e) => setUserSettings({ ...userSettings, dateFormat: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {dateFormats.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Currency</label>
                    <select
                      value={userSettings.currency}
                      onChange={(e) => setUserSettings({ ...userSettings, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      {currencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: accentColor }} />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'jobUpdates', label: 'Job Updates', description: 'Get notified when jobs are updated or completed' },
                  { key: 'invoiceReminders', label: 'Invoice Reminders', description: 'Reminders for overdue invoices' },
                  { key: 'cisReminders', label: 'CIS Reminders', description: 'Monthly CIS return deadline reminders' },
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly summary reports' },
                  { key: 'mentions', label: 'Mentions', description: 'Get notified when you are mentioned in comments' },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-slate-400">{setting.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          [setting.key]: !notificationSettings[setting.key as keyof NotificationSettings],
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notificationSettings[setting.key as keyof NotificationSettings]
                          ? ''
                          : 'bg-slate-700'
                      }`}
                      style={{
                        backgroundColor: notificationSettings[setting.key as keyof NotificationSettings]
                          ? accentColor
                          : undefined,
                      }}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          notificationSettings[setting.key as keyof NotificationSettings]
                            ? 'translate-x-7'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5" style={{ color: accentColor }} />
                Integrations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Xero Accounting',
                    description: 'Sync invoices and financial data',
                    icon: FileText,
                    connected: true,
                    color: '#13B5EA',
                  },
                  {
                    name: 'QuickBooks',
                    description: 'Accounting integration',
                    icon: CreditCard,
                    connected: false,
                    color: '#2CA01C',
                  },
                  {
                    name: 'HMRC MTD',
                    description: 'Making Tax Digital for VAT',
                    icon: Shield,
                    connected: true,
                    color: '#28A197',
                  },
                  {
                    name: 'Google Calendar',
                    description: 'Sync planner events',
                    icon: Clock,
                    connected: false,
                    color: '#4285F4',
                  },
                  {
                    name: 'Slack',
                    description: 'Team notifications',
                    icon: Users,
                    connected: false,
                    color: '#4A154B',
                  },
                  {
                    name: 'Dropbox',
                    description: 'Document storage',
                    icon: Database,
                    connected: true,
                    color: '#0061FF',
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${integration.color}20` }}
                    >
                      <integration.icon className="w-6 h-6" style={{ color: integration.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-slate-400">{integration.description}</p>
                    </div>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        integration.connected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {integration.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700/50 pt-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4">API Access</h3>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Key className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">API Key</p>
                        <p className="text-xs text-slate-400">Manage API access for integrations</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm">
                      Manage Keys
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
