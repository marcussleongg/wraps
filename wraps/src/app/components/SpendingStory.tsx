'use client';

import { useState, useEffect } from 'react';

interface StoryProps {
  onComplete: () => void;
}

export default function SpendingStory({ onComplete }: StoryProps) {
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  
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

  const handleShare = async () => {
    const shareData = {
      title: 'My Spending Story - Knotted',
      text: `Check out my spending insights! ${currentStoryData.category}: ${currentStoryData.amount}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported and we're on mobile
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
      } else {
        // For desktop/web, always show the modal instead of trying to share
        setShowShareModal(true);
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback: show modal
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Clipboard error:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  const shareToSocial = (platform: string) => {
    const shareText = `Check out my spending insights! ${currentStoryData.category}: ${currentStoryData.amount}`;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareText);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
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
          <button 
            onClick={() => setShowShareModal(true)}
            className="bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors"
          >
            <span className="material-symbols-outlined">share</span>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">Share Your Story</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => copyToClipboard(`Check out my spending insights! ${currentStoryData.category}: ${currentStoryData.amount} - ${window.location.href}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                <span className="material-symbols-outlined">content_copy</span>
                Copy Link
              </button>
              
              <button
                onClick={handleShare}
                className="w-full bg-white/20 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined">share</span>
                Share via Device
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="bg-blue-400/20 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-blue-400/30 transition-colors"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Twitter
                </button>
                
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="bg-blue-600/20 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-colors"
                >
                  <span className="material-symbols-outlined">facebook</span>
                  Facebook
                </button>
                
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="bg-blue-700/20 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-blue-700/30 transition-colors"
                >
                  <span className="material-symbols-outlined">work</span>
                  LinkedIn
                </button>
                
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="bg-green-500/20 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
                >
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
