import React, { useEffect, useRef, useState } from "react";

export function CozyRoomScene({ isPlaying, animationMode = true }) {
  const canvasRef = useRef(null);
  
  // Interactive room states
  const [lampOn, setLampOn] = useState(true);
  const [catState, setCatState] = useState("sleeping"); // sleeping, waking, happy
  const [catBubble, setCatBubble] = useState(null); // text or emoji
  const [lightning, setLightning] = useState(false);
  const [steamBurst, setSteamBurst] = useState(0);

  // Timers and counters refs
  const timeRef = useRef(0);
  const steamParticlesRef = useRef([]);
  const rainDropsRef = useRef([]);
  const dustParticlesRef = useRef([]);

  // Initialize particles once
  useEffect(() => {
    // 1. Rain drops in window
    // Window coordinates: x: 15 to 95, y: 15 to 105 in 320x180 scale
    rainDropsRef.current = Array.from({ length: 25 }, () => ({
      x: 15 + Math.random() * 80,
      y: 15 + Math.random() * 90,
      vy: 1.5 + Math.random() * 2,
      length: 2 + Math.random() * 4,
      alpha: 0.15 + Math.random() * 0.3,
    }));

    // 2. Ambient dust particles
    dustParticlesRef.current = Array.from({ length: 15 }, () => ({
      x: Math.random() * 320,
      y: Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.05 - Math.random() * 0.1,
      alpha: 0.1 + Math.random() * 0.4,
      life: Math.random() * 100,
    }));
  }, []);

  // Handle Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Internal pixel art resolution (320 x 180)
    const baseW = 320;
    const baseH = 180;
    canvas.width = baseW;
    canvas.height = baseH;

    let animFrameId;

    const render = () => {
      // Clear
      ctx.fillStyle = "#0c0a12"; // Deep cozy night background
      ctx.fillRect(0, 0, baseW, baseH);

      // Increment clock if animating
      const speedFactor = isPlaying ? 1.0 : 0.2; // Slow breathing/flicker when paused
      if (animationMode) {
        timeRef.current += 1 * speedFactor;
      }

      const time = timeRef.current;

      // ----------------------------------------------------
      // 1. SHIBUYA WINDOW SCENE (Left side: x: 15 to 95, y: 15 to 105)
      // ----------------------------------------------------
      // Window glass backdrop (Night Sky)
      ctx.fillStyle = lightning ? "#3d3460" : "#131024"; // Thunder flash
      ctx.fillRect(15, 15, 80, 90);

      // Distant buildings
      const buildingColors = ["#1b1730", "#241f3e", "#2b254a"];
      
      // Building 1 (left edge)
      ctx.fillStyle = buildingColors[0];
      ctx.fillRect(15, 60, 20, 45);
      
      // Building 2 (center tall)
      ctx.fillStyle = buildingColors[1];
      ctx.fillRect(35, 45, 25, 60);
      
      // Building 3 (right)
      ctx.fillStyle = buildingColors[2];
      ctx.fillRect(60, 70, 35, 35);

      // Distant building windows (glowing pixels)
      ctx.fillStyle = "#ffd043";
      // Only draw some glowing dots
      if (!lightning) {
        if (Math.sin(time * 0.05) > 0) ctx.fillRect(40, 55, 2, 2);
        ctx.fillRect(48, 65, 2, 2);
        if (Math.cos(time * 0.03) > -0.5) ctx.fillRect(40, 75, 2, 2);
        ctx.fillRect(70, 80, 2, 2);
        ctx.fillRect(80, 85, 2, 2);
      }

      // Rain sliding down window pane (only when animating)
      if (animationMode) {
        ctx.strokeStyle = "rgba(180, 210, 255, 0.4)";
        ctx.lineWidth = 1;
        rainDropsRef.current.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 0.5, drop.y + drop.length);
          ctx.stroke();

          // Update position
          drop.y += drop.vy * speedFactor;
          drop.x -= 0.1 * speedFactor;

          // Reset drop
          if (drop.y > 105) {
            drop.y = 15;
            drop.x = 15 + Math.random() * 80;
          }
        });
      }

      // Window Frame (Wood bars)
      ctx.fillStyle = "#1d1521"; // Dark wood
      ctx.fillRect(15, 15, 80, 3);   // Top
      ctx.fillRect(15, 102, 80, 3);  // Bottom
      ctx.fillRect(15, 15, 3, 90);   // Left
      ctx.fillRect(92, 15, 3, 90);   // Right
      ctx.fillRect(53, 15, 4, 90);   // Vertical divider
      ctx.fillRect(15, 60, 80, 4);   // Horizontal divider

      // ----------------------------------------------------
      // 2. COZY WALL & DECOR (Bookshelf / Shelf)
      // ----------------------------------------------------
      // Wooden floor line (lower part)
      ctx.fillStyle = "#17101a";
      ctx.fillRect(0, 135, baseW, 45);

      // Baseboard strip
      ctx.fillStyle = "#1b1424";
      ctx.fillRect(0, 131, baseW, 4);

      // Shelf (Upper right: x: 170 to 240, y: 40)
      ctx.fillStyle = "#432828"; // Reddish-brown wood
      ctx.fillRect(170, 42, 80, 4); // Shelf wood board
      ctx.fillRect(180, 46, 4, 15); // Support bracket left
      ctx.fillRect(230, 46, 4, 15); // Support bracket right

      // Records on Shelf
      const bookColors = ["#ff5964", "#35a7ff", "#ffd043", "#6bc36c", "#a25fa2", "#ffffff"];
      bookColors.forEach((color, i) => {
        ctx.fillStyle = color;
        // Draw vertical pixel slabs
        ctx.fillRect(185 + i * 5, 27, 4, 15);
        // Highlight on record sleeves
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(185 + i * 5, 27, 1, 15);
      });

      // Potted Plant on Desk (x: 120, y: 110)
      ctx.fillStyle = "#795548"; // Pot
      ctx.fillRect(122, 122, 10, 10);
      ctx.fillStyle = "#5d4037"; // Pot shadow
      ctx.fillRect(128, 122, 4, 10);

      // Vines / Leaves
      ctx.fillStyle = "#4caf50"; // Green leaves
      ctx.fillRect(118, 114, 6, 8);
      ctx.fillRect(128, 116, 8, 6);
      ctx.fillStyle = "#2e7d32"; // Darker leaves
      ctx.fillRect(124, 110, 8, 8);
      ctx.fillRect(120, 118, 4, 4);
      ctx.fillRect(132, 120, 3, 4);

      // Hanging Plant on upper left shelf support
      ctx.fillStyle = "#2e7d32";
      ctx.fillRect(245, 15, 8, 8);
      ctx.fillRect(248, 23, 2, 8); // hanging vine 1
      ctx.fillRect(251, 23, 2, 12); // hanging vine 2

      // ----------------------------------------------------
      // 3. TABLE / DESK & ELEMENTS
      // ----------------------------------------------------
      // Table board
      ctx.fillStyle = "#2c1c30"; // Table top
      ctx.fillRect(110, 128, baseW - 110, 8);
      ctx.fillStyle = "#1e1222"; // Table edge
      ctx.fillRect(110, 136, baseW - 110, 4);

      // Mug of hot tea (x: 235, y: 120)
      ctx.fillStyle = "#4ba3a5"; // Mug body
      ctx.fillRect(235, 120, 8, 8);
      // Mug handle
      ctx.fillStyle = "#337b7d";
      ctx.fillRect(243, 122, 2, 4);
      // Mug rim line
      ctx.fillStyle = "#a8e0e0";
      ctx.fillRect(235, 120, 8, 1);
      // Warm tea inside mug highlight
      ctx.fillStyle = "#ffaa66";
      ctx.fillRect(237, 121, 4, 1);

      // Steam Particle Logic
      // Add a particle periodically
      if (animationMode && Math.random() < 0.15 * speedFactor) {
        steamParticlesRef.current.push({
          x: 237 + Math.random() * 4,
          y: 118,
          vy: -0.3 - Math.random() * 0.3,
          vx: (Math.random() - 0.5) * 0.2,
          life: 30 + Math.random() * 30,
          alpha: 0.8,
        });
      }

      // Draw steam particles
      ctx.fillStyle = "#ffdcb5"; // Peach/warm cozy steam color
      steamParticlesRef.current.forEach((p, idx) => {
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
        
        // Update
        p.y += p.vy;
        p.x += p.vx;
        p.life--;
        p.alpha = p.life / 60;

        if (p.life <= 0) {
          steamParticlesRef.current.splice(idx, 1);
        }
      });
      ctx.globalAlpha = 1.0; // reset

      // ----------------------------------------------------
      // 4. SLEEPING CAT & CUSHION (x: 160, y: 118)
      // ----------------------------------------------------
      // Cat cushion
      ctx.fillStyle = "#b23b68"; // Cozy magenta cushion
      ctx.fillRect(158, 126, 32, 4);
      ctx.fillStyle = "#ff7ea5"; // Highlight cushion
      ctx.fillRect(160, 126, 28, 1);

      // Cat Body (Breathing: offset Y slightly)
      // Breathing frequency: slow sine wave
      const breatheOffset = Math.sin(time * 0.04) > 0 ? 1 : 0;
      
      // Cat body sprite blocks
      ctx.fillStyle = "#e26d2e"; // Orange cat fur
      // Base body
      ctx.fillRect(163, 118 + breatheOffset, 22, 9 - breatheOffset);
      // White belly patch
      ctx.fillStyle = "#f7e6c4";
      ctx.fillRect(167, 122 + breatheOffset, 12, 5 - breatheOffset);
      
      // Head
      ctx.fillStyle = "#e26d2e";
      ctx.fillRect(179, 115 + breatheOffset, 8, 7);
      // Ears
      ctx.fillRect(180, 113 + breatheOffset, 2, 2);
      ctx.fillRect(185, 113 + breatheOffset, 2, 2);
      // Closed sleeping eyes
      ctx.fillStyle = "#432828";
      if (catState === "sleeping") {
        ctx.fillRect(182, 118 + breatheOffset, 2, 1);
      } else {
        // Waking/happy eyes open
        ctx.fillRect(181, 117 + breatheOffset, 1, 2);
        ctx.fillRect(185, 117 + breatheOffset, 1, 2);
        ctx.fillStyle = "#6bc36c"; // green eyes!
        ctx.fillRect(182, 118 + breatheOffset, 1, 1);
        ctx.fillRect(184, 118 + breatheOffset, 1, 1);
      }

      // Tail
      ctx.fillStyle = "#e26d2e";
      const tailSwing = isPlaying ? Math.floor(Math.sin(time * 0.08) * 2) : 0;
      ctx.fillRect(160, 122 + tailSwing, 4, 3);
      ctx.fillRect(158, 120 + tailSwing, 2, 3);

      // ----------------------------------------------------
      // 5. LIGHTING & DESK LAMP (x: 270, y: 70)
      // ----------------------------------------------------
      // Lamp Stand
      ctx.fillStyle = "#7d6f55"; // Dark brass
      ctx.fillRect(272, 90, 3, 38); // vertical bar
      ctx.fillRect(266, 126, 15, 2); // base
      
      // Lamp curved neck
      ctx.fillRect(264, 88, 10, 3);
      ctx.fillRect(262, 91, 3, 5);

      // Lamp Shade
      ctx.fillStyle = "#d04343"; // Red shade
      ctx.fillRect(258, 96, 11, 8);
      ctx.fillStyle = "#ff7ea5"; // Accent highlight
      ctx.fillRect(258, 96, 11, 2);

      // Bulb inside shade
      ctx.fillStyle = lampOn ? "#ffd043" : "#5d4b31";
      ctx.fillRect(262, 104, 3, 2);

      // Soft lamp lighting glow (procedural polygon overlay)
      if (lampOn) {
        // Flickering intensity
        const flicker = 0.05 * Math.sin(time * 0.2) + 0.02 * Math.cos(time * 0.5);
        const opacity = 0.16 + flicker;

        ctx.fillStyle = `rgba(255, 208, 67, ${opacity})`;
        ctx.beginPath();
        // Light beam cone
        ctx.moveTo(263, 106);
        ctx.lineTo(190, 180);
        ctx.lineTo(320, 180);
        ctx.lineTo(320, 130);
        ctx.closePath();
        ctx.fill();

        // Extra warm circular center glow
        const gradient = ctx.createRadialGradient(263, 106, 2, 263, 106, 40);
        gradient.addColorStop(0, "rgba(255, 208, 67, 0.4)");
        gradient.addColorStop(1, "rgba(255, 208, 67, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(263, 106, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------------------
      // 6. DUST PARTICLES & LIGHT RAYS
      // ----------------------------------------------------
      if (animationMode) {
        dustParticlesRef.current.forEach((p) => {
          // Particles only shine inside the lamp light cone
          const insideCone = lampOn && p.x > 180 && p.y > 100;
          ctx.fillStyle = insideCone ? "#ffd043" : "#ffffff";
          ctx.globalAlpha = insideCone ? p.alpha * 1.5 : p.alpha * 0.4;
          
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);

          // Update position
          p.y += p.vy * speedFactor;
          p.x += p.vx * speedFactor;
          
          if (p.y < 0) {
            p.y = 180;
            p.x = Math.random() * 320;
          }
          if (p.x < 0 || p.x > 320) {
            p.x = Math.random() * 320;
          }
        });
        ctx.globalAlpha = 1.0;
      }

      // ----------------------------------------------------
      // 7. SPEECH BUBBLES / EMOJIS (Interactive feedback)
      // ----------------------------------------------------
      if (catBubble) {
        const bx = 168;
        const by = 92;
        // Draw little pixelated box
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx, by, 32, 16);
        ctx.strokeStyle = "#100f1a";
        ctx.strokeRect(bx, by, 32, 16);
        // tail of bubble
        ctx.fillRect(bx + 14, by + 16, 4, 3);
        
        // text/content in bubble
        ctx.font = "bold 8px 'Press Start 2P', monospace";
        ctx.fillStyle = "#b23b68";
        ctx.textAlign = "center";
        ctx.fillText(catBubble, bx + 16, by + 12);
      }

      // Ambient night overlay (global dark adjustment if lamp is off)
      if (!lampOn) {
        ctx.fillStyle = "rgba(10, 8, 20, 0.45)";
        ctx.fillRect(0, 0, baseW, baseH);
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying, animationMode, lampOn, catState, catBubble, lightning]);

  // Click handler to detect region coordinates mapped to 320x180 canvas
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate click coordinates relative to canvas
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Map to internal 320x180 resolution
    const scaleX = 320 / rect.width;
    const scaleY = 180 / rect.height;

    const pxX = clickX * scaleX;
    const pxY = clickY * scaleY;

    // 1. Lamp Region Trigger (Stand & Shade)
    if (pxX >= 250 && pxX <= 285 && pxY >= 75 && pxY <= 130) {
      setLampOn(!lampOn);
      return;
    }

    // 2. Sleeping Cat Region Trigger
    if (pxX >= 155 && pxX <= 195 && pxY >= 110 && pxY <= 130) {
      if (catState === "sleeping") {
        setCatState("waking");
        setCatBubble("MEOW");
        setTimeout(() => {
          setCatState("happy");
          setCatBubble("♥");
        }, 1200);
        setTimeout(() => {
          setCatState("sleeping");
          setCatBubble(null);
        }, 3500);
      }
      return;
    }

    // 3. Mug Region Trigger (Steam burst)
    if (pxX >= 230 && pxX <= 250 && pxY >= 115 && pxY <= 130) {
      setSteamBurst(prev => prev + 1);
      // Spawn a burst of steam particles
      for (let i = 0; i < 12; i++) {
        steamParticlesRef.current.push({
          x: 237 + Math.random() * 4,
          y: 118,
          vy: -0.6 - Math.random() * 0.8,
          vx: (Math.random() - 0.5) * 0.6,
          life: 40 + Math.random() * 40,
          alpha: 1.0,
        });
      }
      return;
    }

    // 4. Window Region Trigger (Thunder flash)
    if (pxX >= 15 && pxX <= 95 && pxY >= 15 && pxY <= 105) {
      setLightning(true);
      setTimeout(() => setLightning(false), 120);
      setTimeout(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 80);
      }, 250);
      return;
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        className="w-full h-full object-cover cursor-pointer select-none active:scale-[1.002]"
        style={{
          imageRendering: "pixelated",
          // Styled overlay
        }}
      />
    </div>
  );
}
