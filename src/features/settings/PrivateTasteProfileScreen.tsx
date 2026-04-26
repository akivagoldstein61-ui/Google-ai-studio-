import React, { useState, useEffect } from 'react';
import { TastePattern } from '../../types';
import { tasteProfileService } from '../../services/tasteProfileService';
import { Lock, Edit2, Trash2, PauseCircle, Download, RotateCcw, AlertTriangle, EyeOff } from 'lucide-react';

export const PrivateTasteProfileScreen = () => {
  const [patterns, setPatterns] = useState<TastePattern[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    const data = await tasteProfileService.getTasteProfile();
    setPatterns(data);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset your learned taste? This cannot be undone.')) {
      await tasteProfileService.reset();
      await loadPatterns();
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patterns, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kesher_taste_profile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const activePatterns = patterns.filter(p => !p.userHidden);
  const ignoredPatterns = patterns.filter(p => p.userHidden);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      <div className="bg-white px-6 py-8 border-b border-gray-100">
        <h1 className="text-3xl font-serif text-gray-900 mb-3 tracking-tight">Private Taste Profile</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          We learn from your explicit feedback to surface better Daily Picks. You can edit, reset, or pause this anytime. Other people never see this.
        </p>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPaused ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PauseCircle size={16} className={isPaused ? 'text-amber-600' : 'text-gray-500'} />
            <span>{isPaused ? 'Learning Paused' : 'Pause Learning'}</span>
          </button>
          
          <button onClick={handleReset} className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            <RotateCcw size={16} />
            <span>Reset All</span>
          </button>
          
          <button onClick={handleExport} className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Learned from Feedback</h2>
          {activePatterns.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <p className="text-gray-500 text-sm">No learned patterns yet. Use "More like this" on profiles to teach the system.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activePatterns.map(p => (
                <TastePatternCard key={p.id} pattern={p} onReload={loadPatterns} />
              ))}
            </div>
          )}
        </section>

        {ignoredPatterns.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Ignored Patterns</h2>
            <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
              {ignoredPatterns.map(p => (
                <TastePatternCard key={p.id} pattern={p} onReload={loadPatterns} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const TastePatternCard = ({ pattern, onReload }: { pattern: TastePattern, onReload: () => void }) => {
  const toggleIgnore = async () => {
    // Mutable update for prototype
    pattern.userHidden = !pattern.userHidden;
    const current = await tasteProfileService.getTasteProfile();
    await tasteProfileService.updateTasteProfile(current.map(p => p.id === pattern.id ? pattern : p));
    onReload();
  };

  const toggleLock = async () => {
    pattern.userLocked = !pattern.userLocked;
    const current = await tasteProfileService.getTasteProfile();
    await tasteProfileService.updateTasteProfile(current.map(p => p.id === pattern.id ? pattern : p));
    onReload();
  };

  return (
    <div className={`bg-white rounded-xl p-4 border transition-colors ${pattern.userLocked ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{pattern.category}</h3>
            {pattern.userLocked && <Lock size={14} className="text-blue-500" />}
          </div>
          <p className="text-gray-800 text-sm mb-2">{pattern.value}</p>
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">Why:</span>
            <span className="ml-1">{pattern.provenanceSummary}</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button onClick={toggleLock} className="p-1.5 text-gray-400 hover:text-blue-600 rounded bg-gray-50 hover:bg-blue-50 transition-colors" title={pattern.userLocked ? "Unlock" : "Lock (prevent forgetting)"}>
            <Lock size={16} className={pattern.userLocked ? "text-blue-600" : ""} />
          </button>
          <button onClick={toggleIgnore} className="p-1.5 text-gray-400 hover:text-gray-900 rounded bg-gray-50 hover:bg-gray-200 transition-colors" title={pattern.userHidden ? "Restore" : "Ignore"}>
            <EyeOff size={16} className={pattern.userHidden ? "text-gray-900" : ""} />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>Confidence: {Math.round(pattern.confidence * 100)}%</span>
        <span>Expires: {new Date(pattern.expiresAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
