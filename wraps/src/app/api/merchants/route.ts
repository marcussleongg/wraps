import { NextResponse } from 'next/server';
import { DataLoader } from '@/lib/dataLoader';

export async function GET() {
  try {
    const dataLoader = new DataLoader();
    const merchants = dataLoader.getAvailableMerchants();
    
    return NextResponse.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
