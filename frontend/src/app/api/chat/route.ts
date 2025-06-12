import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Always use real AWS API Gateway (we have OpenRouter API key configured)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');

    // Only require auth if API URL is configured (production mode)
    if (apiUrl && !authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    if (!apiUrl) {
      // Return empty conversations if API URL not configured
      return NextResponse.json({
        conversations: [],
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${apiUrl}/chat`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);
    // Return empty conversations on error
    return NextResponse.json({
      conversations: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, model = 'default' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Always use real AWS API Gateway (we have OpenRouter API key configured)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');

    // Only require auth if API URL is configured (production mode)
    if (apiUrl && !authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    if (!apiUrl) {
      // Fallback to mock response if API URL not configured
      const newConversationId = conversationId || `conv_${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      const userMessage = {
        messageId: `msg_${Date.now()}`,
        userId: 'user_1',
        conversationId: newConversationId,
        role: 'user' as const,
        content: message,
        timestamp,
      };

      const aiMessage = {
        messageId: `msg_${Date.now() + 1}`,
        userId: 'user_1',
        conversationId: newConversationId,
        role: 'assistant' as const,
        content: `I understand you're asking about "${message}". This is a fallback response because the API URL is not configured. Please check your environment variables.`,
        timestamp: new Date().toISOString(),
        model,
        tokens: 50,
      };

      return NextResponse.json({
        userMessage,
        aiMessage,
        conversationId: newConversationId,
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, conversationId, model }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} - ${errorText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to create chat message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.length - 1];

    if (!conversationId || conversationId === 'chat') {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');

    // Only require auth if API URL is configured (production mode)
    if (apiUrl && !authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    if (!apiUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${apiUrl}/chat/${conversationId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} - ${errorText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Delete conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation. Please try again.' },
      { status: 500 }
    );
  }
} 