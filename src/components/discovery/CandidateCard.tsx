import React from 'react';
import { CandidateProfile, RecommendationResult } from '../../types';
import { MapPin, Info, ThumbsUp, ThumbsDown, UserPlus, UserMinus, ShieldCheck } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateProfile;
  result?: RecommendationResult;
  explanation?: string;
  onLike: () => void;
  onPass: () => void;
  onMoreLikeThis: () => void;
  onLessLikeThis: () => void;
  surface: 'daily_picks' | 'explore';
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, result, explanation, onLike, onPass, onMoreLikeThis, onLessLikeThis, surface 
}) => {
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-h-[700px]">
      <div className="relative h-64 sm:h-80 bg-gray-100 flex-shrink-0">
        {candidate.photos[0] && (
          <img 
            src={candidate.photos[0].url} 
            alt={candidate.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pt-12">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-serif text-white">{candidate.name}, {candidate.age}</h2>
            {candidate.verified && <ShieldCheck size={18} className="text-blue-400" />}
          </div>
          <div className="flex items-center text-white/90 text-sm mt-1">
            <MapPin size={14} className="mr-1" />
            <span>{candidate.city} · {candidate.distanceMiles} miles away</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-24">
        {result && (
          <div className="mb-6 bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
            <div className="flex items-start space-x-3">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Why you're seeing this</p>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                  {explanation || "Scanning preferences..."}
                </p>
                {surface === 'explore' && result.disclosures.length > 0 && (
                  <div className="mt-2 text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs inline-block border border-amber-100">
                    {result.disclosures[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">About</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{candidate.bio}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge label={candidate.relationshipIntent.replace(/_/g, ' ')} />
            <Badge label={candidate.observance.replace(/_/g, ' ')} />
          </div>

          {candidate.prompts.map(p => (
            <div key={p.id} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">{p.question}</p>
              <p className="text-gray-800 text-sm font-medium">{p.answer}</p>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Feedback</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={onMoreLikeThis} className="flex items-center justify-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition flex-1">
                <UserPlus size={16} className="mr-2 text-gray-500" />
                More like this
              </button>
              <button onClick={onLessLikeThis} className="flex items-center justify-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition flex-1">
                <UserMinus size={16} className="mr-2 text-gray-500" />
                Less like this
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-center space-x-6 z-10">
        <button onClick={onPass} className="w-14 h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition shadow-sm">
          <ThumbsDown size={24} />
        </button>
        <button onClick={onLike} className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-md shadow-blue-600/20">
          <ThumbsUp size={24} />
        </button>
      </div>
    </div>
  );
};

const Badge = ({ label }: { label: string }) => (
  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
    {label}
  </span>
);
