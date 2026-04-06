// src/app/api/stock/route.ts
// Proxies Yahoo Finance chart API server-side to avoid browser CORS restrictions.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get('symbol');
  const range  = searchParams.get('range') ?? '1y';

  if (!symbol) {
    return NextResponse.json({ error: 'symbol param required' }, { status: 400 });
  }

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=${encodeURIComponent(range)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      },
      next: { revalidate: 900 }, // cache 15 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo Finance returned ${res.status}` },
        { status: res.status },
      );
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
  }
}
