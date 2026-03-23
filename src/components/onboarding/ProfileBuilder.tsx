import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Camera, Plus, X, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { aiService } from '@/services/aiService';

interface Photo {
  id: string;
  url: string;
}

export const ProfileBuilder: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: '1', url: 'https://picsum.photos/seed/user1/600/800' },
    { id: '2', url: 'https://picsum.photos/seed/user2/600/800' },
  ]);
  const [prompts, setPrompts] = useState([
    { id: '1', question: 'My ideal Friday night', answer: '' },
    { id: '2', question: 'A life goal of mine', answer: '' },
  ]);
  const [bio, setBio] = useState('');
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState<string[]>([]);
  const [isAnalyzingPhotos, setIsAnalyzingPhotos] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const [isAnalyzingCompleteness, setIsAnalyzingCompleteness] = useState(false);
  const [completenessAnalysis, setCompletenessAnalysis] = useState<any>(null);

  const handleAnalyzeCompleteness = async () => {
    setIsAnalyzingCompleteness(true);
    try {
      const result = await aiService.analyzeProfileCompleteness({
        photos: photos.map(p => p.url),
        bio,
        prompts
      });
      setCompletenessAnalysis(result);
    } catch (error) {
      console.error("Completeness analysis error:", error);
    } finally {
      setIsAnalyzingCompleteness(false);
    }
  };

  const handleAiCoach = async () => {
    if (!bio) return;
    setIsCoaching(true);
    try {
      const result = await aiService.coachBio({
        bio_raw: bio,
        tone: 'serious',
        values: 'Jewish values',
        dealbreakers: 'none',
        length: 'medium'
      });
      setBio(result.refined_bio);
      setCoachingFeedback(result.suggestions);
    } catch (error) {
      console.error("AI Coaching error:", error);
    } finally {
      setIsCoaching(false);
    }
  };

  const handleAnalyzePhotos = async () => {
    if (photos.length === 0 || isAnalyzingPhotos) return;
    setIsAnalyzingPhotos(true);
    try {
      const feedback = await aiService.analyzePhotos(photos.map(p => p.url));
      setPhotoFeedback(feedback);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzingPhotos(false);
    }
  };

  const addPhoto = () => {
    const newPhoto = { id: Math.random().toString(), url: `https://picsum.photos/seed/${Math.random()}/600/800` };
    setPhotos([...photos, newPhoto]);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-12 pb-20">
      {/* AI Profile Health Section */}
      <section className="space-y-6">
        <div className="p-8 bg-gradient-to-br from-[#2D2926] to-[#1A1816] rounded-[40px] text-white space-y-6 relative overflow-hidden shadow-xl shadow-black/20">
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                <Sparkles size={14} />
                <span>Profile Health Coach</span>
              </div>
              <h3 className="text-2xl font-serif italic leading-tight">How's your profile looking?</h3>
              <p className="text-white/60 text-sm leading-relaxed italic">Get AI-powered insights to help you stand out with intent.</p>
            </div>
            <Button 
              onClick={handleAnalyzeCompleteness}
              disabled={isAnalyzingCompleteness}
              className="rounded-full bg-[#D4AF37] text-[#2D2926] font-bold text-[10px] uppercase tracking-widest px-6 hover:bg-[#B8962E] shadow-lg shadow-[#D4AF37]/20"
            >
              {isAnalyzingCompleteness ? <Loader2 size={14} className="animate-spin" /> : "Analyze"}
            </Button>
          </div>

          <AnimatePresence>
            {completenessAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4 border-t border-white/10 relative z-10"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Completeness Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-serif italic">{completenessAnalysis.completeness_score}</span>
                      <span className="text-white/40 text-sm">/ 100</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end max-w-[200px]">
                    {completenessAnalysis.strengths.map((strength: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/20">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Areas for Improvement</p>
                  <div className="grid gap-3">
                    {completenessAnalysis.missing_areas.map((area: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 rounded-[24px] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{area.area}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                            area.importance === 'critical' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                          )}>
                            {area.importance}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 italic leading-relaxed">{area.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#D4AF37]/10 rounded-[24px] border border-[#D4AF37]/20">
                  <p className="text-xs text-[#D4AF37] italic leading-relaxed font-serif">
                    “{completenessAnalysis.overall_tip}”
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 blur-2xl -ml-20 -mb-20" />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h3 className="text-2xl font-serif italic tracking-tight text-[#2D2926]">Your Photos</h3>
            <p className="text-sm text-[#8C7E6E] italic">Drag to reorder. Add at least 2 photos.</p>
          </div>
          {photos.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAnalyzePhotos}
              disabled={isAnalyzingPhotos}
              className="text-[#D4AF37] hover:text-[#B8962E] hover:bg-[#D4AF37]/5 rounded-full gap-2 font-bold uppercase tracking-[0.1em] text-[10px]"
            >
              {isAnalyzingPhotos ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              AI Photo Review
            </Button>
          )}
        </div>

        <AnimatePresence>
          {photoFeedback && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#F7F2EE]/50 border border-[#E5DED5] p-6 rounded-[32px] space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8C7E6E]">
                  <Sparkles size={16} className="text-[#D4AF37]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Photo Insights</span>
                </div>
                <button onClick={() => setPhotoFeedback(null)} className="text-[10px] text-[#8C7E6E] font-bold uppercase hover:text-[#2D2926]">Dismiss</button>
              </div>
              <p className="text-sm text-[#2D2926]/80 leading-relaxed italic font-serif">{photoFeedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Reorder.Group axis="y" values={photos} onReorder={setPhotos} className="grid grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Reorder.Item 
              key={photo.id} 
              value={photo}
              className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[#F7F2EE] group cursor-grab active:cursor-grabbing shadow-sm border border-[#F3EFEA]"
            >
              <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => removePhoto(photo.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
              >
                <X size={14} />
              </button>
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Reorder.Item>
          ))}
          {photos.length < 6 && (
            <button 
              onClick={addPhoto}
              className="aspect-[3/4] rounded-[24px] border-2 border-dashed border-[#F3EFEA] flex flex-col items-center justify-center gap-3 text-[#8C7E6E]/40 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]/40 transition-all bg-white shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full bg-[#F7F2EE] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Photo</span>
            </button>
          )}
        </Reorder.Group>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic tracking-tight text-[#2D2926]">About You</h3>
          <p className="text-sm text-[#8C7E6E] italic">Share a bit about yourself. Be sincere.</p>
        </div>

        <div className="p-8 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm focus-within:border-[#D4AF37]/30 transition-all relative group">
          <textarea 
            placeholder="I am looking for someone who..."
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl text-[#2D2926] placeholder:text-[#8C7E6E]/20 resize-none min-h-[120px] leading-relaxed italic font-serif"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <AnimatePresence>
            {coachingFeedback.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pt-2"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Coach Suggestions</p>
                <ul className="space-y-1">
                  {coachingFeedback.map((tip, i) => (
                    <li key={i} className="text-xs text-[#8C7E6E] italic flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-[#8C7E6E]/40">
              <Sparkles size={10} />
              <span>AI Draft • Human Control</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAiCoach}
              disabled={!bio || isCoaching}
              className="text-[#D4AF37] hover:text-[#B8962E] hover:bg-[#D4AF37]/5 rounded-full gap-2 font-bold uppercase tracking-[0.1em] text-[10px]"
            >
              {isCoaching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              AI Coach
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic tracking-tight text-[#2D2926]">Conversation Starters</h3>
          <p className="text-sm text-[#8C7E6E] italic">Answer these to help people get to know you.</p>
        </div>

        <div className="space-y-6">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="p-8 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm focus-within:border-[#D4AF37]/30 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E]">{prompt.question}</p>
              </div>
              <textarea 
                placeholder="Type your answer..."
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl text-[#2D2926] placeholder:text-[#8C7E6E]/20 resize-none min-h-[100px] leading-relaxed italic font-serif"
                value={prompt.answer}
                onChange={(e) => {
                  const newPrompts = [...prompts];
                  newPrompts[index].answer = e.target.value;
                  setPrompts(newPrompts);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4">
        <Button 
          className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all" 
          disabled={photos.length < 2 || prompts.some(p => !p.answer) || !bio}
          onClick={() => onComplete({ photos, prompts, bio })}
        >
          Complete Profile
        </Button>
      </div>
    </div>
  );
};
