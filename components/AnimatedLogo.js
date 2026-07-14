'use client';

import React from 'react';

export default function AnimatedLogo({ className, theme, layout = 'horizontal', ...props }) {
  // Low-poly stylized world map path (tiled seamlessly at width 180px)
  const mapPath = "M -80,-35 c 10,-5 20,5 30,10 c 10,5 20,10 30,15 c -5,10 -15,20 -25,15 c -10,-5 -15,-15 -25,-20 c -5,-5 -10,-10 -10,-20 z M -45,10 c 10,5 15,15 10,30 c -5,10 -10,20 -15,25 c -2,-10 -5,-20 -10,-30 c -2,-10 5,-20 15,-25 z M -45,-45 c 5,2 10,5 5,10 c -5,2 -10,-2 -5,-10 z M -10,15 c 15,0 25,10 25,20 c -3,15 -10,25 -20,30 c -5,-10 -10,-20 -7,-30 c 2,-10 2,-20 2,-20 z M -20,-10 c 5,-10 15,-15 30,-20 c 15,-5 35,0 50,10 c 10,10 15,20 5,35 c -10,10 -25,15 -35,5 c -10,-10 -25,-20 -50,-30 z M 15,5 c 5,5 10,15 7,25 c -4,-5 -7,-15 -7,-25 z M 45,35 c 10,0 20,5 15,15 c -10,5 -20,0 -15,-15 z";

  const logoClass = theme ? `logo-${theme}` : '';
  const isVertical = layout === 'vertical';
  
  // Set viewBox and dimensions based on layout choice
  const viewBox = isVertical ? "0 0 500 450" : "0 0 500 180";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={`${className} ${logoClass}`.trim()}
      width="100%"
      height="100%"
      {...props}
    >
      <defs>
        {/* Globe gradients */}
        <radialGradient id="globe-body-grad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#093a6b" />
        </radialGradient>
        
        <radialGradient id="globe-body-grad-dark" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>
        
        <linearGradient id="globe-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
          <stop offset="100%" stopColor="rgba(9, 58, 107, 0.1)" />
        </linearGradient>

        {/* Swoosh gradient */}
        <linearGradient id="swoosh-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="35%" stopColor="#00e1d9" />
          <stop offset="70%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#074b93" />
        </linearGradient>
        
        <linearGradient id="swoosh-grad-dark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#00f2fe" />
          <stop offset="70%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Text gradients matching user's official logo */}
        <linearGradient id="text-grad-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#061e40" />
          <stop offset="60%" stopColor="#0a4c95" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        
        <linearGradient id="text-grad-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Clip paths for spinning world map on the globe */}
        <clipPath id="globe-clip-horizontal">
          <circle cx="90" cy="90" r="62" />
        </clipPath>
        <clipPath id="globe-clip-vertical">
          <circle cx="250" cy="150" r="90" />
        </clipPath>

        {/* Glow/Shadow Filters */}
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25" />
        </filter>
        <filter id="globe-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Spinning World Map inside Globe */
        @keyframes spinWorld {
          0% { transform: translateX(0); }
          100% { transform: translateX(-180px); }
        }
        .spinning-map {
          animation: spinWorld 16s linear infinite;
        }

        /* 3D Orbiting Airplane Scale/Opacity Depth Effect */
        @keyframes planeDepthLight {
          0% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); }
          25% { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 3px 6px rgba(2,132,199,0.3)); }
          48% { transform: scale(1); opacity: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25)); }
          50% { transform: scale(0.85); opacity: 0.12; filter: none; }
          75% { transform: scale(0.65); opacity: 0.05; filter: none; }
          95% { transform: scale(0.85); opacity: 0.12; filter: none; }
          100% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); }
        }
        
        @keyframes planeDepthDark {
          0% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 6px rgba(0,225,217,0.7)); }
          25% { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 0 12px rgba(0,225,217,0.95)); }
          48% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 6px rgba(0,225,217,0.7)); }
          50% { transform: scale(0.85); opacity: 0.12; filter: none; }
          75% { transform: scale(0.65); opacity: 0.05; filter: none; }
          95% { transform: scale(0.85); opacity: 0.12; filter: none; }
          100% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 6px rgba(0,225,217,0.7)); }
        }

        .airplane-scaler {
          animation: planeDepthLight 8s linear infinite;
          transform-origin: center;
        }
        .logo-dark .airplane-scaler, [data-theme="dark"] .airplane-scaler {
          animation: planeDepthDark 8s linear infinite;
        }

        /* Swoosh Loop Entrance & Glow Pulse */
        @keyframes swooshGlow {
          0%, 100% { filter: drop-shadow(0 2px 4px rgba(14,165,233,0.15)); }
          50% { filter: drop-shadow(0 4px 12px rgba(0,225,217,0.35)); }
        }
        .swoosh-path {
          animation: swooshGlow 4s ease-in-out infinite;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logo-dark .swoosh-path, [data-theme="dark"] .swoosh-path {
          fill: url(#swoosh-grad-dark);
        }
        svg:hover .swoosh-path {
          transform: scale(1.01) translate(-1px, -1px);
        }

        /* Globe details in dark mode */
        .logo-dark .globe-base, [data-theme="dark"] .globe-base {
          fill: url(#globe-body-grad-dark);
        }
        .logo-dark .globe-grid, [data-theme="dark"] .globe-grid {
          stroke: rgba(56, 189, 248, 0.4);
          stroke-width: 1px;
        }
        .logo-dark .spinning-map path, [data-theme="dark"] .spinning-map path {
          fill: rgba(255, 255, 255, 0.65);
        }
        .logo-dark .flight-trail-path, [data-theme="dark"] .flight-trail-path {
          stroke: rgba(255, 255, 255, 0.65);
          stroke-width: 1.8px;
        }

        /* Hover interactions for texts and divider */
        .ftw-text {
          fill: url(#text-grad-light);
          transition: fill 0.3s ease;
        }
        .logo-dark .ftw-text, [data-theme="dark"] .ftw-text {
          fill: url(#text-grad-dark);
          filter: drop-shadow(0 2px 8px rgba(56, 189, 248, 0.3));
        }
        
        .subtext {
          fill: #061e40;
          font-weight: 700;
          transition: fill 0.3s ease, letter-spacing 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logo-dark .subtext, [data-theme="dark"] .subtext {
          fill: #ffffff;
        }

        .divider-line {
          stroke: #0a4c95;
          transition: stroke 0.3s ease, stroke-width 0.3s ease;
        }
        .logo-dark .divider-line, [data-theme="dark"] .divider-line {
          stroke: #38bdf8;
        }

        .divider-plane {
          fill: #0a4c95;
          transition: fill 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logo-dark .divider-plane, [data-theme="dark"] .divider-plane {
          fill: #38bdf8;
        }

        /* Globe pulse effect on hover */
        .globe-container {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        svg:hover .globe-container {
          transform: scale(1.04);
        }

        @media print {
          .ftw-text {
            fill: #0f4c81 !important;
          }
          .swoosh-path {
            fill: #0ea5e9 !important;
          }
          .globe-base {
            fill: #0284c7 !important;
          }
          .divider-line {
            stroke: #0f4c81 !important;
          }
          .divider-plane {
            fill: #0f4c81 !important;
          }
        }
      ` }} />

      {isVertical ? (
        /* ================= VERTICAL LAYOUT (HOMEPAGE HERO) ================= */
        <g>
          {/* 1. GLOBE COMPONENT */}
          <g className="globe-container" style={{ transformOrigin: '250px 150px' }}>
            <circle cx="250" cy="150" r="95" fill="url(#globe-glow-grad)" filter="url(#globe-glow)" />
            <circle cx="250" cy="150" r="90" fill="url(#globe-body-grad)" className="globe-base" />
            <g clipPath="url(#globe-clip-vertical)">
              <g className="spinning-map">
                <path d={mapPath} fill="rgba(255, 255, 255, 0.45)" transform="translate(250, 150) scale(1.45)" />
                <path d={mapPath} fill="rgba(255, 255, 255, 0.45)" transform="translate(511, 150) scale(1.45)" />
              </g>
            </g>
            <circle cx="250" cy="150" r="90" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" className="globe-grid" />
            <ellipse cx="250" cy="150" rx="90" ry="34" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <ellipse cx="250" cy="150" rx="90" ry="66" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <ellipse cx="250" cy="150" rx="34" ry="90" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <ellipse cx="250" cy="150" rx="66" ry="90" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <line x1="160" y1="150" x2="340" y2="150" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <line x1="250" y1="60" x2="250" y2="240" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
          </g>

          {/* 2. SWOOSH / INFINITY LOOP RIBBON */}
          <path
            className="swoosh-path"
            d="M 210,75 
               C 160,105 130,180 175,245 
               C 220,310 315,310 365,260 
               C 420,205 470,140 460,95 
               C 450,55 410,25 360,30 
               C 330,32 300,45 285,60 
               C 315,55 370,50 395,85 
               C 425,120 425,180 380,215 
               C 335,245 260,250 205,210 
               C 150,170 145,110 210,75 Z" 
            fill="url(#swoosh-grad)"
            filter="url(#shadow)"
          />

          {/* 3. FLIGHT TRAIL & ORBITING JET */}
          <g>
            <path 
              id="flight-trail-vertical" 
              className="flight-trail-path"
              d="M 160,157 C 150,217 218,242 277,230 C 335,218 352,174 338,137 C 323,100 277,78 233,93 C 189,108 167,133 160,157 Z" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.4)" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
            
            <g id="plane-mover-vertical">
              <g className="airplane-scaler">
                <path 
                  d="M -1,-10 L 0,-14 L 1,-10 L 8,-6 L 2,-5 L 3,2 L 0,0 L -3,2 L -2,-5 L -8,-6 Z" 
                  fill="#00e1d9" 
                />
              </g>
              <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                <mpath href="#flight-trail-vertical" />
              </animateMotion>
            </g>
          </g>

          {/* 4. BRANDING TEXT */}
          <g>
            <text 
              x="250" 
              y="330" 
              fontFamily="'Montserrat', 'Arial Black', sans-serif" 
              fontWeight="900" 
              fontSize="38" 
              letterSpacing="1.5" 
              textAnchor="middle"
              className="ftw-text"
            >
              FLY TO WAY
            </text>

            <g>
              <line x1="100" y1="355" x2="230" y2="355" strokeWidth="1" className="divider-line" />
              <line x1="270" y1="355" x2="400" y2="355" strokeWidth="1" className="divider-line" />
              <path 
                className="divider-plane"
                d="M 246,355 L 248,351 L 250,351 L 249,354 L 254,355 L 252,357 L 253,358 L 251,358 L 250,356 L 249,359 Z" 
                transform="scale(1.2) translate(-41, -74)"
              />
            </g>

            <text 
              x="250" 
              y="385" 
              fontFamily="'Montserrat', sans-serif" 
              fontWeight="800" 
              fontSize="12" 
              letterSpacing="7.5" 
              textAnchor="middle"
              className="subtext"
            >
              TRAVEL & TOURS
            </text>
          </g>
        </g>
      ) : (
        /* ================= HORIZONTAL LAYOUT (NAVBAR & PRINT VOUCHERS) ================= */
        <g>
          {/* 1. GLOBE COMPONENT */}
          <g className="globe-container" style={{ transformOrigin: '90px 90px' }}>
            <circle cx="90" cy="90" r="66" fill="url(#globe-glow-grad)" filter="url(#globe-glow)" />
            <circle cx="90" cy="90" r="62" fill="url(#globe-body-grad)" className="globe-base" />
            <g clipPath="url(#globe-clip-horizontal)">
              <g className="spinning-map">
                <path d={mapPath} fill="rgba(255, 255, 255, 0.45)" transform="translate(90, 90)" />
                <path d={mapPath} fill="rgba(255, 255, 255, 0.45)" transform="translate(270, 90)" />
              </g>
            </g>
            <circle cx="90" cy="90" r="62" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" className="globe-grid" />
            <ellipse cx="90" cy="90" rx="62" ry="24" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <ellipse cx="90" cy="90" rx="62" ry="46" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <ellipse cx="90" cy="90" rx="24" ry="62" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <ellipse cx="90" cy="90" rx="46" ry="62" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <line x1="28" y1="90" x2="152" y2="90" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
            <line x1="90" y1="28" x2="90" y2="152" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
          </g>

          {/* 2. SWOOSH / INFINITY LOOP RIBBON */}
          <path
            className="swoosh-path"
            d="M 60,35 
               C 25,55 10,110 40,155 
               C 70,200 135,200 170,165 
               C 210,125 250,80 310,65 
               C 370,50 425,75 435,125 
               C 445,165 415,205 375,210 
               C 355,212 335,210 325,205 
               C 345,205 385,195 405,170 
               C 425,145 425,105 395,85 
               C 365,65 315,70 275,95 
               C 225,125 185,175 145,190 
               C 95,205 50,185 30,140 
               C 15,100 30,60 60,35 Z" 
            fill="url(#swoosh-grad)"
            filter="url(#shadow)"
          />

          {/* 3. FLIGHT TRAIL & ORBITING JET */}
          <g>
            <path 
              id="flight-trail-horizontal" 
              className="flight-trail-path"
              d="M 28,95 C 22,135 68,152 108,144 C 148,136 160,106 150,81 C 140,56 108,41 78,51 C 48,61 33,78 28,95 Z" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.4)" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
            
            <g id="plane-mover-horizontal">
              <g className="airplane-scaler">
                <path 
                  d="M -1,-10 L 0,-14 L 1,-10 L 8,-6 L 2,-5 L 3,2 L 0,0 L -3,2 L -2,-5 L -8,-6 Z" 
                  fill="#00e1d9" 
                />
              </g>
              <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                <mpath href="#flight-trail-horizontal" />
              </animateMotion>
            </g>
          </g>

          {/* 4. BRANDING TEXT */}
          <g>
            <text 
              x="330" 
              y="85" 
              fontFamily="'Montserrat', 'Arial Black', sans-serif" 
              fontWeight="900" 
              fontSize="34" 
              letterSpacing="1.2" 
              textAnchor="middle"
              className="ftw-text"
            >
              FLY TO WAY
            </text>

            <g>
              <line x1="180" y1="108" x2="310" y2="108" strokeWidth="1" className="divider-line" />
              <line x1="350" y1="108" x2="480" y2="108" strokeWidth="1" className="divider-line" />
              <path 
                className="divider-plane"
                d="M 326,108 L 328,104 L 330,104 L 329,107 L 334,108 L 332,110 L 333,111 L 331,111 L 330,109 L 329,112 Z" 
                transform="scale(1.1) translate(-27, -9)"
              />
            </g>

            <text 
              x="332" 
              y="135" 
              fontFamily="'Montserrat', sans-serif" 
              fontWeight="800" 
              fontSize="12" 
              letterSpacing="7.5" 
              textAnchor="middle"
              className="subtext"
            >
              TRAVEL & TOURS
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
