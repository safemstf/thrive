// src/pages/portfolio/[userId].tsx
// This is an example of how to use the PortfolioView component in a Next.js route

import React from 'react';
import { useRouter } from 'next/router';
import { PortfolioView } from '@/components/portfolio/portfolioView';

export default function PortfolioPage() {
  const router = useRouter();
  const { userId } = router.query;

  // Handle different route patterns
  // /portfolio/[userId] - for user ID based routes
  // /portfolio/u/[username] - for username based routes
  // /p/[shareToken] - for share link based routes

  return (
    <PortfolioView 
      userId={userId as string}
      // You can also pass username or shareToken based on your route structure
    />
  );
}

// ==================== Alternative App Router Version ====================
// src/app/portfolio/[userId]/page.tsx (for Next.js 13+ App Router)

/*
export default function PortfolioPage({ params }: { params: { userId: string } }) {
  return (
    <PortfolioView userId={params.userId} />
  );
}
*/

