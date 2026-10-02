import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  Users,
  Activity,
  Sparkles,
} from 'lucide-react';
import { api, audio, Counter, QueueTicket, SEED_COUNTERS, SEED_TICKETS } from '@queuesmart/shared';

export const LobbyTvDisplayPage: React.FC = () => {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  const [counters, setCounters] = useState<Counter[]>(SEED_COUNTERS);
  const [tickets, setTickets] = useState<QueueTicket[]>(SEED_TICKETS);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [flashToken, setFlashToken] = useState<string | null>(null);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket listener for live announcement & calling
  useEffect(() => {
    const unsubAnnounce = api.onSocketEvent('display:announce', (payload: any) => {
      setFlashToken(payload.tokenNo);

      if (audioEnabled) {
        audio.announceToken(payload.tokenNo, payload.counterNumber, payload.serviceName);
      }

      setTimeout(() => setFlashToken(null), 5000);

      api.getCounters().then((res) => {
        if (res.data) setCounters(res.data);
      });
    });

    const unsubTicket = api.onSocketEvent('ticket:called', (payload: any) => {
      setFlashToken(payload.tokenNo);
      setTimeout(() => setFlashToken(null), 5000);
    });

    return () => {
      unsubAnnounce();
      unsubTicket();
    };
  }, [audioEnabled]);

  // Find active serving token
  const activeServingCounter =
    counters.find((c) => c.status === 'OPEN' && c.currentTicket) || counters[0];
  const activeTicket = activeServingCounter?.currentTicket;

  const displayServingToken = activeTicket ? activeTicket.tokenNo : 'A-101';
  const displayServingCounter = activeServingCounter ? `COUNTER 0${activeServingCounter.counterNumber}` : 'COUNTER 01';

  // Next tickets in line
  const upcomingTickets = tickets.filter((t) => t.status === 'WAITING').slice(0, 3);
  const fallbackNextTokens = ['A-102', 'A-103', 'A-104'];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#061210] text-[#E8ECE9] flex flex-col justify-between select-none font-sans overflow-hidden relative">
      {/* Subtle ambient glow matching Modern Transit screen */}
      <div className="absolute top-1/3 left-1/3 w-[650px] h-[450px] bg-[#0F4C5C]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP BROADCAST BAR */}
      <header className="px-8 sm:px-12 py-6 border-b border-[#142B26] flex items-center justify-between z-10 backdrop-blur-md bg-[#061210]/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F4C5C] to-[#146072] flex items-center justify-center text-white border border-[#20697B]">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-[3px] rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-newsreader">
              QueueSmart
            </span>
          </div>

          <span className="text-[#3A5B53] font-mono text-sm">•</span>
          <span className="text-sm font-medium text-[#7C9A92] tracking-wide">
            Main Branch - Vile Parle
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E2822] border border-[#164238] text-xs font-mono text-[#5EEAD4]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Live</span>
          </div>

          <span className="font-mono text-xl font-semibold text-white tracking-wider">
            {time}
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#142B26]">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-lg bg-[#0C1F1B] hover:bg-[#122D27] text-[#7C9A92] hover:text-white transition"
              title={audioEnabled ? 'Mute Announcements' : 'Unmute Announcements'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-[#5EEAD4]" /> : <VolumeX className="w-4 h-4 text-[#EF4444]" />}
            </button>
            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-2 rounded-lg bg-[#0C1F1B] hover:bg-[#122D27] text-[#7C9A92] hover:text-white transition"
              title="Full Screen Display"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN: NOW SERVING & NEXT LIST */}
      <main className="flex-1 px-8 sm:px-16 py-10 flex items-center justify-center z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* NOW SERVING HERO CARD (8 Cols) */}
          <div
            className={`lg:col-span-8 rounded-3xl bg-[#091D19]/90 border transition-all duration-700 flex flex-col justify-center items-center py-16 px-8 relative overflow-hidden shadow-2xl ${
              flashToken === displayServingToken
                ? 'border-[#10B981] ring-4 ring-[#10B981]/30 shadow-[#10B981]/20'
                : 'border-[#173D35]'
            }`}
          >
            {/* Ambient inner soft highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            <div className="text-center relative z-10 space-y-4">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#749B90]">
                Now Serving
              </span>

              {/* GIANT TOKEN DISPLAY */}
              <div className="py-2">
                <span className="font-mono text-7xl sm:text-9xl font-extrabold tracking-tight text-white block drop-shadow-sm">
                  {displayServingToken}
                </span>
              </div>

              {/* COUNTER DESIGNATOR */}
              <div className="pt-2">
                <span className="text-sm sm:text-base font-mono font-bold tracking-[0.2em] text-[#558378] uppercase px-5 py-2 rounded-full bg-[#061412] border border-[#14332D]">
                  {displayServingCounter}
                </span>
              </div>
            </div>
          </div>

          {/* NEXT LIST CARD (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-[#091D19]/90 border border-[#173D35] p-8 flex flex-col justify-between shadow-2xl relative">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#749B90] block mb-6">
                Next
              </span>

              <div className="space-y-6">
                {(upcomingTickets.length > 0
                  ? upcomingTickets.map((t) => t.tokenNo)
                  : fallbackNextTokens
                ).map((tokenNo, idx) => (
                  <div
                    key={tokenNo}
                    className="flex items-center justify-between pb-4 border-b border-[#132E27] last:border-0 last:pb-0"
                  >
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-wide">
                      {tokenNo}
                    </span>
                    <span className="text-xs font-mono text-[#558378]">
                      {idx === 0 ? '~4 min' : idx === 1 ? '~8 min' : '~12 min'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#132E27]">
              <span className="text-[11px] text-[#558378] uppercase tracking-wider block">
                Proceed to waiting zone A
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* BOTTOM TRANSIT TICKER & BRAND MESSAGE */}
      <footer className="px-8 sm:px-12 py-5 border-t border-[#142B26] bg-[#061210]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* General OPD Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D2520] border border-[#173D35] text-xs font-medium text-[#B4CDC6]">
            <Activity className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>General OPD</span>
          </div>

          {/* Avg Wait Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D2520] border border-[#173D35] text-xs font-mono text-[#B4CDC6]">
            <Clock className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>Avg Wait 12 min</span>
          </div>

          {/* Queue Count Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D2520] border border-[#173D35] text-xs font-mono text-[#B4CDC6]">
            <Users className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>Queue 24</span>
          </div>
        </div>

        {/* Quiet Editorial Sign-off */}
        <div className="text-xs sm:text-sm text-[#749B90] font-newsreader italic tracking-wide">
          Stay informed. Stay relaxed.
        </div>
      </footer>
    </div>
  );
};
