import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Upload, 
  ListMusic, 
  Disc 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ControlDock({
  currentTrack,
  playlist,
  isPlaying,
  playbackProgress,
  currentTime,
  duration,
  volume,
  handlePlayPause,
  handleNext,
  handlePrev,
  handleSeek,
  handleVolumeChange,
  handleAudioUpload,
  playlistIndex,
  onSelectTrack
}) {
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleMute = () => {
    if (muted) {
      handleVolumeChange(prevVolume);
      setMuted(false);
    } else {
      setPrevVolume(volume);
      handleVolumeChange(0);
      setMuted(true);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleAudioUpload(e.target.files[0]);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 z-40 mb-8 animate-drop-fade select-none">
      
      {/* --- MODERN PLAYLIST DRAWER (CASSETTE RACK) --- */}
      <AnimatePresence>
        {playlistOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-[calc(100%+16px)] left-4 right-4 md:left-6 md:right-6 glass-panel p-5 overflow-hidden max-h-72 flex flex-col z-30"
          >
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
              <span className="font-serif tracking-wider text-sm uppercase text-[#ffd043] flex items-center gap-2">
                <ListMusic className="w-4 h-4" />
                RETRO CASSETTE RACK
              </span>
              <span className="text-[10px] font-mono text-off-white/60">
                {playlist.length} TAPES
              </span>
            </div>
            
            <div className="overflow-y-auto pr-1 flex flex-col gap-2 flex-grow scrollbar-thin">
              {playlist.map((track, index) => {
                const isActive = track.id === currentTrack?.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      onSelectTrack(index);
                      setPlaylistOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 transition-all cursor-pointer ${isActive ? 'bg-neon-pink/15 text-white border-neon-pink/30 shadow-lg' : 'bg-white/5 hover:bg-white/10 text-off-white/80'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Modern cassette style indicator */}
                      <div 
                        className={`w-10 h-7 border border-white/10 flex flex-col justify-between p-0.5 rounded-md shrink-0 shadow-sm ${isActive ? 'bg-neon-pink/20' : 'bg-white/5'}`}
                      >
                        <div className="flex justify-around items-center h-full">
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-neon-pink' : 'bg-white/20'}`} />
                          <div className={`w-2.5 h-1 opacity-30 rounded-sm ${isActive ? 'bg-neon-pink' : 'bg-white/10'}`} />
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-neon-pink' : 'bg-white/20'}`} />
                        </div>
                        <div className="w-full h-1 bg-neon-pink opacity-80 rounded-b-sm" />
                      </div>

                      <div className="overflow-hidden text-left">
                        <p className={`font-sans text-xs truncate leading-none mb-1 font-bold ${isActive ? 'text-[#ffd043]' : 'text-off-white'}`}>
                          {track.title}
                        </p>
                        <p className={`font-sans text-[10px] truncate leading-none ${isActive ? 'text-white/85' : 'text-off-white/50'}`}>
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`text-[8px] font-mono tracking-wider py-0.5 px-2 rounded-full border border-white/10 uppercase ${isActive ? 'bg-neon-pink text-white border-none' : 'bg-black/30 text-off-white/40'}`}>
                      {track.src === "procedural" ? "SYNTH" : "AUDIO"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN GLASS CONTROL DOCK --- */}
      <div className="glass-panel p-5 md:p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Track Title and Artist */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Metadata Display Screen */}
          <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-grow md:max-w-[40%]">
            <button 
              onClick={() => setPlaylistOpen(!playlistOpen)}
              className="flex items-center justify-center w-11 h-11 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-off-white/70 hover:text-[#ffd043] transition-all cursor-pointer shrink-0 shadow-lg active:scale-95"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            
            <div className="min-w-0 flex-grow px-4 py-2 border border-white/5 rounded-xl bg-black/40 shadow-inner">
              <h2 className="font-sans text-sm text-[#ffd043] tracking-wide truncate leading-tight font-bold">
                {currentTrack?.title || "NO TAPE LOADED"}
              </h2>
              <p className="font-sans text-[9px] text-[#ff7ea5] uppercase tracking-widest truncate leading-none mt-1.5 font-semibold">
                {currentTrack?.artist || "UNKNOWN"} // <span className="italic opacity-80">{currentTrack?.album || "UNKNOWN ALBUM"}</span>
              </p>
            </div>
          </div>

          {/* Transport Main Controls */}
          <div className="flex items-center justify-center gap-4 shrink-0 self-center">
            {/* Prev Track */}
            <button 
              onClick={handlePrev}
              className="w-10 h-10 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/20 text-off-white/80 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <SkipBack className="w-4 h-4 fill-current text-off-white" />
            </button>

            {/* Play/Pause Button */}
            <button 
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-pink to-amber-glow text-white shadow-lg shadow-neon-pink/20 hover:shadow-neon-pink/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current text-white" />
              ) : (
                <Play className="w-6 h-6 pl-0.5 fill-current text-white" />
              )}
            </button>

            {/* Next Track */}
            <button 
              onClick={handleNext}
              className="w-10 h-10 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/20 text-off-white/80 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <SkipForward className="w-4 h-4 fill-current text-off-white" />
            </button>
          </div>

          {/* Side Controls: Volume & File Upload */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t border-white/10 pt-3 md:pt-0 md:border-none">
            
            {/* Volume Console Panel */}
            <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/25 px-3 py-1.5 shadow-inner">
              <button 
                onClick={toggleMute}
                className="text-neon-pink hover:text-[#ffd043] cursor-pointer"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setMuted(false);
                  handleVolumeChange(parseFloat(e.target.value));
                }}
                className="w-20 md:w-24 cursor-pointer"
              />
            </div>

            {/* File Upload Button */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-off-white/80 hover:text-white transition-all cursor-pointer text-xs font-mono font-bold uppercase shadow-lg active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>LOAD TAPE</span>
              <input 
                type="file" 
                accept="audio/mp3,audio/wav,audio/mpeg" 
                onChange={onFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* --- SCROLLER PROGRESS BAR --- */}
        <div className="flex items-center gap-3 w-full border-t border-white/10 pt-3.5">
          <span className="text-[10px] text-off-white/80 font-mono w-12 text-right">
            {formatTime(currentTime)}
          </span>
          
          <div className="relative flex-grow flex items-center h-2.5 rounded-full bg-white/10 overflow-hidden">
            <input 
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={playbackProgress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            {/* Smooth progress fill */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-neon-pink to-amber-glow pointer-events-none"
              style={{ width: `${playbackProgress}%` }}
            />
            
            {/* Slider knob */}
            <div 
              className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none border border-black/20"
              style={{ left: `calc(${playbackProgress}% - 7px)` }}
            />
          </div>
          
          <span className="text-[10px] text-off-white/80 font-mono w-12">
            {formatTime(duration)}
          </span>
        </div>

      </div>
    </div>
  );
}
