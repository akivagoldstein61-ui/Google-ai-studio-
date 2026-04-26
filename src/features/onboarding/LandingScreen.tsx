import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const LandingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-white p-6 relative">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-serif text-gray-900 leading-tight mb-4 tracking-tight">
            Kesher Private Taste Discovery
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            A serious-intent dating discovery prototype. Steer recommendations with explicit preferences, finite Daily Picks, broader Explore browsing, and a private editable Taste Profile.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-12"
        >
          <div className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-600">No public scoring or hot-or-not logic.</p>
          </div>
          <div className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-600">Private, transparent recommendations you control.</p>
          </div>
          <div className="flex items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-600">Built for dignity and intention.</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-medium flex items-center justify-center transition-colors shadow-sm"
        >
          <span>Enter Prototype</span>
          <ArrowRight size={18} className="ml-2" />
        </motion.button>
      </div>
      
      <div className="absolute top-0 left-0 w-full p-4 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};
