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

  // Time formatting helper (e.g. 03:45)
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
      
      {/* --- RETRO PLAYLIST DRAWER (CASSETTE RACK) --- */}
      <AnimatePresence>
        {playlistOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-[calc(100%+16px)] left-4 right-4 md:left-6 md:right-6 glass-panel rounded-xl p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] overflow-hidden max-h-72 flex flex-col z-30 border-[4px] border-[#100f1a]"
          >
            <div className="flex justify-between items-center mb-3 border-b-2 border-[#100f1a] pb-2">
              <span className="font-serif tracking-wider text-sm uppercase text-[#ffd043] flex items-center gap-2">
                <ListMusic className="w-4 h-4" />
                RETRO CASSETTE RACK
              </span>
              <span className="text-[10px] font-mono text-[#f7e6c4]/60">
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
                    className={`w-full flex items-center justify-between p-2 border-2 border-[#100f1a] transition-all cursor-pointer ${isActive ? 'bg-[#ff7ea5] text-[#100f1a] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.3)]' : 'bg-[#16151f] hover:bg-[#34304b] text-[#f7e6c4]/80'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Pixel Cassette Graphic Icon */}
                      <div 
                        className={`w-10 h-7 border-2 border-[#100f1a] flex flex-col justify-between p-0.5 rounded-sm shrink-0 shadow-sm ${isActive ? 'bg-[#ffd043]' : 'bg-[#211f30]'}`}
                      >
                        {/* cassette reels holes */}
                        <div className="flex justify-around items-center h-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#100f1a]" />
                          <div className="w-2.5 h-1 bg-[#100f1a] opacity-30 rounded-sm" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#100f1a]" />
                        </div>
                        {/* tape brand strip */}
                        <div className="w-full h-1 bg-[#ff7ea5] opacity-80" />
                      </div>

                      <div className="overflow-hidden text-left">
                        <p className={`font-mono text-xs truncate leading-none mb-1 font-bold ${isActive ? 'text-[#100f1a]' : 'text-[#f7e6c4]'}`}>
                          {track.title}
                        </p>
                        <p className={`font-mono text-[9px] truncate leading-none ${isActive ? 'text-[#100f1a]/80' : 'text-[#f7e6c4]/50'}`}>
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`text-[8px] font-mono tracking-wider py-0.5 px-1.5 border border-[#100f1a] uppercase ${isActive ? 'bg-[#100f1a] text-[#ffd043]' : 'bg-[#0d0c10] text-[#f7e6c4]/40'}`}>
                      {track.src === "procedural" ? "SYNTH" : "AUDIO"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTROL DOCK --- */}
      <div 
        className="rounded-2xl border-[6px] border-[#100f1a] p-5 md:p-6 shadow-[8px_12px_0px_rgba(0,0,0,0.5)] flex flex-col gap-4"
        style={{
          backgroundColor: "#5a3825", // Wood frame style
          backgroundImage: "linear-gradient(to bottom, #5a3825, #4d2f1f)",
        }}
      >
        
        {/* Track Title and Artist */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Metadata Display Screen */}
          <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-grow md:max-w-[40%]">
            <button 
              onClick={() => setPlaylistOpen(!playlistOpen)}
              className="flex items-center justify-center w-12 h-12 border-4 border-[#100f1a] bg-[#ffd043] hover:bg-[#ff7ea5] text-[#100f1a] transition-all cursor-pointer shrink-0 shadow-[2px_3px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            
            {/* Display screen box (inset green terminal look) */}
            <div className="min-w-0 flex-grow px-3 py-2 border-2 border-[#100f1a] bg-[#16151f] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.6)]">
              <h2 className="font-mono text-sm text-[#ffd043] tracking-wide truncate leading-tight font-bold">
                {currentTrack?.title || "NO TAPE LOADED"}
              </h2>
              <p className="font-mono text-[9px] text-[#ff7ea5] uppercase tracking-widest truncate leading-none mt-1.5">
                {currentTrack?.artist || "UNKNOWN"} // <span className="italic">{currentTrack?.album || "UNKNOWN ALBUM"}</span>
              </p>
            </div>
          </div>

          {/* Transport Main Controls (Center Panel) */}
          <div className="flex items-center justify-center gap-4 shrink-0 self-center">
            {/* Prev Track */}
            <button 
              onClick={handlePrev}
              className="w-10 h-10 border-2 border-[#100f1a] bg-[#34304b] hover:bg-[#211f30] text-[#f7e6c4] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]"
            >
              <SkipBack className="w-4 h-4 fill-current text-[#f7e6c4]" />
            </button>

            {/* Play/Pause Button */}
            <button 
              onClick={handlePlayPause}
              className="w-14 h-14 border-4 border-[#100f1a] bg-[#ffd043] hover:bg-[#ff7ea5] text-[#100f1a] shadow-[3px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current text-[#100f1a]" />
              ) : (
                <Play className="w-6 h-6 pl-0.5 fill-current text-[#100f1a]" />
              )}
            </button>

            {/* Next Track */}
            <button 
              onClick={handleNext}
              className="w-10 h-10 border-2 border-[#100f1a] bg-[#34304b] hover:bg-[#211f30] text-[#f7e6c4] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]"
            >
              <SkipForward className="w-4 h-4 fill-current text-[#f7e6c4]" />
            </button>
          </div>

          {/* Side Controls: Volume & File Upload */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t border-[#100f1a]/20 pt-3 md:pt-0 md:border-none">
            
            {/* Volume Console Panel */}
            <div className="flex items-center gap-2 border-2 border-[#100f1a] bg-[#16151f] px-3 py-1.5 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.4)]">
              <button 
                onClick={toggleMute}
                className="text-[#ff7ea5] hover:text-[#ffd043] cursor-pointer"
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

            {/* File Upload Button (Cozy tape loader) */}
            <label className="flex items-center gap-2 px-3 py-2.5 border-2 border-[#100f1a] bg-[#4ba3a5] hover:bg-[#ff7ea5] text-[#100f1a] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] cursor-pointer text-xs font-mono font-bold uppercase">
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

        {/* --- SCROLLER PROGRESS BAR (Level Meter) --- */}
        <div className="flex items-center gap-3 w-full border-t-2 border-[#100f1a]/20 pt-3.5">
          <span className="text-[10px] text-[#f7e6c4]/80 font-mono w-12 text-right">
            {formatTime(currentTime)}
          </span>
          
          {/* Custom Pixel Progress Bar Slider */}
          <div className="relative flex-grow flex items-center h-4 border-2 border-[#100f1a] bg-[#0d0c10] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.6)]">
            <input 
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={playbackProgress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            {/* Dithered progress fill */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-[#ff7ea5] pointer-events-none"
              style={{ 
                width: `${playbackProgress}%`,
                boxShadow: "inset -2px 0px 0px rgba(0,0,0,0.3)"
              }}
            />
            
            {/* Slider knob line representation */}
            <div 
              className="absolute w-2 h-full bg-[#ffd043] border-x border-[#100f1a] pointer-events-none"
              style={{ left: `calc(${playbackProgress}% - 4px)` }}
            />
          </div>
          
          <span className="text-[10px] text-[#f7e6c4]/80 font-mono w-12">
            {formatTime(duration)}
          </span>
        </div>

      </div>
    </div>
  );
}
