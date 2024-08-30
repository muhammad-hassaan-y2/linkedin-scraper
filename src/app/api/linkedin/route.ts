import { NextResponse } from 'next/server';

// Replace with your actual API token and endpoint
const APIFY_API_TOKEN = process.env.LINKEDIN_API_TOKEN || '';
const APIFY_API_URL = 'https://api.apify.com/v2/acts/saswave~linkedin-posts-informations-parser/run-sync';

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const response = await fetch(APIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      },
      body: JSON.stringify({
        url: [`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(keyword)}`],
        // Add any additional parameters required by the Apify API
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Failed to fetch LinkedIn posts' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
  }
}
