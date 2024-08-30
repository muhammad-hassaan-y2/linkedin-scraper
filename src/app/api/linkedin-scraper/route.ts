import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Initialize Apify client
const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

const LINKEDIN_COOKIE = process.env.LINKEDIN_COOKIE;

// Function to call the initial scraper
async function callInitialScraper(keyword: string) {
  const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`;
  console.log('Constructed search URL:', searchUrl);

  const input = {
    searchUrl,
    cookie: [LINKEDIN_COOKIE], // Use the cookie from environment variables
    proxy: { useApifyProxy: true }, // Use Apify's proxy service
  };

  try {
    const run = await client.actor('curious_coder~linkedin-post-search-scraper').call(input);
    console.log('Initial Actor run details:', run);

    // Safely handle response
    if (!run.defaultDatasetId) {
      throw new Error('Dataset ID is missing from the actor run details.');
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log('Initial scraped items:', items);

    return items;
  } catch (error) {
    console.error('Error during scraper execution:', error);
    throw new Error('Scraper failed to execute correctly');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const items = await callInitialScraper(keyword);

    // Return the results
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch LinkedIn posts',
        details: error.message || 'No error message available',
      },
      { status: 500 }
    );
  }
}
