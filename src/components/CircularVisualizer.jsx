import React, { useEffect, useRef } from "react";

export function CircularVisualizer({ isPlaying, getByteFrequencyData }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const smoothDataRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Set canvas resolution with high DPI support (retina display compatibility)
    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Number of visualizer bars around the circle
    const numBars = 72;
    
    // Initialize smoothing array
    if (smoothDataRef.current.length !== numBars) {
      smoothDataRef.current = new Array(numBars).fill(0);
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Base radius of the visualizer (just outside the turntable wood border)
      // Platter is 345px to 445px, so radius is ~180px to 230px.
      const baseRadius = Math.min(width, height) * 0.44; 
      
      // Maximum number of LED blocks in a column
      const maxLEDs = 8;
      const blockWidth = 4; // size of pixel blocks
      const blockHeight = 3;
      const blockGap = 5;   // radial spacing between blocks

      // Fetch fresh frequency data
      let data = null;
      if (isPlaying) {
        data = getByteFrequencyData();
      }

      // Draw the radial LED grid
      for (let i = 0; i < numBars; i++) {
        let val = 0;
        if (data && data.length > 0) {
          // Sample the frequency data array
          // Focus mostly on low to mid frequencies (first 2/3 of spectrum) for visual richness
          const sampleIndex = Math.floor((i < numBars / 2 ? i : numBars - i) * (data.length / (numBars * 1.3)));
          val = (data[sampleIndex] || 0) / 255;
        }

        // Apply a breathing resting animation if not playing
        if (!isPlaying) {
          const breathingFactor = Math.sin(Date.now() * 0.002 + i * 0.1) * 0.5 + 0.5; // 0 to 1
          val = 0.05 + breathingFactor * 0.08; // extremely subtle pulse
        }

        // Smoothing calculation: Lerp values to avoid jitter
        smoothDataRef.current[i] = smoothDataRef.current[i] * 0.75 + val * 0.25;
        
        // Convert smoothed float value (0 to 1) into number of glowing LEDs (0 to maxLEDs)
        const activeLEDCount = Math.min(Math.floor(smoothDataRef.current[i] * (maxLEDs + 2)), maxLEDs);
        
        const angle = (i / numBars) * 2 * Math.PI - Math.PI / 2; // Start from top

        // Draw the LED blocks stack radially
        for (let step = 0; step < maxLEDs; step++) {
          const isActive = step < activeLEDCount;
          
          // Radial distance of this block
          const r = baseRadius + step * blockGap + 4;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          // Cozy LED color mapping: Base is Teal, Mid is Pink, Top is Gold
          let ledColor = "rgba(75, 163, 165, 0.1)"; // Default dim unlit teal
          if (isActive) {
            if (step < 4) {
              ledColor = "#4ba3a5"; // Lit Teal
            } else if (step < 7) {
              ledColor = "#ff7ea5"; // Lit Pink
            } else {
              ledColor = "#ffd043"; // Lit Gold Peak
            }
          }

          // Draw pixel block (as a small rotated rect or simple un-rotated square for pixel clarity)
          ctx.fillStyle = ledColor;
          ctx.fillRect(Math.floor(x - blockWidth / 2), Math.floor(y - blockHeight / 2), blockWidth, blockHeight);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, getByteFrequencyData]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute w-[390px] h-[390px] md:w-[500px] md:h-[500px] pointer-events-none z-10"
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "540px",
        maxHeight: "540px",
        imageRendering: "pixelated"
      }}
    />
  );
}
