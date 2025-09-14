'use client';

import { useState, useEffect } from 'react';
import { SpendingAPI, PieChartData, PieChartResponse, SpendingData } from '../services/api';

interface PieChartProps {
  onClose: () => void;
  spendingData: SpendingData;
}

export default function PieChart({ onClose, spendingData }: PieChartProps) {
  const [pieData, setPieData] = useState<PieChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate pie chart data from spending data (fallback)
  const generatePieDataFromSpending = (data: SpendingData): PieChartData[] => {
    const categories = data.topCategories;
    const topCategories = categories.slice(0, 6); // Top 6 categories
    const otherCategories = categories.slice(6);
    
    const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.totalSpent, 0);
    const otherItemCount = otherCategories.reduce((sum, cat) => sum + cat.itemCount, 0);
    
    const pieData = topCategories.map(category => ({
      name: category.category,
      value: Math.round(category.totalSpent * 100) / 100,
      percentage: Math.round((category.totalSpent / data.totalSpent) * 100 * 100) / 100,
      itemCount: category.itemCount,
      averagePrice: Math.round(category.averagePrice * 100) / 100,
      color: getCategoryColor(category.category)
    }));

    // Add "Other" slice if there are remaining categories
    if (otherTotal > 0) {
      pieData.push({
        name: "Other",
        value: Math.round(otherTotal * 100) / 100,
        percentage: Math.round((otherTotal / data.totalSpent) * 100 * 100) / 100,
        itemCount: otherItemCount,
        averagePrice: otherItemCount > 0 ? Math.round((otherTotal / otherItemCount) * 100) / 100 : 0,
        color: '#6b7280' // Gray for "Other" (matching API documentation)
      });
    }

    return pieData;
  };

  // Helper function to get predefined category colors
  const getCategoryColor = (category: string): string => {
    const categoryColors: { [key: string]: string } = {
      'Electronics': '#3b82f6',      // Blue
      'Food & Beverages': '#10b981', // Green
      'Health & Beauty': '#ec4899',  // Pink
      'Household': '#f59e0b',        // Amber
      'Clothing': '#8b5cf6',         // Purple
      'Home & Garden': '#84cc16',    // Lime
      'Sports & Outdoors': '#06b6d4', // Cyan
      'Books & Media': '#6366f1',    // Indigo
      'Baby & Kids': '#f97316',      // Orange
      'Pet Supplies': '#14b8a6',     // Teal
      'Other': '#6b7280'             // Gray
    };
    
    return categoryColors[category] || '#9ca3af'; // Default gray
  };

  useEffect(() => {
    const fetchPieData = async () => {
      try {
        // Try to fetch from API first
        const apiData = await SpendingAPI.getPieChartData(6); // Top 6 categories
        setPieData(apiData.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching pie chart data from API, using fallback:', err);
        // Fallback to generating from spending data
        const fallbackData = generatePieDataFromSpending(spendingData);
        setPieData(fallbackData);
        setIsLoading(false);
      }
    };

    fetchPieData();
  }, [spendingData]);

  if (isLoading) {
    return (
      <div className="relative w-screen h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your spending breakdown...</p>
        </div>
      </div>
    );
  }

  // Show fallback if no data available
  if (pieData.length === 0) {
    return (
      <div className="relative w-screen h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <span className="material-symbols-outlined text-6xl mb-4">pie_chart</span>
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-lg mb-4">Unable to generate spending breakdown</p>
          <button
            onClick={onClose}
            className="bg-white/20 backdrop-blur-md text-white font-bold py-2 px-4 rounded-full hover:bg-white/30 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderPieChart = () => {

    let cumulativePercentage = 0;
    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    return (
      <svg width="300" height="300" className="mx-auto">
        {pieData.map((segment, index) => {
          const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
          const endAngle = ((cumulativePercentage + segment.percentage) / 100) * 2 * Math.PI - Math.PI / 2;
          
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          
          const largeArcFlag = segment.percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          cumulativePercentage += segment.percentage;

          return (
            <path
              key={index}
              d={pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };


  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-5 left-4 right-4 z-20 flex items-center justify-between pt-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">pie_chart</span>
          </div>
          <span className="text-white font-semibold text-sm">Your Spending Breakdown</span>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Spending by Category</h1>
          <p className="text-lg text-white/80">Your complete spending breakdown</p>
        </div>

        {/* Pie Chart */}
        <div className="mb-8">
          {renderPieChart()}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {pieData.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1">
                <div className="font-medium">{segment.name}</div>
                <div className="text-white/70">
                  {segment.percentage.toFixed(1)}% • {SpendingAPI.formatCurrency(segment.value)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 text-center">
          <p className="text-white/70">Total Spent</p>
          <p className="text-2xl font-bold">
            {SpendingAPI.formatCurrency(pieData.reduce((sum, segment) => sum + segment.value, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
