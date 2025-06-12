import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');

    if (!apiUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    };

    const response = await fetch(`${apiUrl}/integrations/slack/channels`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Slack channels API request failed: ${response.status} - ${errorText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Slack channels API error:', error);
    return NextResponse.json(
      { error: 'Failed to load Slack channels. Please try again.' },
      { status: 500 }
    );
  }
} 