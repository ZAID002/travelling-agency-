'use client';

import React from 'react';

export default function AnimatedLogo({ className, theme, ...props }) {
  // Low-poly stylized world map path (tiled seamlessly at width 180px)
  const mapPath = "M -80,-35 c 10,-5 20,5 30,10 c 10,5 20,10 30,15 c -5,10 -15,20 -25,15 c -10,-5 -15,-15 -25,-20 c -5,-5 -10,-10 -10,-20 z M -45,10 c 10,5 15,15 10,30 c -5,10 -10,20 -15,25 c -2,-10 -5,-20 -10,-30 c -2,-10 5,-20 15,-25 z M -45,-45 c 5,2 10,5 5,10 c -5,2 -10,-2 -5,-10 z M -10,15 c 15,0 25,10 25,20 c -3,15 -10,25 -20,30 c -5,-10 -10,-20 -7,-30 c 2,-10 2,-20 2,-20 z M -20,-10 c 5,-10 15,-15 30,-20 c 15,-5 35,0 50,10 c 10,10 15,20 5,35 c -10,10 -25,15 -35,5 c -10,-10 -25,-20 -50,-30 z M 15,5 c 5,5 10,15 7,25 c -4,-5 -7,-15 -7,-25 z M 45,35 c 10,0 20,5 15,15 c -10,5 -20,0 -15,-15 z";

  const logoClass = theme ? `logo-${theme}` : '';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 240"
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

        {/* Text gradients */}
        <linearGradient id="text-grad-light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a4c95" />
          <stop offset="100%" stopColor="#002d62" />
        </linearGradient>
        
        <linearGradient id="text-grad-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>

        {/* Clip path for spinning world map on the globe */}
        <clipPath id="globe-clip">
          <circle cx="90" cy="100" r="62" />
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
          fill: #ffffff;
          filter: drop-shadow(0 2px 8px rgba(56, 189, 248, 0.3));
        }
        
        .subtext {
          fill: #475569;
          transition: fill 0.3s ease, letter-spacing 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logo-dark .subtext, [data-theme="dark"] .subtext {
          fill: #ffffff;
          font-weight: 700;
        }
        svg:hover .subtext {
          letter-spacing: 6.5px;
        }

        .divider-line {
          stroke: #0a4c95;
          transition: stroke 0.3s ease, stroke-width 0.3s ease;
        }
        .logo-dark .divider-line, [data-theme="dark"] .divider-line {
          stroke: #38bdf8;
        }
        svg:hover .divider-line {
          stroke-width: 2px;
        }

        .divider-plane {
          fill: #0a4c95;
          transition: fill 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: 325px 135px;
        }
        .logo-dark .divider-plane, [data-theme="dark"] .divider-plane {
          fill: #38bdf8;
        }
        svg:hover .divider-plane {
          transform: scale(1.3) rotate(15deg);
        }

        /* Globe pulse effect on hover */
        .globe-container {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: 90px 100px;
        }
        svg:hover .globe-container {
          transform: scale(1.04);
        }
      ` }} />

      {/* 1. GLOBE COMPONENT */}
      <g className="globe-container">
        {/* Outer subtle glow rim */}
        <circle cx="90" cy="100" r="66" fill="url(#globe-glow-grad)" filter="url(#globe-glow)" />
        
        {/* Globe base sphere */}
        <circle cx="90" cy="100" r="62" fill="url(#globe-body-grad)" className="globe-base" />

        {/* 3D Spinning Map clipped to sphere */}
        <g clipPath="url(#globe-clip)">
          <g className="spinning-map">
            <path d={mapPath} fill="rgba(255, 255, 255, 0.45)" transform="translate(90, 100)" />
            <path d={mapPath} fill="rgba(255, 255, 255, 0.45)" transform="translate(270, 100)" />
          </g>
        </g>

        {/* Grid lines (Longitudes & Latitudes) */}
        <circle cx="90" cy="100" r="62" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" className="globe-grid" />
        <ellipse cx="90" cy="100" rx="62" ry="24" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
        <ellipse cx="90" cy="100" rx="62" ry="46" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
        <ellipse cx="90" cy="100" rx="24" ry="62" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
        <ellipse cx="90" cy="100" rx="46" ry="62" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
        <line x1="28" y1="100" x2="152" y2="100" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
        <line x1="90" y1="38" x2="90" y2="162" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" className="globe-grid" />
      </g>

      {/* 2. SWOOSH / INFINITY LOOP RIBBON */}
      <path
        className="swoosh-path"
        d="M 60,45 
           C 25,65 10,120 40,165 
           C 70,210 135,210 170,175 
           C 210,135 250,90 310,75 
           C 370,60 425,85 435,135 
           C 445,175 415,215 375,220 
           C 355,222 335,220 325,215 
           C 345,215 385,205 405,180 
           C 425,155 425,115 395,95 
           C 365,75 315,80 275,105 
           C 225,135 185,185 145,200 
           C 95,215 50,195 30,150 
           C 15,110 30,70 60,45 Z" 
        fill="url(#swoosh-grad)"
        filter="url(#shadow)"
      />

      {/* 3. FLIGHT TRAIL & ORBITING JET */}
      <g>
        {/* White dashed trail around the globe */}
        <path 
          id="flight-trail" 
          className="flight-trail-path"
          d="M 28,105 C 22,145 68,162 108,154 C 148,146 160,116 150,91 C 140,66 108,51 78,61 C 48,71 33,88 28,105 Z" 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.4)" 
          strokeWidth="1.5" 
          strokeDasharray="4 4" 
        />
        
        {/* Orbiting Airplane Container */}
        <g id="plane-mover">
          {/* Scaler handles scaling/depth visual synchronization */}
          <g className="airplane-scaler">
            <path 
              d="M -1,-10 L 0,-14 L 1,-10 L 8,-6 L 2,-5 L 3,2 L 0,0 L -3,2 L -2,-5 L -8,-6 Z" 
              fill="#00e1d9" 
            />
          </g>
          <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
            <mpath href="#flight-trail" />
          </animateMotion>
        </g>
      </g>

      {/* 4. BRANDING TEXT */}
      <g>
        {/* Serif FTW Letters */}
        <text 
          x="325" 
          y="118" 
          fontFamily="'Playfair Display', Georgia, serif" 
          fontWeight="900" 
          fontSize="54" 
          letterSpacing="1" 
          textAnchor="middle"
          className="ftw-text"
        >
          FTW
        </text>

        {/* Divider with Center Airplane */}
        <g>
          <line x1="240" y1="135" x2="310" y2="135" strokeWidth="1" className="divider-line" />
          <line x1="340" y1="135" x2="410" y2="135" strokeWidth="1" className="divider-line" />
          {/* Small airplane icon pointing right */}
          <path 
            className="divider-plane"
            d="M 321,135 L 323,131 L 325,131 L 324,134 L 329,135 L 327,137 L 328,138 L 326,138 L 325,136 L 324,139 Z" 
          />
        </g>

        {/* Sans-serif Subtext */}
        <text 
          x="327" 
          y="158" 
          fontFamily="'Montserrat', sans-serif" 
          fontWeight="600" 
          fontSize="11" 
          letterSpacing="5.2" 
          textAnchor="middle"
          className="subtext"
        >
          TRAVEL & TOURS
        </text>
      </g>
    </svg>
  );
}
