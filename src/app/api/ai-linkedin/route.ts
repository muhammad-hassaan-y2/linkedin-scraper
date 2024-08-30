import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const apifyToken = process.env.APIFY_API_TOKEN; // Ensure these environment variables are set correctly
const gptApiKey = process.env.OPENAI_API_KEY;

if (!apifyToken || !gptApiKey) {
  console.error("API tokens are missing.");
}

const client = new ApifyClient({
  token: apifyToken,
});

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      console.error("Keyword is required.");
      return NextResponse.json({ error: 'Keyword is required.' }, { status: 400 });
    }

    // Prepare input for Apify Actor
    const input = {
      startUrls: [{ url: keyword }],
      gpt_api_key: gptApiKey,
      instructions: "Is this person a good candidate for the following job description: Sales Manager of a car company? Why? Also, add a rating from 0 to 10 to summarize.",
      cookies: [
        {
          domain: ".linkedin.com",
          expirationDate: 1721120692,
          hostOnly: false,
          httpOnly: false,
          name: "xxxx_14215E3D5995C57C0A495C55%xxxx",
          path: "/",
          sameSite: "unspecified",
          secure: false,
          session: false,
          storeId: "0",
          value: "-637568504%7CMCIDTS%7C19xxxxxxxxxxxxx",
          id: 1,
        },
      ],
    };

    // Run the Apify Actor and wait for the result
    const run = await client.actor("anchor~linkedin-gpt-prompt").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error occurred:", error); // Log the error to understand what went wrong
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
}
