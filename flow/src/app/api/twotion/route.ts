import { NextRequest, NextResponse } from 'next/server';

// 2TIO Consumer API
const TWOTION_API = 'https://cp-2tio-consumer-api-node-dev-633383779286.us-central1.run.app/api/v1';
const TWOTION_API_KEY = process.env.TWOTION_API_KEY || '';

// ERCOT API (for Zillow usage data only)
const ERCOT_API = 'https://ercot.api.comparepower.com';

// Helper to get user ID from request headers or cookies
function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id') || request.cookies.get('twotion-user-id')?.value || null;
}

// Helper to get 2TIO headers
function getTwotionHeaders(userId?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (TWOTION_API_KEY) {
    headers['x-api-key'] = TWOTION_API_KEY;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Address search using ERCOT - returns addresses with ESIIDs
    if (action === 'address-search') {
      const query = searchParams.get('query');

      if (!query || query.length < 3) {
        return NextResponse.json([]);
      }

      const response = await fetch(`${ERCOT_API}/api/esiids?address=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search addresses');

      const data = await response.json();

      // Filter and format results for autocomplete
      // Only return Active residential addresses, limit to 10 unique addresses
      const seen = new Set<string>();
      const results = data
        .filter((item: { status: string; premise_type: string }) =>
          item.status === 'Active' && item.premise_type === 'Residential'
        )
        .filter((item: { address: string; city: string; state: string; zip_code: string }) => {
          const key = `${item.address}-${item.city}-${item.zip_code}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 10)
        .map((item: {
          address: string;
          city: string;
          state: string;
          zip_code: string;
          esiid: string;
          premise_type: string;
        }) => ({
          address: item.address,
          city: item.city,
          state: item.state,
          zipCode: item.zip_code,
          esiid: item.esiid,
          premiseType: item.premise_type,
          formatted: `${item.address}, ${item.city}, ${item.state} ${item.zip_code}`,
        }));

      return NextResponse.json(results);
    }

    // ERCOT actions (for Zillow data)
    if (action === 'search-esiids') {
      const address = searchParams.get('address');
      const zip = searchParams.get('zip_code');

      if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
      }

      const params = new URLSearchParams({ address });
      if (zip) params.append('zip_code', zip);

      const response = await fetch(`${ERCOT_API}/api/esiids?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ESIIDs');

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'usage-profile') {
      const esiid = searchParams.get('esiid');

      if (!esiid) {
        return NextResponse.json({ error: 'ESIID is required' }, { status: 400 });
      }

      const response = await fetch(`${ERCOT_API}/api/esiids/${esiid}/profile`);
      if (!response.ok) throw new Error('Failed to fetch usage profile');

      const data = await response.json();
      return NextResponse.json(data);
    }

    // 2TIO actions
    if (action === 'get-esiid') {
      const userId = getUserId(request);
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 401 });
      }

      const streetNumber = searchParams.get('streetNumber');
      const streetName = searchParams.get('streetName');
      const city = searchParams.get('city');
      const state = searchParams.get('state');
      const zipCode = searchParams.get('zipCode');

      const params = new URLSearchParams();
      if (streetNumber) params.append('streetNumber', streetNumber);
      if (streetName) params.append('streetName', streetName);
      if (city) params.append('city', city);
      if (state) params.append('state', state);
      if (zipCode) params.append('zipCode', zipCode);

      const response = await fetch(`${TWOTION_API}/users/get-esiid?${params}`, {
        headers: getTwotionHeaders(userId),
      });

      if (!response.ok) throw new Error('Failed to get ESIID');
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'services') {
      const zipCode = searchParams.get('zipCode');
      if (!zipCode) {
        return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
      }

      const response = await fetch(`${TWOTION_API}/services?zipCode=${zipCode}`, {
        headers: getTwotionHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'plans') {
      const serviceName = searchParams.get('service') || 'electricity';
      const zipCode = searchParams.get('zipCode');
      const electricityUsage = searchParams.get('electricityUsage');

      if (!zipCode) {
        return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
      }

      let url = `${TWOTION_API}/services/${serviceName}/plans?zipCode=${zipCode}`;

      // Pass electricity usage to API for server-side cost calculation
      if (serviceName === 'electricity' && electricityUsage) {
        url += `&electricityUsage=${encodeURIComponent(electricityUsage)}`;
      }

      const headers = getTwotionHeaders();

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Plans API error:', response.status, errorText);
        // Pass through the actual status code (e.g., 429 for rate limiting)
        return NextResponse.json(
          { error: `Failed to fetch plans: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'cart') {
      const userId = getUserId(request);
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 401 });
      }

      const response = await fetch(`${TWOTION_API}/cart`, {
        headers: getTwotionHeaders(userId),
      });

      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'checkout-steps') {
      const userId = getUserId(request);
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 401 });
      }

      const response = await fetch(`${TWOTION_API}/checkout/steps`, {
        headers: getTwotionHeaders(userId),
      });

      if (!response.ok) throw new Error('Failed to fetch checkout steps');
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'order-status') {
      const confirmationId = searchParams.get('confirmationId');
      const lastName = searchParams.get('lastName');
      const zip = searchParams.get('zip');

      if (!confirmationId || !lastName || !zip) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const response = await fetch(
        `${TWOTION_API}/orders/lookup?confirmationId=${confirmationId}&lastName=${lastName}&zip=${zip}`
      );

      if (!response.ok) throw new Error('Failed to fetch order status');
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Generate user ID (no auth required)
    if (action === 'generate-user-id') {
      const response = await fetch(`${TWOTION_API}/users/generate-id`, {
        method: 'POST',
        headers: getTwotionHeaders(),
      });

      if (!response.ok) throw new Error('Failed to generate user ID');
      const data = await response.json();

      // Set cookie with user ID
      const res = NextResponse.json(data);
      res.cookies.set('twotion-user-id', data.userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    const userId = getUserId(request);
    if (!userId && action !== 'generate-user-id') {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Handle checkout separately since it uses formData, not JSON
    if (action === 'checkout') {
      const formData = await request.formData();

      const response = await fetch(`${TWOTION_API}/checkout/complete`, {
        method: 'POST',
        headers: getTwotionHeaders(userId),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout error:', response.status, errorText);
        throw new Error('Failed to complete checkout');
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Other POST actions use JSON body
    const body = await request.json();

    if (action === 'get-started') {
      const response = await fetch(`${TWOTION_API}/users/get-started`, {
        method: 'POST',
        headers: {
          ...getTwotionHeaders(userId),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to initialize user');
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'add-to-cart') {
      const response = await fetch(`${TWOTION_API}/cart/plans`, {
        method: 'POST',
        headers: {
          ...getTwotionHeaders(userId),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }

  try {
    if (action === 'remove-from-cart') {
      const planId = searchParams.get('planId');
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
      }

      const response = await fetch(`${TWOTION_API}/cart/plans/${planId}`, {
        method: 'DELETE',
        headers: getTwotionHeaders(userId),
      });

      if (!response.ok) throw new Error('Failed to remove from cart');
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
