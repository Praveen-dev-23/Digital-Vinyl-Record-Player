import React, { useState } from "react";
import { useAudioAnalyzer } from "./hooks/useAudioAnalyzer";
import { BackgroundAmbience } from "./components/BackgroundAmbience";
import { CozyRoomScene } from "./components/CozyRoomScene";
import { VinylRecord } from "./components/VinylRecord";
import { Tonearm } from "./components/Tonearm";
import { CircularVisualizer } from "./components/CircularVisualizer";
import { ControlDock } from "./components/ControlDock";
import { Disc, Info, Heart, Headphones } from "lucide-react";
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
    selectTrack, // Correctly destructured to resolve undefined error
    audioContext
  } = useAudioAnalyzer();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="relative w-full h-screen min-h-screen overflow-hidden flex flex-col justify-between bg-matte-black text-off-white font-sans selection:bg-amber-glow/30">
      
      {/* 1. Cozy Interactive Pixel Art Background Scene */}
      <CozyRoomScene isPlaying={isPlaying} />

      {/* 2. Procedural Soundscape Synth & Ambient Mixer HUD */}
      <BackgroundAmbience 
        isPlaying={isPlaying} 
        audioContext={audioContext} 
        spinSpeed={spinSpeed} 
      />

      {/* --- HEADER --- */}
      <header className="relative w-full flex items-center justify-between px-6 py-4 md:px-12 md:py-6 z-40 animate-drop-fade select-none">
        
        {/* Retro Brand Label */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center border-2 border-[#100f1a] bg-[#16151f] shadow-md rounded-sm">
            <Disc className={`w-4 h-4 text-[#ffd043] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#ffd043] font-bold leading-none tracking-wider">
              KISSEN
            </h1>
            <p className="font-mono text-[8px] text-[#f7e6c4]/40 uppercase tracking-widest mt-1 leading-none">
              LO-FI LISTENING ROOM
            </p>
          </div>
        </div>

        {/* Dynamic retro indicator lights */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2 text-[9px] text-[#f7e6c4]/60 tracking-wider font-mono uppercase bg-[#16151f] px-3 py-1.5 border-2 border-[#100f1a] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.4)]">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#ffd043] shadow-[0_0_6px_#ffd043] animate-pulse' : 'bg-[#34304b]'}`} />
            <span>{isPlaying ? 'ANALOG SPINNING' : 'SYSTEM IDLE'}</span>
          </div>
        </div>

        {/* Action icons (Cozy pixel squares) */}
        <div className="flex items-center gap-3">
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

      {/* --- TURNTABLE CENTER PIECE --- */}
      <main className="relative flex-grow flex items-center justify-center z-10 px-4 py-4">
        
        {/* Turntable chassis layout */}
        <div className="relative flex items-center justify-center">
          
          {/* Radial 16-bit LED visualizer glowing around the record platter */}
          <CircularVisualizer 
            isPlaying={isPlaying} 
            getByteFrequencyData={getByteFrequencyData} 
          />

          {/* Wooden Turntable Chassis & Rotating Vinyl disc */}
          <VinylRecord 
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            spinSpeed={spinSpeed}
            isScratching={isScratching}
            startScratching={startScratching}
            scratchTo={scratchTo}
            endScratching={endScratching}
          />

          {/* Thick S-Shape mechanical tonearm that pivots and tracks progress */}
          <Tonearm 
            isPlaying={isPlaying} 
            playbackProgress={playbackProgress}
            isScratching={isScratching}
          />

        </div>
      </main>

      {/* --- CONTROL CONSOLE FLOATING DOCK --- */}
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

      {/* --- ABOUT RETRO MENU MODAL --- */}
      <AnimatePresence>
        {aboutOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAboutOpen(false)}
            className="fixed inset-0 w-full h-full bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
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
                KISSEN LO-FI ROOM
              </h3>
              <p className="font-mono text-xs text-[#f7e6c4]/80 leading-relaxed mb-6">
                Inspired by the cozy acoustic atmosphere of Japanese listening bars, 16-bit pixel aesthetics, and rainy Shinjuku nights. 
                <br /><br />
                Interact with the scene! Click the Sleeping Cat to play with it, toggle the Desk Lamp, click the hot tea cup to trigger steam, or tap the window to spark lightning.
                <br /><br />
                All pixel art elements move dynamically when playing analog soundscapes. Drag and scratch the vinyl disc directly to scrub music!
              </p>
              
              <div className="border-t-2 border-[#100f1a] pt-5 flex flex-col gap-2.5 text-[11px] text-[#f7e6c4]/40 font-mono uppercase tracking-wider">
                <p>DESIGNED FOR 16-BIT ACOUSTIC COZY DREAMERS</p>
                <button 
                  onClick={() => setAboutOpen(false)}
                  className="pixel-btn pixel-btn-amber mt-4 w-full text-xs font-bold py-3 border-2 border-[#100f1a] cursor-pointer"
                >
                  ENTER LISTENING ROOM
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
