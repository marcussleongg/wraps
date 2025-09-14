import { NextResponse } from 'next/server';
import { DataLoader } from '@/lib/dataLoader';
import { SpendingSummarizer } from '@/lib/spendingSummarizer';

export async function GET() {
  try {
    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer({
      useAIFallback: true,  // Enable to read from cache
      apiKey: undefined     // No API key = won't trigger Claude calls
    });

    const allMerchantData = dataLoader.loadAllMerchantData();
    const summary = await summarizer.summarizeSpending(allMerchantData);

    // Get the top spending card
    const topCard = summary.paymentMethodSummary[0];

    if (!topCard) {
      return NextResponse.json(
        { error: 'No payment methods found' },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const totalSpentAllCards = summary.paymentMethodSummary.reduce(
      (sum, card) => sum + card.totalSpent, 
      0
    );
    
    const spendingPercentage = ((topCard.totalSpent / totalSpentAllCards) * 100).toFixed(1);
    
    const averageTransactionAmount = topCard.totalSpent / topCard.transactionCount;

    // Find the merchant where this card was used most
    let topMerchantForCard = null;
    let maxMerchantSpending = 0;

    for (const merchant of summary.merchantSummaries) {
      const cardInMerchant = merchant.paymentMethodBreakdown.find(
        pm => pm.brand === topCard.brand && pm.lastFour === topCard.lastFour
      );
      
      if (cardInMerchant && cardInMerchant.totalSpent > maxMerchantSpending) {
        maxMerchantSpending = cardInMerchant.totalSpent;
        topMerchantForCard = {
          merchantName: merchant.merchantName,
          spentAtMerchant: cardInMerchant.totalSpent,
          transactionsAtMerchant: cardInMerchant.transactionCount
        };
      }
    }

    // Build the response object conditionally
    const topSpendingCardResponse: any = {
      lastFour: topCard.lastFour,
      totalSpent: topCard.totalSpent,
      transactionCount: topCard.transactionCount,
      averageTransactionAmount,
      spendingPercentage: parseFloat(spendingPercentage),
      topMerchant: topMerchantForCard
    };

    // Only include brand if it's not "Unknown" or undefined
    if (topCard.brand && topCard.brand !== 'Unknown') {
      topSpendingCardResponse.brand = topCard.brand;
    }

    return NextResponse.json({
      topSpendingCard: topSpendingCardResponse,
      allCardsTotal: totalSpentAllCards,
      cardCount: summary.paymentMethodSummary.length,
      comparison: {
        secondHighest: summary.paymentMethodSummary[1] || null,
        difference: summary.paymentMethodSummary[1] 
          ? topCard.totalSpent - summary.paymentMethodSummary[1].totalSpent 
          : topCard.totalSpent
      }
    });

  } catch (error) {
    console.error('Error getting top spending card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
