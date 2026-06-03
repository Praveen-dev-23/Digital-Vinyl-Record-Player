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
      // 1. Clear canvas
      ctx.clearRect(0, 0, size, size);

      // 2. Rotate the drawing context
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotationRef.current * Math.PI) / 180);

      // 3. Draw Outer Vinyl Disc (matte black/dark purple)
      ctx.fillStyle = "#161420";
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim highlight (pixel style)
      ctx.strokeStyle = "#252234";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 59, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Concentric Grooves (pixel rings)
      ctx.strokeStyle = "#0d0c12";
      [14, 20, 26, 32, 38, 44, 50, 55].forEach((r) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Subtle groove texture details (dots/dashes)
      ctx.strokeStyle = "#1d1a29";
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // 5. Center Album Label (16-bit retro colors, pink and cyan ring)
      // Base label circle
      ctx.fillStyle = "#ffd043"; // Gold base
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Outer label ring (cozy pink)
      ctx.fillStyle = "#ff7ea5";
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Inner label ring (vibrant cyan)
      ctx.fillStyle = "#4ba3a5";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Center label core (off white)
      ctx.fillStyle = "#f7e6c4";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Tiny pixel slots to show label rotation/texture
      ctx.fillStyle = "#161420";
      ctx.fillRect(-8, -1, 2, 2);
      ctx.fillRect(6, -1, 2, 2);

      // 6. Spindle hole (center absolute dark)
      ctx.fillStyle = "#0d0c12";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const updateRotation = () => {
      if (!isDraggingRef.current) {
        // 33.3 RPM is ~200 degrees/second. At 60 FPS, this is ~3.33 degrees per frame.
        // We multiply by spinSpeed (managed by inertia/physics in hook)
        rotationRef.current += spinSpeed * 3.33;
      }
      
      drawRecord();
      animationFrameRef.current = requestAnimationFrame(updateRotation);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [spinSpeed]);

  // Calculate angle of coordinate relative to vinyl center
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

    // Report scratch values back to audio analyzer
    scratchTo(deltaAngle, dragSpeedRef.current);

    prevAngleRef.current = currentAngle;
    lastTimeRef.current = now;
  };

  const handleMouseMove = (e) => {
    processDrag(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      e.preventDefault(); // prevent scroll bounce
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
      {/* 1. Wooden Chassis Cabinet (Cozy Retro Turntable Box) */}
      <div 
        className="absolute inset-0 rounded-2xl border-[6px] border-[#100f1a] shadow-[8px_12px_0px_rgba(0,0,0,0.5)] flex flex-col justify-between p-4"
        style={{
          backgroundColor: "#5a3825", // Wood grain brown
          backgroundImage: "linear-gradient(to right, #503120 50%, #5a3825 50%)", // wood panel split texture
          backgroundSize: "20px 100%",
        }}
      >
        {/* Chassis inner shadow and grain lines */}
        <div className="absolute inset-0 border-t-4 border-l-4 border-r-4 border-b-4 border-t-white/10 border-l-white/10 border-r-black/30 border-b-black/30 pointer-events-none rounded-lg" />
        
        {/* Top Label & Decorative Text (Retro branding) */}
        <div className="flex justify-between items-center w-full z-10 px-2 pt-1 font-serif text-[10px] text-[#f7e6c4]/40 tracking-wider">
          <span>KISSEN SYSTEM-16</span>
          <span className="font-sans text-[7px]">MADE IN SHIBUYA</span>
        </div>

        {/* Bottom Panel Controls (Power switch & speed selectors) */}
        <div className="flex justify-between items-end w-full z-10 px-2 pb-1">
          {/* Decorative gold dust specs at bottom-left */}
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 bg-[#ffd043] border border-[#100f1a] shadow-sm rounded-sm" />
            <div className="w-2.5 h-2.5 bg-[#ff7ea5] border border-[#100f1a] shadow-sm rounded-sm" />
          </div>

          {/* RPM Buttons Group (33 / 45) */}
          <div className="flex gap-1">
            <button 
              onClick={() => setRpmMode(33)}
              className={`w-6 h-6 font-mono text-[8px] border-2 border-[#100f1a] flex items-center justify-center cursor-pointer shadow-[1px_2px_0px_rgba(0,0,0,0.4)] ${rpmMode === 33 ? 'bg-[#ffd043] text-[#100f1a] font-bold' : 'bg-[#34304b] text-[#f7e6c4]/60'}`}
            >
              33
            </button>
            <button 
              onClick={() => setRpmMode(45)}
              className={`w-6 h-6 font-mono text-[8px] border-2 border-[#100f1a] flex items-center justify-center cursor-pointer shadow-[1px_2px_0px_rgba(0,0,0,0.4)] ${rpmMode === 45 ? 'bg-[#ffd043] text-[#100f1a] font-bold' : 'bg-[#34304b] text-[#f7e6c4]/60'}`}
            >
              45
            </button>
          </div>
        </div>
      </div>

      {/* 2. Platter circular base (Dark metal backing inside wood deck) */}
      <div 
        className="absolute inset-[15px] rounded-full border-4 border-[#100f1a] shadow-[inset_4px_4px_0px_rgba(0,0,0,0.6)]"
        style={{ backgroundColor: "#211f30" }}
      />
      
      {/* Platter outer rim decorative dashed circle */}
      <div className="absolute inset-[21px] rounded-full border-2 border-dashed border-[#34304b] opacity-40 pointer-events-none" />

      {/* 3. The Canvas-based rotating vinyl record */}
      <canvas 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`absolute inset-[30px] w-[calc(100%-60px)] h-[calc(100%-60px)] rounded-full cursor-grab active:cursor-grabbing shadow-[0px_8px_16px_rgba(0,0,0,0.6)] border-[3px] border-[#100f1a] ${isScratching ? 'shadow-[0_0_24px_rgba(255,126,27,0.3)]' : ''}`}
        style={{ 
          imageRendering: "pixelated",
          transformOrigin: "center center"
        }}
      />

      {/* 4. Static vinyl blocky shine overlay (does not rotate) */}
      <div className="absolute inset-[30px] rounded-full vinyl-shine pointer-events-none z-10" />

      {/* 5. Center metal spindle cylinder (blocky pixel appearance) */}
      <div className="absolute w-5 h-5 rounded-full bg-[#34304b] border-2 border-[#100f1a] shadow-[0px_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none z-10">
        <div className="w-1.5 h-1.5 bg-[#ffd043] rounded-full" />
      </div>
    </div>
  );
}
