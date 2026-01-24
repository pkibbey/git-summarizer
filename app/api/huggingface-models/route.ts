import { NextRequest, NextResponse } from 'next/server';
import { MODELS } from '@/lib/huggingface-models';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || String(MODELS.length), 10);

  try {
    // Return hardcoded models, optionally limited
    const models = MODELS.slice(0, limit);
    return NextResponse.json({
      success: true,
      models,
      count: models.length,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
