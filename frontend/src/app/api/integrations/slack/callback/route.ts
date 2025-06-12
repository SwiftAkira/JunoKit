import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!apiUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    };

    const response = await fetch(`${apiUrl}/integrations/slack/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Slack callback API request failed: ${response.status} - ${errorText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Slack callback API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Slack OAuth callback. Please try again.' },
      { status: 500 }
    );
  }
} 