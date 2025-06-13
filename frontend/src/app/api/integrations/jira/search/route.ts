export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();

    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_BASE_URL 
      : process.env.NEXT_PUBLIC_API_BASE_URL || 'https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1';

    const response = await fetch(`${apiBaseUrl}/integrations/jira/search?${queryParams}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Jira search API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 