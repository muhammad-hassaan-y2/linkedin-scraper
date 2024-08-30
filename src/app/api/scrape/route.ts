import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    // Get the session from NextAuth.js
    const session = await getSession({ req });
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Assuming you've extracted cookies from the session before
    const cookies = [
      {
        name: 'li_at',
        value: session.accessToken,
        domain: '.linkedin.com',
      },
    ];

    const input = {
      cookie: cookies,
      searchUrl: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`,
      deepScrape: true,
      strictMode: false,
      startPage: 1,
      endPage: 2,
      minDelay: 2,
      maxDelay: 5,
      proxy: { useApifyProxy: true },
    };

    const run = await client.actor('curious_coder~linkedin-post-search-scraper').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return NextResponse.json({
      error: 'Failed to fetch LinkedIn posts',
      details: error.message,
    }, { status: 500 });
  }
}
