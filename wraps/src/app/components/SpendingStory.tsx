'use client';

import { useState, useEffect } from 'react';

interface StoryProps {
  onComplete: () => void;
}

export default function SpendingStory({ onComplete }: StoryProps) {
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Sample spending data for different stories
  const stories = [
    {
      id: 1,
      title: "Top Spending Category",
      category: "Shopping",
      amount: "$2,450.78",
      description: "You really treated yourself this year!",
      backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKka5wFbjiJN8alai0aLc08C-hdyKzQyVyqSyB7e5_Yge7TV6kJ8DHH59umQbHsYsun1VpEDoe0JW4lqDUWNzTR4UdPgsuO-XC9RZwjCrgia0ngmg-9x_I6tA45P0g3MoJs3zvSCGNVoznONIDmMDRkZTZVuzZKOcXv92RmYzu9aA9YQqTfShhTTIbXcXyDKdreKh17yecKGwnI8TP2GdlD1Q8sOZwH395gkThEevQWa3yqd1VhyE2O97iqoTYZeKvOIdZbDFKp0E",
      gradient: "from-indigo-900 to-purple-900"
    },
    {
      id: 2,
      title: "Most Expensive Month",
      category: "December",
      amount: "$3,200.45",
      description: "Holiday shopping got the best of you!",
      backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKka5wFbjiJN8alai0aLc08C-hdyKzQyVyqSyB7e5_Yge7TV6kJ8DHH59umQbHsYsun1VpEDoe0JW4lqDUWNzTR4UdPgsuO-XC9RZwjCrgia0ngmg-9x_I6tA45P0g3MoJs3zvSCGNVoznONIDmMDRkZTZVuzZKOcXv92RmYzu9aA9YQqTfShhTTIbXcXyDKdreKh17yecKGwnI8TP2GdlD1Q8sOZwH395gkThEevQWa3yqd1VhyE2O97iqoTYZeKvOIdZbDFKp0E",
      gradient: "from-purple-900 to-pink-900"
    },
    {
      id: 3,
      title: "Favorite Store",
      category: "Amazon",
      amount: "$1,890.32",
      description: "Prime delivery was your best friend!",
      backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKka5wFbjiJN8alai0aLc08C-hdyKzQyVyqSyB7e5_Yge7TV6kJ8DHH59umQbHsYsun1VpEDoe0JW4lqDUWNzTR4UdPgsuO-XC9RZwjCrgia0ngmg-9x_I6tA45P0g3MoJs3zvSCGNVoznONIDmMDRkZTZVuzZKOcXv92RmYzu9aA9YQqTfShhTTIbXcXyDKdreKh17yecKGwnI8TP2GdlD1Q8sOZwH395gkThEevQWa3yqd1VhyE2O97iqoTYZeKvOIdZbDFKp0E",
      gradient: "from-pink-900 to-red-900"
    },
    {
      id: 4,
      title: "Biggest Single Purchase",
      category: "Electronics",
      amount: "$899.99",
      description: "That new gadget was worth every penny!",
      backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKka5wFbjiJN8alai0aLc08C-hdyKzQyVyqSyB7e5_Yge7TV6kJ8DHH59umQbHsYsun1VpEDoe0JW4lqDUWNzTR4UdPgsuO-XC9RZwjCrgia0ngmg-9x_I6tA45P0g3MoJs3zvSCGNVoznONIDmMDRkZTZVuzZKOcXv92RmYzu9aA9YQqTfShhTTIbXcXyDKdreKh17yecKGwnI8TP2GdlD1Q8sOZwH395gkThEevQWa3yqd1VhyE2O97iqoTYZeKvOIdZbDFKp0E",
      gradient: "from-red-900 to-orange-900"
    },
    {
      id: 5,
      title: "Total Year Spending",
      category: "2024",
      amount: "$12,450.78",
      description: "Here's to another year of smart spending!",
      backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKka5wFbjiJN8alai0aLc08C-hdyKzQyVyqSyB7e5_Yge7TV6kJ8DHH59umQbHsYsun1VpEDoe0JW4lqDUWNzTR4UdPgsuO-XC9RZwjCrgia0ngmg-9x_I6tA45P0g3MoJs3zvSCGNVoznONIDmMDRkZTZVuzZKOcXv92RmYzu9aA9YQqTfShhTTIbXcXyDKdreKh17yecKGwnI8TP2GdlD1Q8sOZwH395gkThEevQWa3yqd1VhyE2O97iqoTYZeKvOIdZbDFKp0E",
      gradient: "from-orange-900 to-yellow-900"
    }
  ];

  const currentStoryData = stories[currentStory];

  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
    
    // Auto-advance progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Auto-advance to next story after 5 seconds
    const storyTimeout = setTimeout(() => {
      if (currentStory < stories.length - 1) {
        setCurrentStory(prev => prev + 1);
      } else {
        onComplete();
      }
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(storyTimeout);
    };
  }, [currentStory, onComplete]);

  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStory > 0) {
      setCurrentStory(prev => prev - 1);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen bg-gradient-to-br shadow-2xl overflow-hidden group/design-root"
      style={{ 
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`
      }}
    >
      {/* Progress bars */}
      <div className="progress-bar-container">
        {stories.map((_, index) => (
          <div 
            key={index}
            className={`progress-bar ${index === currentStory ? 'active' : ''} ${
              index < currentStory ? 'completed' : ''
            }`}
          >
            <div 
              className="progress-bar-fill"
              style={{ 
                width: index === currentStory ? `${progress}%` : 
                       index < currentStory ? '100%' : '0%'
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-5 left-4 right-4 z-20 flex items-center justify-between pt-5">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/a-/ALV-UjV_TkD5J2iUaSUxQGlCHe51sbq3A0y1_YTE5-KyL2s=s96-c")'
            }}
          ></div>
          <span className="text-white font-semibold text-sm">Your Spending Story</span>
        </div>
        <button 
          onClick={onComplete}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url("${currentStoryData.backgroundImage}")`
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-8">
          <span className="text-lg font-medium text-purple-300">
            {currentStoryData.title}
          </span>
          <h1 className="text-7xl font-black tracking-tighter my-2 text-white">
            {currentStoryData.category}
          </h1>
          <p className="text-2xl font-bold text-gray-200">
            {currentStoryData.amount}
          </p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            {currentStoryData.description}
          </p>
        </div>
        
        <div className="w-full flex items-center justify-center">
          <button className="bg-white/20 backdrop-blur-md text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined">ios_sharing</span>
            Share
          </button>
        </div>
      </div>

      {/* Navigation areas */}
      <div className="absolute inset-0 z-10 flex">
        <div 
          className="flex-1 cursor-pointer"
          onClick={handlePrevious}
        ></div>
        <div 
          className="flex-1 cursor-pointer"
          onClick={handleNext}
        ></div>
      </div>
    </div>
  );
}
