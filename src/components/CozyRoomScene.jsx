import React, { useEffect, useRef, useState } from "react";
import roomImg from "../assets/room.jpg";

export function CozyRoomScene({ isPlaying, spinSpeed = 0, onOpenTurntable }) {
  const canvasRef = useRef(null);
  
  // Image reference state
  const [bgImage, setBgImage] = useState(null);

  // Interactive Bedroom States
  const [lavaLampOn, setLavaLampOn] = useState(true);
  const [catBubble, setCatBubble] = useState(null);
  const [computerState, setComputerState] = useState("lofi"); // lofi, matrix, off
  const [terrariumOn, setTerrariumOn] = useState(true);
  const [plushHearts, setPlushHearts] = useState(false);
  const [synthSparks, setSynthSparks] = useState(false);

  // Mouse Tracking for Tooltips
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredObj, setHoveredObj] = useState(null);

  // Particle queues
  const lavaParticlesRef = useRef([]);
  const heartParticlesRef = useRef([]);
  const sparkParticlesRef = useRef([]);

  // Time ticker
  const timeRef = useRef(0);

  // Load background image on mount
  useEffect(() => {
    const img = new Image();
    img.src = roomImg;
    img.onload = () => {
      setBgImage(img);
    };
  }, []);

  // Initialize lava particles
  useEffect(() => {
    // lava particles inside glass: y goes from 232 to 255.
    lavaParticlesRef.current = Array.from({ length: 4 }, () => ({
      y: 232 + Math.random() * 23,
      vy: -0.15 - Math.random() * 0.15,
      size: 1 + Math.random() * 1.5,
    }));
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Exact dimensions of the room.jpg image
    const baseW = 735;
    const baseH = 553;
    canvas.width = baseW;
    canvas.height = baseH;

    let animationFrameId;

    const render = () => {
      // 1. Draw Background Image
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, baseW, baseH);
      } else {
        ctx.fillStyle = "#f3eedd";
        ctx.fillRect(0, 0, baseW, baseH);
      }

      timeRef.current += 1;
      const time = timeRef.current;

      // 2. Turntable Spinning Platter & Tonearm
      // Center of record player platter: (193, 237)
      // Base of tonearm: (180, 222)
      if (isPlaying) {
        const cx = 193;
        const cy = 237;
        const radius = 18;

        ctx.save();
        // Draw spinning record platter (dark grey ellipse)
        ctx.fillStyle = "#1c1b26";
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#100f1a";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw record label (pink center)
        ctx.fillStyle = "#ff7ea5";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5, 5 * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw rotating dot indicator
        const rotAngle = time * (spinSpeed * 0.08 || 0.08);
        const dotR = 11;
        const dx = Math.cos(rotAngle) * dotR;
        const dy = Math.sin(rotAngle) * (dotR * 0.55);
        ctx.fillStyle = "#ffd043";
        ctx.fillRect(Math.floor(cx + dx - 1), Math.floor(cy + dy - 1), 2.5, 2.5);

        // Draw tonearm (pointing to the vinyl)
        ctx.strokeStyle = "#4ba3a5";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(180, 222); // Arm base
        ctx.lineTo(cx + 6, cy + 2);
        ctx.stroke();
        
        ctx.restore();
      }

      // 3. Monitor Screen Overlay (x: 102 to 138, y: 200 to 222)
      if (computerState !== "off") {
        ctx.save();
        
        // Define screen polygon coordinates
        const poly = [
          { x: 104, y: 202 },
          { x: 136, y: 202 },
          { x: 136, y: 220 },
          { x: 104, y: 220 }
        ];

        // Draw screen back fill
        ctx.fillStyle = computerState === "lofi" ? "rgba(75, 163, 165, 0.4)" : "rgba(34, 139, 34, 0.45)";
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        poly.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.fill();

        // Screen animations
        if (computerState === "lofi") {
          // Bouncing audio wave bars
          ctx.fillStyle = "rgba(255, 208, 67, 0.8)";
          for (let i = 0; i < 6; i++) {
            const h = 4 + Math.sin(time * 0.15 + i) * 6;
            ctx.fillRect(108 + i * 4, 218 - h, 2.5, h);
          }
        } else if (computerState === "matrix") {
          // Green matrix code rain drops
          ctx.fillStyle = "rgba(100, 255, 100, 0.8)";
          for (let i = 0; i < 5; i++) {
            const yPos = 202 + ((time * 0.8 + i * 5) % 16);
            ctx.fillRect(107 + i * 6, yPos, 2, 3);
          }
        }

        ctx.restore();
      }

      // 4. Lava Lamp Glow & Particles
      if (lavaLampOn) {
        ctx.save();

        const lcx = 557;
        const lcy = 244;

        // Move and draw lava lamp blobs inside glass
        lavaParticlesRef.current.forEach((p) => {
          ctx.fillStyle = "#ff7ea5";
          ctx.beginPath();
          ctx.arc(lcx + (Math.sin(time * 0.05 + p.y) * 2), p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Move particles
          p.y += p.vy;
          if (p.y <= 233) {
            p.y = 233;
            p.vy = -p.vy;
          } else if (p.y >= 254) {
            p.y = 254;
            p.vy = -p.vy;
          }
        });

        ctx.restore();
      }

      // 5. Desert Terrarium Light Bar Cone
      if (terrariumOn) {
        ctx.save();
        
        // Warm yellow light cone
        const tgrad = ctx.createLinearGradient(650, 275, 650, 350);
        tgrad.addColorStop(0, "rgba(255, 208, 67, 0.35)");
        tgrad.addColorStop(1, "rgba(255, 208, 67, 0.0)");
        ctx.fillStyle = tgrad;

        ctx.beginPath();
        ctx.moveTo(630, 275);
        ctx.lineTo(670, 275);
        ctx.lineTo(690, 350);
        ctx.lineTo(610, 350);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 6. Synth Spark Particles (above synth at x: 95-175, y: 260)
      if (synthSparks) {
        ctx.save();
        if (Math.random() < 0.4) {
          sparkParticlesRef.current.push({
            x: 105 + Math.random() * 55,
            y: 260,
            vy: -0.6 - Math.random() * 0.6,
            vx: (Math.random() - 0.5) * 0.4,
            life: 20,
          });
        }
        sparkParticlesRef.current.forEach((sp, idx) => {
          ctx.fillStyle = "#ffd043";
          ctx.fillRect(sp.x, sp.y, 2, 2);
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life--;
          if (sp.life <= 0) sparkParticlesRef.current.splice(idx, 1);
        });
        ctx.restore();
      }

      // 7. Bed Plushies Heart Particles (above bed at x: 350-560, y: 420)
      if (plushHearts) {
        ctx.save();
        if (Math.random() < 0.25) {
          heartParticlesRef.current.push({
            x: 400 + Math.random() * 90,
            y: 420,
            vy: -0.5 - Math.random() * 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            size: 8 + Math.floor(Math.random() * 4),
            life: 25,
          });
        }
        heartParticlesRef.current.forEach((hp, idx) => {
          ctx.fillStyle = "#ff7ea5";
          ctx.font = `${hp.size}px monospace`;
          ctx.fillText("♥", hp.x, hp.y);
          hp.x += hp.vx;
          hp.y += hp.vy;
          hp.life--;
          if (hp.life <= 0) heartParticlesRef.current.splice(idx, 1);
        });
        ctx.restore();
      }

      // 8. Cat Speech Bubble (Cat at (306, 147))
      if (catBubble) {
        ctx.save();
        const bx = 306;
        const by = 110;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#100f1a";
        ctx.lineWidth = 1.5;

        // Draw bubble rectangle
        ctx.beginPath();
        ctx.roundRect(bx - 35, by - 25, 70, 18, 4);
        ctx.fill();
        ctx.stroke();

        // Draw small arrow pointing down
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(bx - 5, by - 7);
        ctx.lineTo(bx + 5, by - 7);
        ctx.lineTo(bx, by - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.font = "bold 9px 'Press Start 2P', monospace";
        ctx.fillStyle = "#b23b68";
        ctx.textAlign = "center";
        ctx.fillText(catBubble, bx, by - 13);
        ctx.restore();
      }

      // 9. Ambient Evening Shade & Real-Time Light Masks
      // Create a temporary canvas for light mask
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = baseW;
      maskCanvas.height = baseH;
      const mctx = maskCanvas.getContext("2d");

      // Fill with evening shadow color tint
      mctx.fillStyle = "rgba(15, 12, 28, 0.4)";
      mctx.fillRect(0, 0, baseW, baseH);

      // Carve out light spots
      mctx.globalCompositeOperation = "destination-out";

      // A. Computer Screen Glow
      if (computerState !== "off") {
        const radGrad = mctx.createRadialGradient(120, 210, 5, 120, 210, 90);
        radGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
        mctx.fillStyle = radGrad;
        mctx.beginPath();
        mctx.arc(120, 210, 90, 0, Math.PI * 2);
        mctx.fill();
      }

      // B. Lava Lamp Glow
      if (lavaLampOn) {
        const radGrad = mctx.createRadialGradient(557, 244, 2, 557, 244, 75);
        radGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
        mctx.fillStyle = radGrad;
        mctx.beginPath();
        mctx.arc(557, 244, 75, 0, Math.PI * 2);
        mctx.fill();
      }

      // C. Terrarium Light Glow
      if (terrariumOn) {
        const radGrad = mctx.createRadialGradient(650, 310, 5, 650, 310, 95);
        radGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
        mctx.fillStyle = radGrad;
        mctx.beginPath();
        mctx.arc(650, 310, 95, 0, Math.PI * 2);
        mctx.fill();
      }

      // D. CRT TV Screen Glow
      const tvGrad = mctx.createRadialGradient(310, 150, 5, 310, 150, 45);
      tvGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      tvGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      mctx.fillStyle = tvGrad;
      mctx.beginPath();
      mctx.arc(310, 150, 45, 0, Math.PI * 2);
      mctx.fill();

      // Render light mask overlay
      ctx.save();
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.restore();

      // Draw colored screen light accents
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      if (computerState !== "off") {
        const col = computerState === "lofi" ? "rgba(75, 163, 165, 0.12)" : "rgba(34, 139, 34, 0.16)";
        ctx.fillStyle = col;
        ctx.fillRect(0, 0, baseW, baseH);
      }

      if (lavaLampOn) {
        const radGrad = ctx.createRadialGradient(557, 244, 2, 557, 244, 55);
        radGrad.addColorStop(0, "rgba(255, 126, 165, 0.25)");
        radGrad.addColorStop(1, "rgba(255, 126, 165, 0.0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(557, 244, 55, 0, Math.PI * 2);
        ctx.fill();
      }

      if (terrariumOn) {
        const radGrad = ctx.createRadialGradient(650, 310, 5, 650, 310, 70);
        radGrad.addColorStop(0, "rgba(255, 208, 67, 0.2)");
        radGrad.addColorStop(1, "rgba(255, 208, 67, 0.0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(650, 310, 70, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 10. CRT Screen Scanline Filter Layer (Grid details overlay)
      ctx.fillStyle = "rgba(255, 255, 255, 0.012)";
      for (let y = 0; y < baseH; y += 3) {
        ctx.fillRect(0, y, baseW, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [bgImage, isPlaying, spinSpeed, lavaLampOn, computerState, terrariumOn, plushHearts, synthSparks, catBubble]);

  // Click coordinate mapper & collision checks
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = 735 / rect.width;
    const scaleY = 553 / rect.height;

    const pxX = clickX * scaleX;
    const pxY = clickY * scaleY;

    // Coordinate match checks:
    // 1. Turntable deck on music desk: x: [150, 240], y: [220, 280]
    if (pxX >= 150 && pxX <= 240 && pxY >= 220 && pxY <= 280) {
      onOpenTurntable();
      return;
    }

    // 2. CRT TV Cat: x: [285, 335], y: [110, 155]
    if (pxX >= 285 && pxX <= 335 && pxY >= 110 && pxY <= 155) {
      const sounds = ["Meow! 🐱", "Purr... 🧡", "Mrrrp! 🐾"];
      setCatBubble(sounds[Math.floor(Math.random() * sounds.length)]);
      setTimeout(() => setCatBubble(null), 2500);
      return;
    }

    // 3. Monitor Screen: x: [90, 150], y: [190, 235]
    if (pxX >= 90 && pxX <= 150 && pxY >= 190 && pxY <= 235) {
      setComputerState((prev) => {
        if (prev === "lofi") return "matrix";
        if (prev === "matrix") return "off";
        return "lofi";
      });
      return;
    }

    // 4. Red Synth: x: [95, 235], y: [235, 285]
    if (pxX >= 95 && pxX <= 235 && pxY >= 235 && pxY <= 285) {
      setSynthSparks(true);
      setTimeout(() => setSynthSparks(false), 2000);
      return;
    }

    // 5. Lava Lamp: x: [540, 575], y: [210, 290]
    if (pxX >= 540 && pxX <= 575 && pxY >= 210 && pxY <= 290) {
      setLavaLampOn(!lavaLampOn);
      return;
    }

    // 6. Terrarium: x: [610, 690], y: [270, 370]
    if (pxX >= 610 && pxX <= 690 && pxY >= 270 && pxY <= 370) {
      setTerrariumOn(!terrariumOn);
      return;
    }

    // 7. Bed/Plushies: x: [350, 560], y: [370, 520]
    if (pxX >= 350 && pxX <= 560 && pxY >= 370 && pxY <= 520) {
      setPlushHearts(true);
      setTimeout(() => setPlushHearts(false), 3000);
      return;
    }
  };

  // Hover checks for tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    const scaleX = 735 / rect.width;
    const scaleY = 553 / rect.height;

    const pxX = cursorX * scaleX;
    const pxY = cursorY * scaleY;

    let found = null;

    if (pxX >= 150 && pxX <= 240 && pxY >= 220 && pxY <= 280) {
      found = { name: "ANALOG TURNTABLE", action: "Click to play & scratch vinyl" };
    }
    else if (pxX >= 285 && pxX <= 335 && pxY >= 110 && pxY <= 155) {
      found = { name: "ORANGE TABBY CAT", action: "Click to pet and play" };
    }
    else if (pxX >= 90 && pxX <= 150 && pxY >= 190 && pxY <= 235) {
      found = { name: "STUDIO MONITOR", action: "Click to cycle screen graphic" };
    }
    else if (pxX >= 95 && pxX <= 235 && pxY >= 235 && pxY <= 285) {
      found = { name: "RED SYNTH KEYBOARD", action: "Click to play retro notes" };
    }
    else if (pxX >= 540 && pxX <= 575 && pxY >= 210 && pxY <= 290) {
      found = { name: "LAVA LAMP", action: lavaLampOn ? "Click to turn off glow" : "Click to activate lava glow" };
    }
    else if (pxX >= 610 && pxX <= 690 && pxY >= 270 && pxY <= 370) {
      found = { name: "DESERT TERRARIUM", action: "Click to toggle light bar" };
    }
    else if (pxX >= 350 && pxX <= 560 && pxY >= 370 && pxY <= 520) {
      found = { name: "PLUSH TOYS", action: "Click to hug Finn & Teddy" };
    }

    setHoveredObj(found);
  };

  const handleMouseLeave = () => {
    setHoveredObj(null);
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden bg-[#0c0a12] flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full object-contain cursor-default select-none active:scale-[1.001]"
        style={{
          imageRendering: "pixelated",
        }}
      />

      {/* Floating Retro Cursor Tooltip HUD */}
      {hoveredObj && (
        <div 
          className="pixel-tooltip"
          style={{
            left: `${mousePos.x - 20}px`,
            top: `${mousePos.y - 45}px`,
          }}
        >
          <div className="font-bold text-[#ffd043]">{hoveredObj.name}</div>
          <div className="text-[6px] text-[#f7e6c4]/80 mt-0.5">{hoveredObj.action}</div>
        </div>
      )}
    </div>
  );
}
