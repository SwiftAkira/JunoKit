import { NextRequest, NextResponse } from 'next/server';

// Mock user profile API for testing authentication flow
// This will be replaced with actual AWS Lambda integration

export async function GET(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Mock user profile data
    const mockProfile = {
      userId: 'mock-user-123',
      email: 'demo@junokit.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'dev',
      theme: 'dev',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockProfile, { status: 200 });
  } catch (error) {
    console.error('Mock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Mock updated profile data
    const updatedProfile = {
      userId: 'mock-user-123',
      email: 'demo@junokit.com',
      firstName: body.firstName || 'Demo',
      lastName: body.lastName || 'User',
      role: body.role || 'dev',
      theme: body.theme || 'dev',
      createdAt: '2025-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('Mock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 