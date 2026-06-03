import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Sparkles } from "lucide-react";

export function BackgroundAmbience({ isPlaying, audioContext, spinSpeed }) {
  const [rainEnabled, setRainEnabled] = useState(true);
  const [crackleEnabled, setCrackleEnabled] = useState(true);
  const [rainVolume, setRainVolume] = useState(0.2);
  const [crackleVolume, setCrackleVolume] = useState(0.15);

  // Refs for procedural rain synthesis
  const rainSourceRef = useRef(null);
  const rainGainRef = useRef(null);
  const rainFilterRef = useRef(null);

  // Refs for crackle synthesis
  const crackleSourceRef = useRef(null);
  const crackleGainRef = useRef(null);
  const crackleIntervalRef = useRef(null);

  // Procedural Sound Effects (Rain & Record Crackles)
  useEffect(() => {
    if (!audioContext) return;

    // --- Synthesize Rain ---
    if (rainEnabled) {
      if (!rainSourceRef.current) {
        try {
          const bufferSize = 2 * audioContext.sampleRate;
          const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          
          // Generate White Noise
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const noiseNode = audioContext.createBufferSource();
          noiseNode.buffer = noiseBuffer;
          noiseNode.loop = true;

          // Lowpass filter to create "rumbling water/rain" character
          const filter = audioContext.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(380, audioContext.currentTime);

          // Gain control
          const gain = audioContext.createGain();
          gain.gain.setValueAtTime(0, audioContext.currentTime);
          gain.gain.linearRampToValueAtTime(rainVolume * 0.4, audioContext.currentTime + 2.0);

          noiseNode.connect(filter);
          filter.connect(gain);
          gain.connect(audioContext.destination);

          noiseNode.start();
          
          rainSourceRef.current = noiseNode;
          rainGainRef.current = gain;
          rainFilterRef.current = filter;
        } catch (e) {
          console.warn("Failed to start rain synthesis:", e);
        }
      }
    } else {
      stopRain();
    }

    // --- Synthesize Vinyl Crackle ---
    // Crackles only play when spinning/playing or record is touching
    const shouldPlayCrackle = crackleEnabled && (isPlaying || Math.abs(spinSpeed) > 0.05);
    
    if (shouldPlayCrackle) {
      if (!crackleIntervalRef.current) {
        try {
          const gainNode = audioContext.createGain();
          gainNode.gain.setValueAtTime(crackleVolume * 0.25, audioContext.currentTime);
          gainNode.connect(audioContext.destination);
          crackleGainRef.current = gainNode;

          // Randomly trigger micro-pops and crackles
          crackleIntervalRef.current = setInterval(() => {
            if (!audioContext || audioContext.state === "suspended") return;

            const time = audioContext.currentTime;
            
            // Random pop
            if (Math.random() < 0.28) {
              const osc = audioContext.createOscillator();
              const filter = audioContext.createBiquadFilter();
              const gain = audioContext.createGain();

              filter.type = "bandpass";
              filter.frequency.setValueAtTime(1200 + Math.random() * 2000, time);
              filter.Q.setValueAtTime(8, time);

              // High frequency pop pulse
              osc.type = "sawtooth";
              osc.frequency.setValueAtTime(100 + Math.random() * 400, time);

              gain.gain.setValueAtTime(0, time);
              // extremely short sharp gain spike
              gain.gain.linearRampToValueAtTime(0.005 + Math.random() * 0.015, time + 0.001);
              gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);

              osc.connect(filter);
              filter.connect(gain);
              gain.connect(gainNode);

              osc.start(time);
              osc.stop(time + 0.02);
            }

            // Low frequency rumble/hiss
            if (Math.random() < 0.1) {
              const osc = audioContext.createOscillator();
              const filter = audioContext.createBiquadFilter();
              const gain = audioContext.createGain();

              filter.type = "lowpass";
              filter.frequency.setValueAtTime(180, time);

              osc.type = "triangle";
              osc.frequency.setValueAtTime(45 + Math.random() * 20, time);

              gain.gain.setValueAtTime(0, time);
              gain.gain.linearRampToValueAtTime(0.008, time + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);

              osc.connect(filter);
              filter.connect(gain);
              gain.connect(gainNode);

              osc.start(time);
              osc.stop(time + 0.35);
            }
          }, 60);

        } catch (e) {
          console.warn("Failed to start crackle synthesis:", e);
        }
      }
    } else {
      stopCrackle();
    }

    return () => {
      // Don't kill audio on quick re-renders, but clean up on unmount
    };
  }, [rainEnabled, crackleEnabled, isPlaying, spinSpeed, audioContext]);

  // Handle volume adjustments dynamically
  useEffect(() => {
    if (rainGainRef.current && audioContext) {
      rainGainRef.current.gain.setTargetAtTime(rainVolume * 0.4, audioContext.currentTime, 0.2);
    }
  }, [rainVolume]);

  useEffect(() => {
    if (crackleGainRef.current && audioContext) {
      crackleGainRef.current.gain.setTargetAtTime(crackleVolume * 0.25, audioContext.currentTime, 0.2);
    }
  }, [crackleVolume]);

  const stopRain = () => {
    if (rainSourceRef.current) {
      try {
        rainSourceRef.current.stop();
      } catch (e) {}
      rainSourceRef.current = null;
    }
    rainGainRef.current = null;
    rainFilterRef.current = null;
  };

  const stopCrackle = () => {
    if (crackleIntervalRef.current) {
      clearInterval(crackleIntervalRef.current);
      crackleIntervalRef.current = null;
    }
    crackleGainRef.current = null;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopRain();
      stopCrackle();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10 select-none">
      {/* Ambient noise texturing layer */}
      <div className="noise-background" />

      {/* Audio Ambiance HUD controls (floating side deck) - pointer events enabled */}
      <div 
        className="absolute left-6 top-[28%] z-50 pointer-events-auto flex flex-col gap-4 p-4 rounded-xl w-48 text-[#f7e6c4] text-xs drop-shadow-xl translate-y-[-50%] border-[4px] border-[#100f1a] animate-drop-fade"
        style={{
          backgroundColor: "#5a3825", // Wood deck
          backgroundImage: "linear-gradient(to bottom, #5a3825, #4d2f1f)",
        }}
      >
        <h4 className="font-mono uppercase tracking-wider text-[10px] text-[#ffd043] border-b-2 border-[#100f1a] pb-2 mb-1 font-bold">
          AMBIENT MIXER
        </h4>

        {/* Rain Sound toggle/volume */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setRainEnabled(!rainEnabled)}
              className={`flex items-center gap-2 transition-colors cursor-pointer font-bold ${rainEnabled ? 'text-[#ffd043]' : 'text-[#f7e6c4]/40'}`}
            >
              <CloudRain className="w-4 h-4 text-[#ff7ea5]" />
              <span>RAIN SOUND</span>
            </button>
            <span className="text-[9px] font-mono text-[#f7e6c4]/60">{rainEnabled ? 'ON' : 'OFF'}</span>
          </div>
          {rainEnabled && (
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={rainVolume}
              onChange={(e) => setRainVolume(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          )}
        </div>

        {/* Vinyl Crackle toggle/volume */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setCrackleEnabled(!crackleEnabled)}
              className={`flex items-center gap-2 transition-colors cursor-pointer font-bold ${crackleEnabled ? 'text-[#ffd043]' : 'text-[#f7e6c4]/40'}`}
            >
              <Sparkles className="w-4 h-4 text-[#ffd043]" />
              <span>VINYL CRACKLE</span>
            </button>
            <span className="text-[9px] font-mono text-[#f7e6c4]/60">{crackleEnabled ? 'ON' : 'OFF'}</span>
          </div>
          {crackleEnabled && (
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={crackleVolume}
              onChange={(e) => setCrackleVolume(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          )}
        </div>
      </div>
    </div>
  );
}
