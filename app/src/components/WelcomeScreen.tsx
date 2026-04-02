import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Leaf, ArrowRight } from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const { setActiveCompanyById } = useEntityStore();

  const handleSelectCompany = (companyId: number) => {
    setActiveCompanyById(companyId);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
            }}
          >
            <Building2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Phillips Data Stream</h1>
          <p className="text-slate-400">Select your company to continue</p>
        </div>

        {/* Company Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phillips Construction */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectCompany(1)}
            className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">Phillips Construction</h3>
              <p className="text-sm text-slate-400 mb-4">Building & Restoration Services</p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Phillips Barnes Environmental */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectCompany(2)}
            className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-all"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4">
                <Leaf className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">Phillips Barnes Environmental</h3>
              <p className="text-sm text-slate-400 mb-4">Environmental Services</p>
              <div className="flex items-center text-teal-400 text-sm font-medium">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-slate-500 text-sm mt-12"
        >
          Phillips Data Stream ERP System v1.0
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
