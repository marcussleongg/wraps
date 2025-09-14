'use client';

import { useState, useEffect } from 'react';
import { SpendingAPI, SpendingData, MerchantSummary, CategorySummary } from '../services/api';
import PieChart from './PieChart';

interface StoryProps {
  onComplete: () => void;
}

interface Story {
  id: number;
  title: string;
  category: string;
  amount: string;
  description: string;
  backgroundImage: string;
  gradient: string;
}

export default function SpendingStory({ onComplete }: StoryProps) {
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPieChart, setShowPieChart] = useState(false);

  const currentStoryData = stories[currentStory];

  // Generate AI description using Groq
  const generateAIDescription = async (title: string, category: string, amount: string, context: string): Promise<string> => {
    try {
      const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!groqApiKey) {
        return context; // Fallback to provided context
      }

      const systemPrompt = `You are a witty, friendly financial advisor creating personalized spending insights. 
      Generate short, engaging descriptions (under 20 words) that are:
      - Playful but not judgmental
      - Specific to the spending data
      - Encouraging and fun
      - Instagram story style
      Examples: "Holiday shopping got the best of you!", "You really love your gadgets!", "Prime delivery was your best friend!"`;

      const userPrompt = `Generate a fun description for: ${title} - ${category} - ${amount}. 
      Context: ${context}. 
      Make it personal and engaging like a social media post.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 30,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || context;
    } catch (error) {
      console.error('Error generating AI description:', error);
      return context; // Fallback to provided context
    }
  };

  // Fetch spending data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await SpendingAPI.getSpendingData();
        setSpendingData(data);
        const generatedStories = await generateStoriesFromData(data);
        setStories(generatedStories);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching spending data:', error);
        // Fallback to sample data
        const fallbackStories = generateFallbackStories();
        setStories(fallbackStories);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate stories from API data
  const generateStoriesFromData = async (data: SpendingData): Promise<Story[]> => {
    const stories: Story[] = [];
    const gradients = [
      "linear-gradient(135deg, #7f1d1d, #991b1b)", // red-900 to red-700
      "linear-gradient(135deg, #1e3a8a, #1d4ed8)", // blue-900 to blue-700
      "linear-gradient(135deg, #14532d, #15803d)", // green-900 to green-700
      "linear-gradient(135deg, #581c87, #7c3aed)", // purple-900 to purple-700
      "linear-gradient(135deg, #9a3412, #ea580c)", // orange-900 to orange-700
      "linear-gradient(135deg, #134e4a, #0f766e)", // teal-900 to teal-700
      "linear-gradient(135deg, #831843, #be185d)", // pink-900 to pink-700
      "linear-gradient(135deg, #312e81, #4338ca)", // indigo-900 to indigo-700
      "linear-gradient(135deg, #713f12, #ca8a04)", // yellow-900 to yellow-700
      "linear-gradient(135deg, #164e63, #0891b2)", // cyan-900 to cyan-700
      "linear-gradient(135deg, #064e3b, #047857)", // emerald-900 to emerald-700
      "linear-gradient(135deg, #4c1d95, #6d28d9)"  // violet-900 to violet-700
    ];
    
    let storyId = 1;
    let gradientIndex = 0;

    // Story 1: Total Spending
    const totalDescription = await generateAIDescription(
      "Total Year Spending",
      "2024",
      SpendingAPI.formatCurrency(data.totalSpent),
      `${data.totalTransactions} transactions this year!`
    );
    stories.push({
      id: storyId++,
      title: "Total Year Spending",
      category: "2024",
      amount: SpendingAPI.formatCurrency(data.totalSpent),
      description: totalDescription,
      backgroundImage: "",
      gradient: gradients[gradientIndex++ % gradients.length]
    });

    // Story 2: Top Category
    if (data.topCategories.length > 0) {
      const topCategory = data.topCategories[0];
      const categoryDescription = await generateAIDescription(
        "Top Spending Category",
        topCategory.category,
        SpendingAPI.formatCurrency(topCategory.totalSpent),
        `${topCategory.itemCount} items purchased!`
      );
      stories.push({
        id: storyId++,
        title: "Top Spending Category",
        category: topCategory.category,
        amount: SpendingAPI.formatCurrency(topCategory.totalSpent),
        description: categoryDescription,
        backgroundImage: "",
        gradient: gradients[gradientIndex++ % gradients.length]
      });
    }

    // Story 3: Top Merchant
    if (data.merchantSummaries.length > 0) {
      const topMerchant = data.merchantSummaries[0];
      const merchantDescription = await generateAIDescription(
        "Favorite Store",
        topMerchant.merchantName,
        SpendingAPI.formatCurrency(topMerchant.totalSpent),
        `${topMerchant.transactionCount} visits this year!`
      );
      stories.push({
        id: storyId++,
        title: "Favorite Store",
        category: topMerchant.merchantName,
        amount: SpendingAPI.formatCurrency(topMerchant.totalSpent),
        description: merchantDescription,
        backgroundImage: "",
        gradient: gradients[gradientIndex++ % gradients.length]
      });
    }

    // Story 4: Average Order Value
    const avgDescription = await generateAIDescription(
      "Average Order Value",
      "Per Transaction",
      SpendingAPI.formatCurrency(data.averageOrderValue),
      "Your typical spending per purchase"
    );
    stories.push({
      id: storyId++,
      title: "Average Order Value",
      category: "Per Transaction",
      amount: SpendingAPI.formatCurrency(data.averageOrderValue),
      description: avgDescription,
      backgroundImage: "",
      gradient: gradients[gradientIndex++ % gradients.length]
    });


    // Story 6: Top Product (if available)
    if (data.topCategories.length > 0 && data.topCategories[0].topProducts.length > 0) {
      const topProduct = data.topCategories[0].topProducts[0];
      const productDescription = await generateAIDescription(
        "Biggest Purchase",
        topProduct.name,
        SpendingAPI.formatCurrency(topProduct.totalSpent),
        "Your most expensive single item!"
      );
      stories.push({
        id: storyId++,
        title: "Biggest Purchase",
        category: topProduct.name,
        amount: SpendingAPI.formatCurrency(topProduct.totalSpent),
        description: productDescription,
        backgroundImage: "",
        gradient: gradients[gradientIndex++ % gradients.length]
      });
    }

    // Story 7: Payment Method
    if (data.paymentMethodSummary.length > 0) {
      const topPaymentMethod = data.paymentMethodSummary[0];
      const paymentDescription = await generateAIDescription(
        "Preferred Payment",
        `${topPaymentMethod.brand} •••• ${topPaymentMethod.lastFour}`,
        SpendingAPI.formatCurrency(topPaymentMethod.totalSpent),
        `${topPaymentMethod.transactionCount} transactions`
      );
      stories.push({
        id: storyId++,
        title: "Preferred Payment",
        category: `${topPaymentMethod.brand} •••• ${topPaymentMethod.lastFour}`,
        amount: SpendingAPI.formatCurrency(topPaymentMethod.totalSpent),
        description: paymentDescription,
        backgroundImage: "",
        gradient: gradients[gradientIndex++ % gradients.length]
      });
    }




    return stories;
  };

  // Fallback stories if API fails
  const generateFallbackStories = (): Story[] => {
    const gradients = [
      "linear-gradient(135deg, #7f1d1d, #991b1b)", // red-900 to red-700
      "linear-gradient(135deg, #1e3a8a, #1d4ed8)", // blue-900 to blue-700
      "linear-gradient(135deg, #14532d, #15803d)", // green-900 to green-700
      "linear-gradient(135deg, #581c87, #7c3aed)", // purple-900 to purple-700
      "linear-gradient(135deg, #9a3412, #ea580c)", // orange-900 to orange-700
      "linear-gradient(135deg, #134e4a, #0f766e)", // teal-900 to teal-700
      "linear-gradient(135deg, #831843, #be185d)", // pink-900 to pink-700
      "linear-gradient(135deg, #312e81, #4338ca)", // indigo-900 to indigo-700
      "linear-gradient(135deg, #713f12, #ca8a04)", // yellow-900 to yellow-700
      "linear-gradient(135deg, #164e63, #0891b2)", // cyan-900 to cyan-700
      "linear-gradient(135deg, #064e3b, #047857)", // emerald-900 to emerald-700
      "linear-gradient(135deg, #4c1d95, #6d28d9)"  // violet-900 to violet-700
    ];

    return [
      {
        id: 1,
        title: "Total Year Spending",
        category: "2024",
        amount: "$12,450.78",
        description: "1,260 transactions this year!",
        backgroundImage: "",
        gradient: gradients[0]
      },
      {
        id: 2,
        title: "Top Spending Category",
        category: "Electronics",
        amount: "$4,250.32",
        description: "You love your gadgets!",
        backgroundImage: "",
        gradient: gradients[1]
      },
      {
        id: 3,
        title: "Favorite Store",
        category: "Amazon",
        amount: "$3,890.45",
        description: "285 visits this year!",
        backgroundImage: "",
        gradient: gradients[2]
      },
      {
        id: 4,
        title: "Average Order Value",
        category: "Per Transaction",
        amount: "$449.46",
        description: "Your typical spending per purchase",
        backgroundImage: "",
        gradient: gradients[3]
      },
      {
        id: 5,
        title: "Biggest Purchase",
        category: "iPhone 15 Pro",
        amount: "$1,299.99",
        description: "Your most expensive single item!",
        backgroundImage: "",
        gradient: gradients[4]
      },
      {
        id: 6,
        title: "Preferred Payment",
        category: "VISA •••• 4404",
        amount: "$8,450.32",
        description: "456 transactions",
        backgroundImage: "",
        gradient: gradients[5]
      }
    ];
  };

  useEffect(() => {
    if (isLoading || stories.length === 0) return;

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

    // Auto-advance to next story after 5 seconds (but not from the last story)
    const storyTimeout = setTimeout(() => {
      if (currentStory < stories.length - 1) {
        setCurrentStory(prev => prev + 1);
      }
      // Don't auto-advance from the last story - user must manually click to see pie chart
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(storyTimeout);
    };
  }, [currentStory, stories.length, isLoading, onComplete]);

  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(prev => prev + 1);
    } else {
      // Show pie chart on the last slide
      setShowPieChart(true);
    }
  };

  const handlePrevious = () => {
    if (currentStory > 0) {
      setCurrentStory(prev => prev - 1);
    }
  };

  const handlePieChartClose = () => {
    setShowPieChart(false);
    // Go back to the last story
    setCurrentStory(stories.length - 1);
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="relative w-screen h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your spending story...</p>
        </div>
      </div>
    );
  }

  if (showPieChart && spendingData) {
    return <PieChart onClose={handlePieChartClose} spendingData={spendingData} />;
  }

  // Show error state if no stories available
  if (stories.length === 0) {
    return (
      <div className="relative w-screen h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <span className="material-symbols-outlined text-6xl mb-4">error</span>
          <p className="text-lg">Unable to load spending data</p>
          <button 
            onClick={onComplete}
            className="mt-4 bg-white/20 px-6 py-2 rounded-full hover:bg-white/30 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

      {/* Background with gradient */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: currentStoryData.gradient
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-8">
          <span className="text-lg font-medium text-white/80">
            {currentStoryData.title}
          </span>
          <h1 className="text-7xl font-black tracking-tighter my-2 text-white">
            {currentStoryData.category}
          </h1>
          <p className="text-2xl font-bold text-white/90">
            {currentStoryData.amount}
          </p>
          <p className="text-sm text-white/70 mt-2 max-w-xs">
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