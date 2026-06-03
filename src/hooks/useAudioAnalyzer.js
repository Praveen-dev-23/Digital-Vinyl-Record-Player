import { useState, useEffect, useRef } from "react";

// List of default luxury ambient tracks
// We use public, copyright-free, stable URLs and provide a fallback procedural audio synth
export const DEFAULT_PLAYLIST = [
  {
    id: "procedural-ambience",
    title: "Tokyo Rainy Night (Synth)",
    artist: "Procedural Ambience",
    album: "Analog Dreams",
    src: "procedural", // Handled by our Web Audio synthesizer
    cover: "rgba(224, 128, 0, 0.15)"
  },
  {
    id: "ambient-1",
    title: "Silent Forest",
    artist: "Lofi Dreamer",
    album: "Quiet Spaces",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "rgba(107, 99, 117, 0.2)"
  },
  {
    id: "ambient-2",
    title: "Late Night Espresso",
    artist: "Satoshi",
    album: "Shibuya Jazz",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "rgba(70, 100, 150, 0.2)"
  }
];

export function useAudioAnalyzer() {
  const [playlist, setPlaylist] = useState(DEFAULT_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isScratching, setIsScratching] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0); // Current visual rotation speed factor (0 to 1)

  const currentTrack = playlist[currentTrackIndex];

  // Refs for audio graph
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Refs for procedural synth
  const synthOscRef = useRef(null);
  const synthFilterRef = useRef(null);
  const synthGainRef = useRef(null);
  const synthIntervalRef = useRef(null);

  // Refs for physics / animation loop
  const physicsFrameRef = useRef(null);
  const targetSpeedRef = useRef(0);
  const currentSpeedRef = useRef(0);

  // Refs to avoid stale closures in single-instance audio event listeners
  const isScratchingRef = useRef(isScratching);
  useEffect(() => {
    isScratchingRef.current = isScratching;
  }, [isScratching]);

  const handleNextRef = useRef(null);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  // Initialize Audio Element (Once on mount)
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.loop = false;
    audioRef.current = audio;

    // Audio element event listeners
    const onTimeUpdate = () => {
      if (!isScratchingRef.current && audio.duration) {
        setCurrentTime(audio.currentTime);
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 180);
    };

    const onEnded = () => {
      if (handleNextRef.current) {
        handleNextRef.current();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      cancelAnimationFrame(physicsFrameRef.current);
      stopProceduralSynth();
    };
  }, []); // Run strictly once on mount to keep single Web Audio source binding intact

  // Handle source changes when track selection or playlist contents change
  useEffect(() => {
    if (!audioRef.current) return;

    // If it's a procedural track, we handle duration manually and bypass audio.src loading
    if (currentTrack.src === "procedural") {
      setDuration(300); // 5 minutes virtual duration
      setCurrentTime(0);
      setPlaybackProgress(0);
      audioRef.current.src = "";
    } else {
      audioRef.current.src = currentTrack.src;
      audioRef.current.load();
      // Set volume
      audioRef.current.volume = volume;
    }
  }, [currentTrackIndex, currentTrack?.id]);


  // Setup Web Audio nodes on first interaction
  const initWebAudio = () => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainNodeRef.current = gain;

      // Source for physical audio element
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current = source;

      // Connect nodes
      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn("Failed to initialize Web Audio API:", e);
    }
  };

  // Start procedural background synth pad
  const startProceduralSynth = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Create a beautiful, soft, low-frequency atmospheric drone chord
    // C2 (65.4Hz), G2 (98.0Hz), C3 (130.8Hz), E3 (164.8Hz), G3 (196.0Hz)
    const freqs = [65.41, 98.00, 130.81, 164.81, 196.00];
    const oscillators = [];

    // Master filter for the drone
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    synthFilterRef.current = filter;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume * 0.12, ctx.currentTime + 3);
    synthGainRef.current = masterGain;

    // Connect filter and master gain to analyzer
    filter.connect(masterGain);
    if (analyserRef.current) {
      masterGain.connect(analyserRef.current);
    } else {
      masterGain.connect(ctx.destination);
    }

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = index % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slight detune for lush chorus effect
      osc.detune.setValueAtTime((Math.random() - 0.5) * 15, ctx.currentTime);

      // Low volume per oscillator
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    synthOscRef.current = oscillators;

    // LFO to slowly sweep the filter cutoff for movement
    let sweepDir = 1;
    let currentCutoff = 250;
    synthIntervalRef.current = setInterval(() => {
      if (!filter || !ctx) return;
      currentCutoff += sweepDir * (1 + Math.random() * 2);
      if (currentCutoff > 450) sweepDir = -1;
      if (currentCutoff < 180) sweepDir = 1;
      filter.frequency.setTargetAtTime(currentCutoff, ctx.currentTime, 0.5);
    }, 100);
  };

  const stopProceduralSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }

    if (synthGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      try {
        synthGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        synthGainRef.current.gain.setValueAtTime(synthGainRef.current.gain.value, ctx.currentTime);
        synthGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch (e) {}
    }

    setTimeout(() => {
      if (synthOscRef.current) {
        synthOscRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {}
        });
        synthOscRef.current = null;
      }
    }, 600);
  };

  // Physics animation loop: Handles inertia spin-up / spin-down
  // Updates currentSpeedRef towards targetSpeedRef and applies to audio playbackRate
  useEffect(() => {
    const updatePhysics = () => {
      const acceleration = 0.03; // Smooth spin up rate
      const deceleration = 0.015; // Smooth slow down (inertia)
      const diff = targetSpeedRef.current - currentSpeedRef.current;

      if (Math.abs(diff) > 0.001) {
        if (diff > 0) {
          currentSpeedRef.current += diff * acceleration;
        } else {
          currentSpeedRef.current += diff * deceleration;
        }
        setSpinSpeed(currentSpeedRef.current);

        // Apply pitch/speed to actual audio element
        if (audioRef.current && currentTrack.src !== "procedural") {
          // Keep playbackRate within browser limits [0.0625, 16]
          // If speed is very low, audio will pause anyway, but we keep it safe
          if (currentSpeedRef.current > 0.08) {
            audioRef.current.playbackRate = currentSpeedRef.current;
            if (audioRef.current.paused && isPlaying) {
              audioRef.current.play().catch(() => {});
            }
          } else {
            audioRef.current.playbackRate = 0.0625;
            if (!audioRef.current.paused && !isScratching) {
              audioRef.current.pause();
            }
          }
        }

        // Simulating progressive currentTime for procedural track
        if (currentTrack.src === "procedural" && isPlaying && !isScratching) {
          setCurrentTime(prev => {
            const next = prev + (currentSpeedRef.current * (1 / 60)); // 60fps approximation
            if (next >= duration) {
              handleNext();
              return 0;
            }
            setPlaybackProgress((next / duration) * 100);
            return next;
          });
        }
      } else {
        // Snap to target
        currentSpeedRef.current = targetSpeedRef.current;
        setSpinSpeed(currentSpeedRef.current);

        if (currentSpeedRef.current === 0) {
          if (audioRef.current && !audioRef.current.paused && !isScratching) {
            audioRef.current.pause();
          }
        }
      }

      physicsFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    physicsFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => cancelAnimationFrame(physicsFrameRef.current);
  }, [isPlaying, currentTrackIndex, duration]);

  // Main playback controls
  const handlePlayPause = () => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      // Pause action: Trigger deceleration
      targetSpeedRef.current = 0;
      setIsPlaying(false);
      if (currentTrack.src === "procedural") {
        stopProceduralSynth();
      }
    } else {
      // Play action: Trigger acceleration
      targetSpeedRef.current = 1;
      setIsPlaying(true);
      
      if (currentTrack.src === "procedural") {
        startProceduralSynth();
      } else {
        // Start playing the element (even at low speed, loop will manage playbackRate)
        if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.play().catch(err => {
            console.log("Autoplay blocked or playback error:", err);
          });
        }
      }
    }
  };

  const handleNext = () => {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    
    const wasPlaying = isPlaying;
    if (wasPlaying && currentTrack.src === "procedural") {
      stopProceduralSynth();
    }

    setCurrentTrackIndex(nextIndex);
    
    // Maintain play state
    if (wasPlaying) {
      targetSpeedRef.current = 1;
      currentSpeedRef.current = 0.1; // small jump start
      setTimeout(() => {
        if (playlist[nextIndex].src === "procedural") {
          startProceduralSynth();
        } else if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }, 50);
    } else {
      targetSpeedRef.current = 0;
      currentSpeedRef.current = 0;
    }
  };

  const handlePrev = () => {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    
    const wasPlaying = isPlaying;
    if (wasPlaying && currentTrack.src === "procedural") {
      stopProceduralSynth();
    }

    setCurrentTrackIndex(prevIndex);

    if (wasPlaying) {
      targetSpeedRef.current = 1;
      currentSpeedRef.current = 0.1;
      setTimeout(() => {
        if (playlist[prevIndex].src === "procedural") {
          startProceduralSynth();
        } else if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }, 50);
    } else {
      targetSpeedRef.current = 0;
      currentSpeedRef.current = 0;
    }
  };

  const handleSeek = (percentage) => {
    const targetTime = (percentage / 100) * duration;
    setCurrentTime(targetTime);
    setPlaybackProgress(percentage);
    
    if (currentTrack.src !== "procedural" && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (newVolume) => {
    const val = parseFloat(newVolume);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
    }
    if (synthGainRef.current && audioContextRef.current) {
      synthGainRef.current.gain.setValueAtTime(val * 0.12, audioContextRef.current.currentTime);
    }
  };

  // Upload a user audio file
  const handleAudioUpload = (file) => {
    const objectUrl = URL.createObjectURL(file);
    const newTrack = {
      id: `uploaded-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
      artist: "Uploaded Audio",
      album: "Local Vinyl",
      src: objectUrl,
      cover: "rgba(224, 128, 0, 0.1)" // default warm cover tone
    };

    // Prepend to playlist
    setPlaylist(prev => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    targetSpeedRef.current = 0;
    currentSpeedRef.current = 0;
    setPlaybackProgress(0);
    setCurrentTime(0);
    
    // Stop procedural synth if it was running
    stopProceduralSynth();
  };

  // Hook interface for scratch interactions
  // Updates current time based on angular displacement
  const startScratching = () => {
    setIsScratching(true);
    initWebAudio();
    if (audioRef.current && currentTrack.src !== "procedural") {
      audioRef.current.muted = true; // Mute main track while scratching to overlay scratch audio
    }
  };

  const scratchTo = (angleDelta, dragSpeed) => {
    if (!isScratching) return;
    
    // 1. Calculate new time offset based on rotation delta
    // A full rotation (360 deg) translates to roughly 3 seconds of scrubbing
    const secondsPerDegree = 3 / 360;
    const timeDelta = angleDelta * secondsPerDegree;

    setCurrentTime(prev => {
      let next = prev + timeDelta;
      if (next < 0) next = 0;
      if (next > duration) next = duration;
      
      // Update actual audio playhead
      if (audioRef.current && currentTrack.src !== "procedural") {
        audioRef.current.currentTime = next;
      }
      setPlaybackProgress((next / duration) * 100);
      return next;
    });

    // 2. Adjust visual speed based on drag speed
    // Cap visual speed representation so it matches rotation
    const velocityFactor = Math.min(Math.max(dragSpeed / 5, -3), 3);
    currentSpeedRef.current = velocityFactor;
    setSpinSpeed(velocityFactor);

    // Play a brief high-frequency scratching synthesizer sweep!
    if (audioContextRef.current && Math.abs(dragSpeed) > 0.5) {
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bandpass filter to sound scratchy
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800 + Math.abs(dragSpeed) * 300, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80 + Math.abs(dragSpeed) * 40, ctx.currentTime);
      // Sweeping frequency
      osc.frequency.exponentialRampToValueAtTime(100 + Math.abs(dragSpeed) * 200, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(analyserRef.current || ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    }
  };

  const endScratching = () => {
    setIsScratching(false);
    if (audioRef.current) {
      audioRef.current.muted = false;
    }
    
    // Restore playback speed smoothly
    targetSpeedRef.current = isPlaying ? 1 : 0;
  };

  // Expose frequency analyzer data
  const getByteFrequencyData = () => {
    if (!analyserRef.current) return null;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  };

  const selectTrack = (index) => {
    if (index >= 0 && index < playlist.length) {
      const wasPlaying = isPlaying;
      if (wasPlaying && currentTrack.src === "procedural") {
        stopProceduralSynth();
      }

      setCurrentTrackIndex(index);

      if (wasPlaying) {
        targetSpeedRef.current = 1;
        currentSpeedRef.current = 0.1;
        setTimeout(() => {
          if (playlist[index].src === "procedural") {
            startProceduralSynth();
          } else if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        }, 50);
      } else {
        targetSpeedRef.current = 0;
        currentSpeedRef.current = 0;
      }
    }
  };

  return {
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
    audioContext: audioContextRef.current
  };
}

