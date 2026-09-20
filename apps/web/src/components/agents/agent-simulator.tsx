'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { Mic, MicOff, PhoneOff, Sparkles, Volume2, Send, Bot, User } from 'lucide-react';

interface Turn {
  speaker: 'user' | 'agent';
  text: string;
  time: string;
}

interface AgentSimulatorProps {
  agent: any;
}

export function AgentSimulator({ agent }: AgentSimulatorProps) {
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
  const [inputText, setInputText] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, callStatus]);

  const startCall = () => {
    setCallActive(true);
    setCallStatus('connecting');
    setTurns([]);

    setTimeout(() => {
      setCallStatus('speaking');
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTurns([
        {
          speaker: 'agent',
          text: agent.beginMessage || 'Hello! Thank you for calling. How can I assist you today?',
          time: now,
        },
      ]);
      setTimeout(() => setCallStatus('listening'), 1800);
    }, 1000);
  };

  const endCall = () => {
    setCallActive(false);
    setCallStatus('idle');
  };

  const handleSendTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !callActive) return;

    const userText = inputText.trim();
    setInputText('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTurns((prev) => [...prev, { speaker: 'user', text: userText, time: now }]);
    setCallStatus('speaking');

    // Simulate realistic AI turn based on agent persona and input
    setTimeout(() => {
      let reply = `I understand you're asking about "${userText}". I'm ${agent.name}, running in ${agent.voiceMode} mode. Let me take care of that for you!`;
      if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('cost')) {
        reply = `Talkie provides transparent pay-as-you-go pricing at $0.05/voice minute and $0.0075/SMS. Would you like me to send a breakdown to your phone?`;
      } else if (userText.toLowerCase().includes('help') || userText.toLowerCase().includes('support')) {
        reply = `I can help you troubleshoot your phone lines, configure webhooks, or schedule a technical onboarding session. Which would you prefer?`;
      }

      setTurns((prev) => [
        ...prev,
        {
          speaker: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);
      setCallStatus('listening');
    }, 900);
  };

  return (
    <Card className="p-6 bg-card border-white/[0.08] space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Interactive Web Voice Simulator</h3>
            <p className="text-xs text-neutral-400">Test voice turns, barge-in sensitivity, and LLM behavior</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {callActive ? (
            <div className="flex items-center gap-3">
              <Badge
                variant="success"
                className="animate-pulse flex items-center gap-1.5 font-mono text-[11px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{callStatus.toUpperCase()}</span>
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={endCall}
                className="gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Hang Up</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={startCall}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Voice Session</span>
            </Button>
          )}
        </div>
      </div>

      {/* Simulator Display & Waveform */}
      <div className="h-80 bg-[#08090b] rounded-xl border border-white/[0.08] flex flex-col justify-between overflow-hidden">
        {/* Transcript Conversation View */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {!callActive && turns.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 space-y-2">
              <Mic className="w-8 h-8 text-neutral-600" />
              <p className="text-xs">Click "Start Voice Session" to begin interactive simulation</p>
            </div>
          )}

          {turns.map((turn, i) => (
            <div
              key={i}
              className={`flex gap-3 text-xs leading-relaxed max-w-[80%] ${
                turn.speaker === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  turn.speaker === 'user'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {turn.speaker === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  turn.speaker === 'user'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-100 rounded-tr-none'
                    : 'bg-white/[0.04] border-white/[0.08] text-neutral-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-neutral-400">
                  <span className="font-semibold">{turn.speaker === 'user' ? 'You' : agent.name}</span>
                  <span className="font-mono">{turn.time}</span>
                </div>
                <p>{turn.text}</p>
              </div>
            </div>
          ))}

          {callActive && callStatus === 'speaking' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{agent.name} is speaking...</span>
            </div>
          )}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={handleSendTurn}
          className="p-3 bg-white/[0.02] border-t border-white/[0.08] flex items-center gap-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!callActive}
            placeholder={callActive ? 'Type speech utterance (e.g., "What are your pricing plans?")...' : 'Start call to speak'}
            className="text-xs bg-[#0a0c10] border-white/[0.08]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!callActive || !inputText.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
