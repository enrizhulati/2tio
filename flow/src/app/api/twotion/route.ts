import { NextRequest, NextResponse } from 'next/server';

// 2TIO Consumer API
const TWOTION_API = 'https://cp-2tio-consumer-api-node-dev-633383779286.us-central1.run.app/api/v1';
// ERCOT API (for Zillow usage data only)
const ERCOT_API = 'https://ercot.api.comparepower.com';

// Helper to get user ID from request headers or cookies
function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id') || request.cookies.get('twotion-user-id')?.value || null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
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
        headers: { 'x-user-id': userId },
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

      const response = await fetch(`${TWOTION_API}/services?zipCode=${zipCode}`);
      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'plans') {
      const serviceName = searchParams.get('service') || 'electricity';
      const zipCode = searchParams.get('zipCode');

      if (!zipCode) {
        return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
      }

      const response = await fetch(`${TWOTION_API}/services/${serviceName}/plans?zipCode=${zipCode}`);
      if (!response.ok) throw new Error('Failed to fetch plans');

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'cart') {
      const userId = getUserId(request);
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 401 });
      }

      const response = await fetch(`${TWOTION_API}/cart`, {
        headers: { 'x-user-id': userId },
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
        headers: { 'x-user-id': userId },
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

    const body = await request.json();

    if (action === 'get-started') {
      const response = await fetch(`${TWOTION_API}/users/get-started`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId!,
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
          'Content-Type': 'application/json',
          'x-user-id': userId!,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'checkout') {
      // Handle multipart form data for checkout
      const formData = await request.formData();

      const response = await fetch(`${TWOTION_API}/checkout/complete`, {
        method: 'POST',
        headers: { 'x-user-id': userId! },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to complete checkout');
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
        headers: { 'x-user-id': userId },
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
