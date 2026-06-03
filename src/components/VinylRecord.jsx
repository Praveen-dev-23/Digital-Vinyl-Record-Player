import React, { useEffect, useRef, useState } from "react";

export function VinylRecord({ 
  currentTrack, 
  isPlaying, 
  spinSpeed, 
  isScratching,
  startScratching, 
  scratchTo, 
  endScratching 
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const rotationRef = useRef(0);
  const animationFrameRef = useRef(null);
  
  // Drag physics tracking
  const isDraggingRef = useRef(false);
  const prevAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const dragSpeedRef = useRef(0);

  // Speed selection state for turntable (33 vs 45 RPM decoration)
  const [rpmMode, setRpmMode] = useState(33);

  // Spin Loop: Update rotation and draw the pixel art record on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Internal pixel art resolution (128x128 pixels)
    const size = 128;
    canvas.width = size;
    canvas.height = size;

    const drawRecord = () => {
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotationRef.current * Math.PI) / 180);

      // Outer Vinyl Disc
      ctx.fillStyle = "#141122";
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 59, 0, Math.PI * 2);
      ctx.stroke();

      // Concentric Grooves
      ctx.strokeStyle = "#08070d";
      [14, 20, 26, 32, 38, 44, 50, 55].forEach((r) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Subtle groove texture details
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Album Label (vibrant neon pink/cyan/gold)
      ctx.fillStyle = "#ffb800"; // Gold base
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ff3b7e"; // Neon Pink
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#00f0ff"; // Neon Cyan
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f5f3f7"; // Off white core
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Tiny slots to show rotation
      ctx.fillStyle = "#141122";
      ctx.fillRect(-8, -1, 2, 2);
      ctx.fillRect(6, -1, 2, 2);

      // Spindle hole
      ctx.fillStyle = "#08070d";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const updateRotation = () => {
      if (!isDraggingRef.current) {
        rotationRef.current += (spinSpeed || 0) * 3.33;
      }
      
      drawRecord();
      animationFrameRef.current = requestAnimationFrame(updateRotation);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [spinSpeed]);

  const getAngle = (clientX, clientY) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    initDrag(e.clientX, e.clientY);
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      initDrag(e.touches[0].clientX, e.touches[0].clientY);
      
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
  };

  const initDrag = (clientX, clientY) => {
    isDraggingRef.current = true;
    startScratching();
    
    const angle = getAngle(clientX, clientY);
    prevAngleRef.current = angle;
    lastTimeRef.current = performance.now();
    dragSpeedRef.current = 0;
  };

  const processDrag = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    
    const currentAngle = getAngle(clientX, clientY);
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    
    let deltaAngle = currentAngle - prevAngleRef.current;
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    let speed = 0;
    if (dt > 0) {
      speed = deltaAngle / dt;
      dragSpeedRef.current = dragSpeedRef.current * 0.7 + speed * 30 * 0.3;
    }

    rotationRef.current += deltaAngle;
    scratchTo(deltaAngle, dragSpeedRef.current);

    prevAngleRef.current = currentAngle;
    lastTimeRef.current = now;
  };

  const handleMouseMove = (e) => {
    processDrag(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      processDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseUp = () => {
    terminateDrag();
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchEnd = () => {
    terminateDrag();
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  const terminateDrag = () => {
    isDraggingRef.current = false;
    endScratching();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-[345px] h-[345px] md:w-[445px] md:h-[445px] flex items-center justify-center select-none"
    >
      {/* 1. Sleek Cyber Glass Chassis Container */}
      <div 
        className="absolute inset-0 rounded-3xl border border-white/10 bg-[#120f26]/80 backdrop-blur-xl shadow-2xl flex flex-col justify-between p-5"
      >
        <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-3xl" />
        
        {/* Top Label & Decorative Text */}
        <div className="flex justify-between items-center w-full z-10 px-2 pt-1 font-serif text-[10px] text-off-white/40 tracking-wider">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">KISSEN CYBER-16</span>
          <span className="font-sans text-[7px] font-semibold opacity-70">MADE IN SHIBUYA</span>
        </div>

        {/* Bottom Panel Controls */}
        <div className="flex justify-between items-end w-full z-10 px-2 pb-1">
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 bg-neon-cyan/80 shadow-[0_0_8px_rgba(0,240,255,0.5)] rounded-full" />
            <div className="w-2.5 h-2.5 bg-neon-pink/80 shadow-[0_0_8px_rgba(255,59,126,0.5)] rounded-full" />
          </div>

          {/* RPM Buttons Group */}
          <div className="flex gap-2">
            <button 
              onClick={() => setRpmMode(33)}
              className={`w-7 h-7 font-mono text-[9px] rounded-full border border-white/10 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all ${rpmMode === 33 ? 'bg-gradient-to-r from-neon-pink to-amber-glow text-white font-bold border-none shadow-neon-pink/20' : 'bg-white/5 text-off-white/50 hover:bg-white/10'}`}
            >
              33
            </button>
            <button 
              onClick={() => setRpmMode(45)}
              className={`w-7 h-7 font-mono text-[9px] rounded-full border border-white/10 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all ${rpmMode === 45 ? 'bg-gradient-to-r from-neon-pink to-amber-glow text-white font-bold border-none shadow-neon-pink/20' : 'bg-white/5 text-off-white/50 hover:bg-white/10'}`}
            >
              45
            </button>
          </div>
        </div>
      </div>

      {/* 2. Platter circular base */}
      <div 
        className="absolute inset-[15px] rounded-full border border-white/10 shadow-inner"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      />
      
      <div className="absolute inset-[21px] rounded-full border border-dashed border-white/5 opacity-40 pointer-events-none" />

      {/* 3. The Canvas-based rotating vinyl record */}
      <canvas 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`absolute inset-[30px] w-[calc(100%-60px)] h-[calc(100%-60px)] rounded-full cursor-grab active:cursor-grabbing shadow-2xl border border-white/15 ${isScratching ? 'shadow-[0_0_30px_rgba(255,59,126,0.35)]' : ''}`}
        style={{ 
          transformOrigin: "center center"
        }}
      />

      {/* 4. Static vinyl blocky shine overlay */}
      <div className="absolute inset-[30px] rounded-full vinyl-shine pointer-events-none z-10" />

      {/* 5. Center metal spindle cylinder */}
      <div className="absolute w-5 h-5 rounded-full bg-white/10 border border-white/20 shadow-md flex items-center justify-center pointer-events-none z-10">
        <div className="w-1.5 h-1.5 bg-[#ffd043] rounded-full shadow-[0_0_4px_#ffd043]" />
      </div>
    </div>
  );
}
