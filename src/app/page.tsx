
'use client';

import React from 'react';

const DamnBruhPage = () => {
  return (
    <main
      className="flex items-center justify-center min-h-screen bg-black"
      style={{
        perspective: '1000px',
      }}
    >
      <div className="text-center">
        <h1
          className="text-7xl md:text-9xl font-bold text-white select-none"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            color: '#f0f0f0',
            textShadow: `
              0px 1px 0px #c0c0c0,
              0px 2px 0px #b0b0b0,
              0px 3px 0px #a0a0a0,
              0px 4px 0px #909090,
              0px 5px 0px #808080,
              0px 6px 0px #707070,
              0px 7px 0px #606060,
              0px 8px 10px rgba(0,0,0,0.5)
            `,
            transform: 'rotateX(20deg) rotateY(-5deg)',
            letterSpacing: '0.1em',
          }}
        >
          DAMN BRUH
        </h1>
      </div>
    </main>
  );
};

export default DamnBruhPage;
