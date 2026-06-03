import React from "react";
import { motion } from "framer-motion";

export function Tonearm({ isPlaying, playbackProgress, isScratching }) {
  // Pivot points configuration (relative to the turntable coordinate space)
  // Rest rotation: -5 degrees (sitting on support stand)
  // Start track rotation: 18 degrees (outer rim of vinyl)
  // End track rotation: 36 degrees (inner label rim of vinyl)
  
  const restAngle = -5;
  const startTrackAngle = 18;
  const endTrackAngle = 36;
  
  // Calculate current angle based on playback progress
  const activeAngle = startTrackAngle + (playbackProgress / 100) * (endTrackAngle - startTrackAngle);
  const targetAngle = isPlaying ? activeAngle : restAngle;

  // We use Framer Motion's spring configuration to simulate physical weight & arm inertia
  const springConfig = {
    type: "spring",
    stiffness: isScratching ? 280 : 35, // Snappier response during scratch, heavier realistic float during play/pause
    damping: isScratching ? 20 : 12,
    mass: 1.2
  };

  return (
    <div 
      className="absolute top-[-30px] right-[-10px] md:top-[-40px] md:right-[-20px] w-[180px] h-[340px] md:w-[220px] md:h-[420px] pointer-events-none z-20"
      style={{ filter: "drop-shadow(10px 15px 0px rgba(0,0,0,0.35))" }}
    >
      {/* Tonearm SVG */}
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: targetAngle }}
        transition={springConfig}
        // Pivot point at the center of the base: x=100, y=55
        style={{ transformOrigin: "100px 55px" }}
      >
        {/* --- PIVOT BASE (Gimbals & Counterweight) --- */}
        {/* Outer Base Ring Outline */}
        <circle cx="100" cy="55" r="33" fill="#100f1a" />
        {/* Outer Base Ring Fill */}
        <circle cx="100" cy="55" r="28" fill="#34304b" />
        <circle cx="100" cy="55" r="20" fill="#211f30" stroke="#100f1a" strokeWidth="3" />
        
        {/* Gimbal block (pixel rectangle base) */}
        <rect x="84" y="44" width="32" height="22" fill="#100f1a" />
        <rect x="86" y="46" width="28" height="18" fill="#4ba3a5" /> {/* Teal pivot */}
        <rect x="92" y="52" width="16" height="6" fill="#f7e6c4" opacity="0.3" />

        {/* Counterweight shaft block */}
        <rect x="94" y="15" width="12" height="30" fill="#100f1a" />
        <rect x="97" y="15" width="6" height="30" fill="#211f30" />
        
        {/* Counterweight (brass/gold block) */}
        <rect x="85" y="5" width="30" height="20" fill="#100f1a" />
        <rect x="87" y="7" width="26" height="16" fill="#ffd043" /> {/* Gold weight */}
        <rect x="87" y="7" width="26" height="4" fill="#f7e6c4" /> {/* shine */}
        <rect x="87" y="15" width="26" height="2" fill="#ff7ea5" /> {/* spacer line */}
        
        {/* --- THE METALLIC ARM SHAFT (Pixelated S-Shape) --- */}
        {/* Double path stroke approach: black thick stroke underneath, colored stroke on top */}
        <path
          d="M 100 65 
             C 100 130, 115 170, 115 220 
             C 115 260, 95 300, 65 330
             L 65 345"
          fill="none"
          stroke="#100f1a"
          strokeWidth="14"
          strokeLinecap="square"
        />
        
        <path
          d="M 100 65 
             C 100 130, 115 170, 115 220 
             C 115 260, 95 300, 65 330
             L 65 345"
          fill="none"
          stroke="#4ba3a5" /* Teal Tonearm */
          strokeWidth="8"
          strokeLinecap="square"
        />
        
        {/* White highlights to simulate retro shine */}
        <path
          d="M 99 75 
             C 99 130, 113 170, 113 220 
             C 113 255, 93 295, 67 325"
          fill="none"
          stroke="#f7e6c4"
          strokeWidth="2"
          strokeLinecap="square"
          opacity="0.5"
        />

        {/* --- CARTRIDGE & HEADSHELL (Stylus/Needle Area) --- */}
        <g transform="translate(65, 340)">
          {/* Connector Outline */}
          <rect x="-6" y="-2" width="12" height="10" fill="#100f1a" />
          <rect x="-4" y="0" width="8" height="6" fill="#34304b" />
          
          {/* Main Headshell Outline */}
          <path
            d="M -10 6 
               L 10 6 
               L 7 34 
               L -7 34 
               Z"
            fill="#100f1a"
          />
          {/* Main Headshell Fill (Matte charcoal dark) */}
          <path
            d="M -7 8 
               L 7 8 
               L 5 32 
               L -5 32 
               Z"
            fill="#211f30"
          />
          
          {/* Cartridge Accent Line (Warm Amber LED indicator stripe) */}
          <line x1="-3" y1="28" x2="3" y2="28" stroke="#ff7ea5" strokeWidth="2.5" opacity={isPlaying ? 1.0 : 0.4} />

          {/* Minimalist Finger Lift (cozy gold lever extending right) */}
          <path
            d="M 5 15 L 14 15 L 14 9"
            fill="none"
            stroke="#100f1a"
            strokeWidth="4"
            strokeLinecap="square"
          />
          <path
            d="M 5 15 L 14 15 L 14 9"
            fill="none"
            stroke="#ffd043"
            strokeWidth="2"
            strokeLinecap="square"
          />

          {/* Stylus needle box */}
          <rect x="-5" y="34" width="10" height="7" fill="#100f1a" />
          <rect x="-3" y="36" width="6" height="3" fill="#4ba3a5" /> {/* Light blue stylus body */}
        </g>
      </motion.svg>

      {/* Stand rest (sitting underneath the arm at its rest position) */}
      <div 
        className="absolute top-[230px] right-[100px] md:top-[290px] md:right-[124px] w-5 h-12 flex flex-col items-center pointer-events-none"
      >
        {/* Support Pillar Outline & Fill */}
        <div className="w-3 h-full bg-[#100f1a] relative flex justify-center">
          <div className="w-1.5 h-full bg-[#34304b]" />
        </div>
        {/* Support Clip */}
        <div className="w-7 h-4 rounded-b-md border-b-[3px] border-x-[3px] border-[#100f1a] bg-[#211f30] mt-[-2px] shadow-sm" />
      </div>
    </div>
  );
}
