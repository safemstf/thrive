// app/api/jobs/route.ts
// Proxies job search requests to Remotive + The Muse (both free, no API key needed)
// so the browser avoids CORS issues.

import { NextRequest, NextResponse } from 'next/server';

// ── Shared output shape ──────────────────────────────────────────────────────
export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];          // tech skills / keywords
  description: string;     // plain-text snippet (≤600 chars)
  salary: string;
  logo: string;
  source: string;          // 'Remotive' | 'The Muse'
  postedAt: string;
}

// ── Vendor types (partial) ───────────────────────────────────────────────────
interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  tags: string[];
  candidate_required_location: string;
  salary: string;
  description: string;
  company_logo_url: string;
  publication_date: string;
}

interface MuseJob {
  id: number;
  name: string;
  company: { name: string };
  locations: { name: string }[];
  refs: { landing_page: string };
  contents: string;
  tags: { name: string }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function titleToMuseCategory(title: string): string {
  const t = title.toLowerCase();
  if (/data\s*(sci|analy|engineer)|machine\s*learn|ml\s*eng/.test(t)) return 'Data Science';
  if (/product\s*manag/.test(t)) return 'Product';
  if (/design|ux|ui\s*des/.test(t)) return 'Design & UX';
  if (/devops|sre|site\s*reliab|cloud\s*eng/.test(t)) return 'DevOps & Sysadmin';
  if (/mobile|ios|android/.test(t)) return 'Mobile';
  return 'Software Engineer';
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title  = searchParams.get('title')  ?? 'Software Engineer';
  const skills = (searchParams.get('skills') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const jobs: NormalizedJob[] = [];

  // ── Source 1: Remotive ──────────────────────────────────────────────────
  // Free, no auth, returns remote tech roles with tagged skills.
  // Search by top skills for better relevance than job title alone.
  try {
    const searchTerm = skills.slice(0, 4).join(' ') || title;
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm)}&limit=50`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1 hr at the server
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      for (const j of (data.jobs ?? []) as RemotiveJob[]) {
        jobs.push({
          id:          `rm-${j.id}`,
          title:       (j.title ?? '').trim(),
          company:     (j.company_name ?? '').trim(),
          location:    j.candidate_required_location || 'Remote',
          url:         j.url ?? '',
          tags:        Array.isArray(j.tags) ? j.tags : [],
          description: stripHtml(j.description ?? '').slice(0, 600),
          salary:      j.salary ?? '',
          logo:        j.company_logo_url ?? '',
          source:      'Remotive',
          postedAt:    j.publication_date ?? '',
        });
      }
    }
  } catch {
    // swallow — The Muse may still succeed
  }

  // ── Source 2: The Muse ──────────────────────────────────────────────────
  // Free, no auth, broader listings including non-remote.
  try {
    const category = encodeURIComponent(titleToMuseCategory(title));
    const url = `https://www.themuse.com/api/public/jobs?category=${category}&level=Senior+Level&page=1&descended=true`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      for (const j of ((data.results ?? []) as MuseJob[]).slice(0, 30)) {
        jobs.push({
          id:          `mu-${j.id}`,
          title:       (j.name ?? '').trim(),
          company:     (j.company?.name ?? '').trim(),
          location:    (j.locations ?? []).map(l => l.name).join(' / ') || 'Various',
          url:         j.refs?.landing_page ?? '',
          tags:        (j.tags ?? []).map(t => t.name),
          description: stripHtml(j.contents ?? '').slice(0, 600),
          salary:      '',
          logo:        '',
          source:      'The Muse',
          postedAt:    '',
        });
      }
    }
  } catch {
    // swallow — Remotive results still returned
  }

  return NextResponse.json({ jobs });
}
