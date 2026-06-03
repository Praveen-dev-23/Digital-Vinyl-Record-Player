import React, { useState } from "react";
import { useAudioAnalyzer } from "./hooks/useAudioAnalyzer";
import { BackgroundAmbience } from "./components/BackgroundAmbience";
import { CozyRoomScene } from "./components/CozyRoomScene";
import { VinylRecord } from "./components/VinylRecord";
import { Tonearm } from "./components/Tonearm";
import { CircularVisualizer } from "./components/CircularVisualizer";
import { ControlDock } from "./components/ControlDock";
import { Disc, Info, Heart, Headphones, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const {
    currentTrack,
    playlist,
    currentTrackIndex,
    isPlaying,
    playbackProgress,
    currentTime,
    duration,
    volume,
    spinSpeed,
    isScratching,
    handlePlayPause,
    handleNext,
    handlePrev,
    handleSeek,
    handleVolumeChange,
    handleAudioUpload,
    startScratching,
    scratchTo,
    endScratching,
    getByteFrequencyData,
    selectTrack,
    audioContext
  } = useAudioAnalyzer();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Dashboard overlay state (vinyl player deck)
  const [turntableOpen, setTurntableOpen] = useState(false);

  return (
    <div className="relative w-full h-screen min-h-screen overflow-hidden flex flex-col justify-between bg-[#0c0a12] text-off-white font-sans selection:bg-amber-glow/30">
      
      {/* 1. CRT Screen Scanline Filter Layer (High-density game feel!) */}
      <div className="scanlines-overlay" />

      {/* 2. Dense Isometric Cozy House Canvas Scene */}
      <CozyRoomScene 
        isPlaying={isPlaying} 
        spinSpeed={spinSpeed}
        onOpenTurntable={() => setTurntableOpen(true)} 
      />

      {/* 3. Floating HUD Header Overlay */}
      <header className="relative w-full flex items-center justify-between px-6 py-4 md:px-12 md:py-6 z-40 animate-drop-fade select-none pointer-events-none">
        
        {/* Retro Brand Label */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5 shadow-md rounded-lg">
            <Disc className={`w-4 h-4 text-[#ffd043] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#ffd043] font-bold leading-none tracking-wider">
              KISSEN
            </h1>
            <p className="font-mono text-[8px] text-[#f7e6c4]/40 uppercase tracking-widest mt-1 leading-none">
              LO-FI LISTENING HOUSE
            </p>
          </div>
        </div>

        {/* Dynamic retro status bar */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] text-off-white/70 tracking-wider font-mono uppercase bg-white/5 backdrop-blur-md px-3.5 py-1.5 border border-white/10 rounded-full shadow-lg">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#ffd043] shadow-[0_0_8px_#ffd043] animate-pulse' : 'bg-[#34304b]'}`} />
            <span>{isPlaying ? 'ANALOG SPINNING' : 'SYSTEM IDLE'}</span>
          </div>
        </div>

        {/* Action icons (Cozy pixel squares) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`w-10 h-10 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95 ${isLiked ? 'text-neon-pink bg-neon-pink/10 border-neon-pink/30' : 'text-off-white/60'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={() => setAboutOpen(true)}
            className="w-10 h-10 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/20 text-off-white/60 hover:text-amber-light transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 4. Floating open deck deck builder button (Alternative way to open) */}
      {!turntableOpen && (
        <div className="absolute bottom-6 right-6 z-40 animate-drop-fade pointer-events-auto">
          <button 
            onClick={() => setTurntableOpen(true)}
            className="pixel-btn pixel-btn-amber flex items-center gap-2 font-bold text-xs uppercase"
          >
            <Disc className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            OPEN PLAYER DECK
          </button>
        </div>
      )}

      {/* 5. Audio Ambience & Soundscape Mixer HUD (Floating on Left side) */}
      {!turntableOpen && (
        <BackgroundAmbience 
          isPlaying={isPlaying} 
          audioContext={audioContext} 
          spinSpeed={spinSpeed} 
        />
      )}

      {/* --- COLLAPSIBLE SLIDE-UP TURNTABLE PLAYER DASHBOARD --- */}
      <div className={`dashboard-overlay ${turntableOpen ? "" : "dashboard-hidden"}`}>
        
        {/* Floating Close Button for Dashboard */}
        <div className="absolute top-6 right-6 md:right-12 z-50 pointer-events-auto">
          <button 
            onClick={() => setTurntableOpen(false)}
            className="pixel-btn flex items-center gap-2 text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #ff3b7e 0%, #ff7ea5 100%)", color: "#ffffff" }}
          >
            <X className="w-3.5 h-3.5" />
            CLOSE DECK [X]
          </button>
        </div>

        {/* Dashboard Title branding */}
        <div className="w-full flex justify-center pt-8 z-40 select-none pointer-events-none">
          <div className="px-5 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md text-[#ffd043] font-mono text-[10px] font-bold uppercase tracking-widest shadow-lg">
            TURNTABLE CONSOLE SYSTEM
          </div>
        </div>

        {/* Center Platter and Tonearm player layout */}
        <main className="relative flex-grow flex items-center justify-center z-10 px-4 py-4">
          
          <div className="relative flex items-center justify-center">
            
            {/* 16-bit LED visualizer glowing around record */}
            <CircularVisualizer 
              isPlaying={isPlaying} 
              getByteFrequencyData={getByteFrequencyData} 
            />

            {/* Wooden Platter cabinet chassis */}
            <VinylRecord 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              spinSpeed={spinSpeed}
              isScratching={isScratching}
              startScratching={startScratching}
              scratchTo={scratchTo}
              endScratching={endScratching}
            />

            {/* S-Shape mechanical tonearm */}
            <Tonearm 
              isPlaying={isPlaying} 
              playbackProgress={playbackProgress}
              isScratching={isScratching}
            />

          </div>
        </main>

        {/* Console Dock Controller Drawer */}
        <ControlDock 
          currentTrack={currentTrack}
          playlist={playlist}
          isPlaying={isPlaying}
          playbackProgress={playbackProgress}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          handlePlayPause={handlePlayPause}
          handleNext={handleNext}
          handlePrev={handlePrev}
          handleSeek={handleSeek}
          handleVolumeChange={handleVolumeChange}
          handleAudioUpload={handleAudioUpload}
          playlistIndex={currentTrackIndex}
          onSelectTrack={(index) => {
            selectTrack(index);
          }}
        />
      </div>

      {/* --- RETRO DIALOG MODAL --- */}
      <AnimatePresence>
        {aboutOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAboutOpen(false)}
            className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-8 max-w-md w-full text-off-white cursor-default select-none text-center shadow-2xl"
            >
              <Headphones className="w-10 h-10 text-[#ffd043] mx-auto mb-4" />
              <h3 className="font-serif text-3xl text-[#ffd043] tracking-wide mb-3 font-bold">
                LO-FI GAME HOUSE
              </h3>
              <p className="font-mono text-xs text-[#f7e6c4]/80 leading-relaxed mb-6">
                Welcome to your interactive lo-fi music studio bedroom! We have built a high-density 16-bit isometric layout inspired by classic RPGs, matching the exact look of your room design.
                <br /><br />
                **Interactivity Checklist**:
                <br />
                • **Analog Turntable**: Click the wooden record player on the music desk to slide open the vinyl playback controls & scratch deck!
                <br />
                • **Orange Tabby Cat**: Click the orange cat sitting on top of the CRT TV to hear a friendly meow.
                <br />
                • **Studio Monitor**: Click the computer screen to cycle the graphic between lofi desktop, matrix code, and screen off.
                <br />
                • **Red Synth Keyboard**: Click the keyboard on the music desk to play retro synth notes with golden spark particles.
                <br />
                • **Lava Lamp**: Click the lamp on the sideboard cabinet to toggle its pink glass glow and animate lava particles.
                <br />
                • **Desert Terrarium**: Click the glass terrarium table to toggle its warm yellow overhead light bar.
                <br />
                • **Bed & Plushies**: Click Finn the Human or the Teddy Bear on the bed to hug them and trigger floating heart particles.
              </p>
              
              <div className="border-t border-white/10 pt-5 flex flex-col gap-2.5 text-[11px] text-off-white/40 font-mono uppercase tracking-wider">
                <p>PRODUCED FOR PIXEL-ART MUSIC LOVERS</p>
                <button 
                  onClick={() => setAboutOpen(false)}
                  className="pixel-btn pixel-btn-amber mt-4 w-full text-xs font-bold py-3 cursor-pointer"
                >
                  ENTER COZY ROOM
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
