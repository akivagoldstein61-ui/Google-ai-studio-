import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, FileText } from 'lucide-react';
import { signalPolicy } from '../../services/signalPolicy';

export const AITrustHubScreen = () => {
  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="bg-white px-6 py-8 border-b border-gray-100">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
          <ShieldAlert size={24} />
        </div>
        <h1 className="text-3xl font-serif text-gray-900 mb-2 tracking-tight">AI & Trust Hub</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Kesher is built on transparency. We want you to know exactly how your discovery experience is steered and what boundaries we enforce.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <section className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-50 flex items-center">
            <CheckCircle size={18} className="text-green-600 mr-2" />
            Allowed Signals
          </h2>
          <ul className="space-y-3">
            {signalPolicy.allowedSignals.map((signal, idx) => (
              <li key={idx} className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">{signal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-50 flex items-center">
            <XCircle size={18} className="text-red-500 mr-2" />
            Banned Signals
          </h2>
          <p className="text-xs text-gray-500 mb-3">We never use these to steer your matches.</p>
          <ul className="space-y-3">
            {signalPolicy.bannedSignals.map((signal, idx) => (
              <li key={idx} className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">{signal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
            <FileText size={18} className="text-blue-600 mr-2" />
            Prototype Disclaimer
          </h2>
          <p className="text-sm text-blue-800/80 leading-relaxed">
            This is a functional prototype. It uses mock candidate data and deterministic rules to demonstrate the Kesher paradigm. Real ML pipelines would replace the deterministic ranking layer, while still respecting the exact same data boundaries.
          </p>
        </section>
      </div>
    </div>
  );
};
