import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Send, Sparkles, Shield, RefreshCw, MessageSquare, Loader2,
  AlertTriangle, ChevronDown, ChevronUp, Flag
} from "lucide-react";

export default function ChatThread() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id || "0");
  const { user, isAuthenticated, loading } = useAuth();

  const convQuery = trpc.messages.getConversation.useQuery({ matchId }, { enabled: isAuthenticated && matchId > 0 });
  const sendMsg = trpc.messages.send.useMutation({
    onSuccess: () => { setDraft(""); convQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const reportMsg = trpc.messages.reportMessage.useMutation({
    onSuccess: () => toast.success("הדיווח נשלח. תודה."),
  });

  const rephraseAI = trpc.ai.rephrase.useMutation();
  const safetyAI = trpc.ai.safetyCheck.useMutation();
  const openersAI = trpc.ai.openers.useMutation();
  const dateIdeasAI = trpc.ai.dateIdeas.useMutation();

  const [draft, setDraft] = useState("");
  const [showAITools, setShowAITools] = useState(false);
  const [rephrasedAlts, setRephrasedAlts] = useState<string[]>([]);
  const [safetyResult, setSafetyResult] = useState<{ risk_level: string; flags: string[]; advice: string | null } | null>(null);
  const [openers, setOpeners] = useState<string[]>([]);
  const [dateIdeas, setDateIdeas] = useState<{ title: string; description: string; safetyNote: string | null }[]>([]);
  const [reportingMsgId, setReportingMsgId] = useState<number | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><Button asChild><a href={getLoginUrl()}>Sign in</a></Button></div>;

  const messages = convQuery.data?.messages || [];

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMsg.mutate({ matchId, content: draft.trim() });
  };

  const handleRephrase = async () => {
    if (!draft.trim()) return;
    const result = await rephraseAI.mutateAsync({ draftMessage: draft });
    setRephrasedAlts(result.alternatives || []);
  };

  const handleSafetyCheck = async () => {
    if (!draft.trim()) return;
    const result = await safetyAI.mutateAsync({ messageContent: draft });
    setSafetyResult(result);
  };

  const handleOpeners = async () => {
    const result = await openersAI.mutateAsync({ matchProfileSummary: "match profile" });
    setOpeners(result.openers || []);
  };

  const handleDateIdeas = async () => {
    const result = await dateIdeasAI.mutateAsync({ sharedInterests: ["קפה", "טיולים"] });
    setDateIdeas(result.ideas || []);
  };

  const riskColor = safetyResult?.risk_level === "high" ? "text-destructive" : safetyResult?.risk_level === "medium" ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AppNav />
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-background">
          <Link href="/inbox">
            <Button variant="ghost" size="sm">← חזרה</Button>
          </Link>
          <h2 className="font-semibold text-sm">שיחה</h2>
          <Link href={`/safety-center?report=match-${matchId}`}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Flag className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {convQuery.isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                  {msg.content}
                  {msg.isAiDraft && (
                    <span className="block text-xs opacity-60 mt-1">AI טיוטה</span>
                  )}
                </div>
                {!isMe && (
                  <button
                    className="opacity-0 group-hover:opacity-100 ml-2 text-muted-foreground hover:text-destructive transition-all"
                    onClick={() => setReportingMsgId(msg.id)}
                    title="דווח על הודעה"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Report message dialog */}
        {reportingMsgId && (
          <div className="mx-4 mb-2 card-soft p-3 bg-destructive/5 border-destructive/20 space-y-2 animate-fade-in-up">
            <p className="text-sm font-medium text-destructive">דווח על הודעה #{reportingMsgId}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={() => { reportMsg.mutate({ messageId: reportingMsgId, reason: "תוכן לא הולם" }); setReportingMsgId(null); }}>
                שלח דיווח
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReportingMsgId(null)}>ביטול</Button>
            </div>
          </div>
        )}

        {/* AI Tools panel */}
        <div className="border-t border-border bg-background">
          <button
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowAITools(!showAITools)}
          >
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" />כלי AI לשיחה (טיוטה בלבד — לא נשלח אוטומטית)</span>
            {showAITools ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {showAITools && (
            <div className="px-4 pb-3 space-y-3 animate-fade-in-up">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleRephrase} disabled={rephraseAI.isPending || !draft.trim()}>
                  {rephraseAI.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  ניסוח מחדש
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleSafetyCheck} disabled={safetyAI.isPending || !draft.trim()}>
                  {safetyAI.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                  בדיקת בטיחות
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleOpeners} disabled={openersAI.isPending}>
                  {openersAI.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                  פתיחות שיחה
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleDateIdeas} disabled={dateIdeasAI.isPending}>
                  {dateIdeasAI.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  רעיונות לפגישה
                </Button>
              </div>

              {/* Rephrase results */}
              {rephrasedAlts.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-primary">חלופות (טיוטה — לא נשלח אוטומטית):</p>
                  {rephrasedAlts.map((alt, i) => (
                    <button key={i} className="w-full text-right text-sm p-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors" onClick={() => setDraft(alt)}>
                      {alt}
                    </button>
                  ))}
                </div>
              )}

              {/* Safety result */}
              {safetyResult && (
                <div className={`p-2.5 rounded-lg bg-muted/50 border border-border text-xs space-y-1`}>
                  <p className={`font-medium ${riskColor}`}>
                    {safetyResult.risk_level === "high" ? "⚠️ סיכון גבוה" : safetyResult.risk_level === "medium" ? "⚡ סיכון בינוני" : "✓ נראה תקין"}
                  </p>
                  {safetyResult.flags.length > 0 && <p className="text-muted-foreground">{safetyResult.flags.join(", ")}</p>}
                  {safetyResult.advice && <p className="text-foreground">{safetyResult.advice}</p>}
                </div>
              )}

              {/* Openers */}
              {openers.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-primary">פתיחות שיחה (טיוטה):</p>
                  {openers.map((o, i) => (
                    <button key={i} className="w-full text-right text-sm p-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors" onClick={() => setDraft(o)}>
                      {o}
                    </button>
                  ))}
                </div>
              )}

              {/* Date ideas */}
              {dateIdeas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-primary">רעיונות לפגישה:</p>
                  {dateIdeas.map((idea, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xs space-y-0.5">
                      <p className="font-medium">{idea.title}</p>
                      <p className="text-muted-foreground">{idea.description}</p>
                      {idea.safetyNote && <p className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{idea.safetyNote}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 flex gap-2">
            <textarea
              className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="כתוב/י הודעה..."
              maxLength={4000}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <Button
              className="self-end bg-primary text-primary-foreground"
              size="icon"
              onClick={handleSend}
              disabled={!draft.trim() || sendMsg.isPending}
            >
              {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
