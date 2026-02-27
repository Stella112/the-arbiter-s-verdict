import { useState } from "react";
import { toast } from "sonner";
import { Shield, CheckCircle2, RotateCcw, Loader2, Dices } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type GameState = "input" | "loading" | "verdict";

interface VerdictData {
  winner_and_verdict: string;
  cryptographic_proof_hash: string;
}

const ArbiterGame = () => {
  const [state, setState] = useState<GameState>("input");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [topic, setTopic] = useState("");
  const [topicLoading, setTopicLoading] = useState(false);

  const generateTopic = async () => {
    setTopicLoading(true);
    try {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${projectUrl}/functions/v1/judge-proxy?action=generate-topic&t=${Date.now()}`, {
        headers: { "Authorization": `Bearer ${anonKey}`, "apikey": anonKey },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate topic");
      setTopic(data.topic);
    } catch (err: any) {
      toast.error(err.message || "Could not generate a topic.");
    } finally {
      setTopicLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!p1.trim() || !p2.trim()) {
      toast.error("Both players must submit an argument.");
      return;
    }

    setState("loading");
    try {
      const { data, error } = await supabase.functions.invoke("judge-proxy", {
        body: { topic: topic || undefined, player_1_argument: p1, player_2_argument: p2 },
      });

      if (error) throw new Error(error.message);
      if (!data || data.error || data.detail) throw new Error(data?.detail || data?.error || "Invalid response");
      setVerdict(data);
      setState("verdict");
    } catch (err: any) {
      toast.error(err.message || "The Arbiter could not be reached.");
      setState("input");
    }
  };

  const reset = () => {
    setState("input");
    setTopic("");
    setP1("");
    setP2("");
    setVerdict(null);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-10 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-primary tracking-wider">
            THE ARBITER
          </h1>
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          AI-Powered Decentralized Judgment
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-3xl relative z-10">
        {state === "input" && (
          <div className="glass-surface rounded-xl p-6 md:p-8 space-y-6">
            {/* Topic Generator */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={generateTopic}
                disabled={topicLoading}
                className="flex items-center gap-2 font-display text-xs tracking-widest uppercase px-6 py-3 rounded-lg border border-accent/40 bg-accent/10 text-accent glow-accent hover:bg-accent/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
              >
                {topicLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Brainstorming…
                  </>
                ) : (
                  <>
                    <Dices className="w-4 h-4" />
                    🎲 Generate Debate Topic
                  </>
                )}
              </button>

              <div className="w-full">
                <label className="block text-xs font-display tracking-widest text-muted-foreground uppercase mb-2 text-center">
                  Debate Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a debate topic, or generate one..."
                  className="w-full bg-input/60 border border-primary/30 rounded-lg px-4 py-3 text-center text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-display text-xs tracking-widest text-primary uppercase">
                  Player 1's Argument
                </label>
                <textarea
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  placeholder="State your case..."
                  rows={5}
                  className="w-full bg-input/60 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="font-display text-xs tracking-widest text-accent uppercase">
                  Player 2's Argument
                </label>
                <textarea
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  placeholder="State your case..."
                  rows={5}
                  className="w-full bg-input/60 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full font-display text-sm tracking-widest uppercase py-4 rounded-lg bg-primary text-primary-foreground glow-primary hover:glow-primary-intense transition-all duration-300 active:scale-[0.98]"
            >
              Submit to The Arbiter
            </button>
          </div>
        )}

        {state === "loading" && (
          <div className="glass-surface rounded-xl p-12 flex flex-col items-center gap-6 animate-pulse-glow">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-display text-lg tracking-widest text-primary uppercase">
              The Arbiter is deliberating…
            </p>
          </div>
        )}

        {state === "verdict" && verdict && (
          <div className="space-y-4">
            <div className="glass-surface rounded-xl p-8 space-y-6 glow-primary">
              <h2 className="font-display text-2xl font-bold text-gradient-primary tracking-wider text-center">
                Verdict
              </h2>
              <p className="text-foreground text-center leading-relaxed text-lg">
                {verdict.winner_and_verdict}
              </p>
            </div>

            <div className="glass-surface rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase font-display">
                  Verified on-chain via OpenGradient
                </span>
              </div>
              <p className="font-mono-code text-xs text-muted-foreground break-all">
                {verdict.cryptographic_proof_hash}
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 font-display text-sm tracking-widest uppercase py-4 rounded-lg border border-border bg-secondary text-secondary-foreground hover:bg-muted transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArbiterGame;
