import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This is a placeholder API route until our Lambda backend is ready
  // In production, this will proxy to our AWS API Gateway
  
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Mock user profile data
  const mockProfile = {
    email: 'user@example.com',
    given_name: 'Demo',
    family_name: 'User',
    custom_role: 'dev',
    custom_theme: 'dev',
    custom_inviteCode: 'DEMO123',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(mockProfile);
}

export async function PUT(request: NextRequest) {
  // Placeholder for updating user profile
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  
  // In production, this would update the user profile via our API Gateway
  console.log('Profile update request:', body);
  
  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
  });
} 