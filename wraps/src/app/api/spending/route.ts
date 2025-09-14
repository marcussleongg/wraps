import { NextRequest, NextResponse } from 'next/server';
import { DataLoader } from '@/lib/dataLoader';
import { SpendingSummarizer } from '@/lib/spendingSummarizer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantId = searchParams.get('merchantId');

    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer({
      useAIFallback: true,
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    if (merchantId) {
      // Get summary for specific merchant
      const merchantData = dataLoader.loadMerchantData(parseInt(merchantId));
      if (!merchantData) {
        return NextResponse.json(
          { error: 'Merchant not found' },
          { status: 404 }
        );
      }
      
      const summary = await summarizer.summarizeSpending([merchantData]);
      return NextResponse.json(summary);
    } else {
      // Get summary for all merchants
      const allMerchantData = dataLoader.loadAllMerchantData();
      const summary = await summarizer.summarizeSpending(allMerchantData);
      return NextResponse.json(summary);
    }
  } catch (error) {
    console.error('Error generating spending summary:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantIds } = body;

    if (!Array.isArray(merchantIds)) {
      return NextResponse.json(
        { error: 'merchantIds must be an array' },
        { status: 400 }
      );
    }

    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer({
      useAIFallback: true,
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const merchantDataArray = merchantIds
      .map(id => dataLoader.loadMerchantData(id))
      .filter(data => data !== null);

    if (merchantDataArray.length === 0) {
      return NextResponse.json(
        { error: 'No valid merchants found' },
        { status: 404 }
      );
    }

    const summary = await summarizer.summarizeSpending(merchantDataArray);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating spending summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
