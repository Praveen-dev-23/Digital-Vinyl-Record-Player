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
          <div className="relative w-8 h-8 flex items-center justify-center border-2 border-[#100f1a] bg-[#16151f] shadow-md rounded-sm">
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
          <div className="flex items-center gap-2 text-[9px] text-[#f7e6c4]/60 tracking-wider font-mono uppercase bg-[#16151f] px-3 py-1.5 border-2 border-[#100f1a] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.4)]">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#ffd043] shadow-[0_0_6px_#ffd043] animate-pulse' : 'bg-[#34304b]'}`} />
            <span>{isPlaying ? 'ANALOG SPINNING' : 'SYSTEM IDLE'}</span>
          </div>
        </div>

        {/* Action icons (Cozy pixel squares) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`w-10 h-10 border-2 border-[#100f1a] bg-[#16151f] hover:bg-[#34304b] transition-all flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] ${isLiked ? 'text-[#ff7ea5]' : 'text-[#f7e6c4]/50'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={() => setAboutOpen(true)}
            className="w-10 h-10 border-2 border-[#100f1a] bg-[#16151f] hover:bg-[#34304b] text-[#f7e6c4]/50 hover:text-[#ffd043] transition-all flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]"
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
            className="pixel-btn pixel-btn-amber flex items-center gap-2 border-2 border-[#100f1a] font-bold text-xs uppercase"
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
            className="pixel-btn flex items-center gap-2 border-2 border-[#100f1a] text-xs font-bold font-mono"
            style={{ backgroundColor: "#ff7ea5", color: "#100f1a" }}
          >
            <X className="w-3.5 h-3.5" />
            CLOSE DECK [X]
          </button>
        </div>

        {/* Dashboard Title branding */}
        <div className="w-full flex justify-center pt-8 z-40 select-none pointer-events-none">
          <div className="px-5 py-2 border-2 border-[#100f1a] bg-[#16151f] text-[#ffd043] font-mono text-xs font-bold uppercase tracking-widest shadow-md">
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
              className="bg-[#211f30] border-[6px] border-[#100f1a] p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] max-w-md w-full text-[#f7e6c4] cursor-default select-none text-center"
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
              
              <div className="border-t-2 border-[#100f1a] pt-5 flex flex-col gap-2.5 text-[11px] text-[#f7e6c4]/40 font-mono uppercase tracking-wider">
                <p>PRODUCED FOR PIXEL-ART MUSIC LOVERS</p>
                <button 
                  onClick={() => setAboutOpen(false)}
                  className="pixel-btn pixel-btn-amber mt-4 w-full text-xs font-bold py-3 border-2 border-[#100f1a] cursor-pointer"
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
