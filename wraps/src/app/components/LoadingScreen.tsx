'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-gradient-to-br from-[#122118] to-[#14532d] dark group/design-root overflow-hidden" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <div className="absolute inset-0 z-0 opacity-10">
        <svg
          className="absolute bottom-0 left-0"
          height="100%"
          viewBox="0 0 800 800"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(400 400)">
            <path
              d="M260.6-253.2C338-202.8 402.3-101.4 402.3 0C402.3 101.4 338 202.8 260.6 253.2C183.2 303.6 91.6 303.2 0 303.2C-91.6 303.2-183.2 303.6-260.6 253.2C-338 202.8-402.3 101.4-402.3 0C-402.3-101.4-338-202.8-260.6-253.2C-183.2-303.6-91.6-303.2 0-303.2C91.6-303.2 183.2-303.6 260.6-253.2Z"
              fill="#38e07b"
              opacity="0.2"
            ></path>
          </g>
        </svg>
      </div>
      <div className="relative flex h-full grow flex-col items-center justify-center p-6 text-white z-10">
        <div className="text-center max-w-lg mx-auto">
          <div className="flex justify-center items-center mb-8">
            <span className="material-symbols-outlined text-6xl text-[var(--primary-400)] animate-pulse-custom">
              auto_awesome
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Your Year in Review is Loading
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            We're crunching the numbers to craft your personalized spending story. This might take a moment.
          </p>
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-400">
              <p>Generating your Knotted...</p>
              <p>{progress}%</p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-700 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)] relative"
                style={{ 
                  width: `${progress}%`,
                  transition: 'width 0.3s ease-in-out'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-slide"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-400 mt-8 text-sm">
            Stay tuned, your spending story is almost ready!
          </p>
        </div>
      </div>
    </div>
  );
}
