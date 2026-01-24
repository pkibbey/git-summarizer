import { NextRequest, NextResponse } from 'next/server';
import { getProvider, getModelsForProvider } from '@/lib/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  try {
    const { providerId } = await params;

    // Get provider details
    const provider = getProvider(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: `Provider "${providerId}" not found` },
        { status: 404 }
      );
    }

    // Get models for this provider
    const models = getModelsForProvider(providerId);

    return NextResponse.json({
      success: true,
      provider,
      models,
      modelCount: models.length,
    });
  } catch (error) {
    console.error(`Error fetching provider ${params}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}
