// app/api/contracts/route.ts
// Proxies contract search requests to SAM.gov Opportunities API
// so the browser avoids CORS issues.

import { NextRequest, NextResponse } from 'next/server';

const SAM_BASE = 'https://api.sam.gov/opportunities/v2/search';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const apiKey = p.get('apiKey');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'SAM.gov API key is required. Get one free at sam.gov → Profile → API Key.' },
      { status: 400 },
    );
  }

  // Build SAM.gov query params — api_key goes in the URL, NOT as a header
  const samParams = new URLSearchParams();
  samParams.set('api_key', apiKey);

  // Pagination — SAM.gov v2 uses limit/offset
  samParams.set('limit', p.get('limit') || '25');
  samParams.set('offset', p.get('offset') || '0');

  // Date range — SAM.gov requires MM/dd/yyyy format
  const postedFrom = p.get('postedFrom');
  const postedTo = p.get('postedTo');
  if (postedFrom) samParams.set('postedFrom', postedFrom);
  if (postedTo) samParams.set('postedTo', postedTo);

  // Keyword
  const keyword = p.get('keyword');
  if (keyword) samParams.set('title', keyword);

  // NAICS code
  const naics = p.get('naics');
  if (naics) samParams.set('ncode', naics);

  // Procurement type filter
  // o=solicitation, p=presolicitation, k=combined synopsis/solicitation,
  // r=sources sought, s=special notice, a=award notice
  const ptype = p.get('ptype');
  if (ptype) samParams.set('ptype', ptype);

  // Set-aside
  const setAside = p.get('setAside');
  if (setAside) samParams.set('typeOfSetAside', setAside);

  // Sort — newest first
  samParams.set('sortBy', '-modifiedDate');

  const url = `${SAM_BASE}?${samParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 300 }, // cache for 5 min
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `SAM.gov returned ${res.status}: ${text.slice(0, 500)}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to reach SAM.gov: ${msg}` }, { status: 502 });
  }
}
