'use client';

import { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import SpendingStory from './components/SpendingStory';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    // Simulate loading for demonstration - you can replace this with actual API calls
    setTimeout(() => {
      setIsLoading(false);
      setShowStory(true);
    }, 5000); // 5 seconds for demo
  };

  const handleStoryComplete = () => {
    setShowStory(false);
    // You can add navigation to a results page or dashboard here
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showStory) {
    return <SpendingStory onComplete={handleStoryComplete} />;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#122118]">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#264532] px-10 py-4">
        <div className="flex items-center gap-3 text-white">
          <svg
            className="h-8 w-8 text-[var(--primary-color)]"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_6_330)">
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_6_330">
                <rect fill="white" height="48" width="48"></rect>
              </clipPath>
            </defs>
          </svg>
          <h1 className="text-white text-xl font-bold">Knotted</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8"></nav>
        <div className="hidden md:flex items-center gap-4"></div>
        <button className="md:hidden text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <span className="material-symbols-outlined text-6xl text-[var(--primary-color)]">
              insights
            </span>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Discover your spending habits
            </h2>
            <p className="mt-4 text-lg text-gray-300">Powered by Knot API</p>
          </div>
          <div className="space-y-6 pt-8">
            <button 
              onClick={handleGetStarted}
              className="w-full rounded-md py-3 px-4 text-base font-semibold text-[#122118] bg-[var(--primary-color)] hover:bg-[#2fbc69] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 focus:ring-offset-[#122118] transition-all"
            >
              Get Started
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-gray-400">
              lock
            </span>
            <p className="text-sm text-gray-400">
              Your data is encrypted and protected.{" "}
              <a
                className="font-medium text-[var(--primary-color)] hover:underline"
                href="#"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
