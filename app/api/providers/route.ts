import { NextRequest, NextResponse } from 'next/server';
import { getProviders, getRecommendedModels, searchModels } from '@/lib/providers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    if (query) {
      // Search mode
      const results = searchModels(query);
      return NextResponse.json({
        success: true,
        query,
        results,
        count: results.length,
      });
    }

    // Default: return both providers and recommended models
    const providers = getProviders();
    const models = getRecommendedModels();

    return NextResponse.json({
      success: true,
      providers,
      models,
      totalProviders: providers.length,
      totalModels: models.length,
    });
  } catch (error) {
    console.error('Error fetching providers and models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers and models' },
      { status: 500 }
    );
  }
}
