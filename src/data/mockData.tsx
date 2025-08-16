// src/data/mockData.tsx - Fixed imports and exports

import { GalleryPiece } from "@/types/gallery.types";
import { Portfolio, PortfolioReview } from "@/types/portfolio.types";
import type { TopPerformer, AssessmentLeaderboard, RankingPlatformStats } from '@/types/thrive.types';

// ==============================================
// THRIVE RANKING DATA (moved to top for better organization)
// ==============================================

export const MOCK_TOP_PERFORMERS: TopPerformer[] = [
  {
    id: '1',
    rank: 1,
    name: 'Sarah Chen',
    username: 'sarah_codes',
    profileImage: 'https://picsum.photos/100/100?random=1',
    totalScore: 12450,
    assessmentsCompleted: 24,
    averageScore: 94,
    specialization: 'Full-Stack Development',
    verified: true,
    monthlyGain: 890,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '2',
    rank: 2,
    name: 'Alex Rodriguez',
    username: 'alex_designs',
    profileImage: 'https://picsum.photos/100/100?random=2',
    totalScore: 11920,
    assessmentsCompleted: 21,
    averageScore: 92,
    specialization: 'UI/UX Design',
    verified: true,
    monthlyGain: 650,
    lastActive: new Date('2024-03-14')
  },
  {
    id: '3',
    rank: 3,
    name: 'Maria Santos',
    username: 'maria_data',
    profileImage: 'https://picsum.photos/100/100?random=3',
    totalScore: 11680,
    assessmentsCompleted: 19,
    averageScore: 96,
    specialization: 'Data Science',
    verified: false,
    monthlyGain: 720,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '4',
    rank: 4,
    name: 'David Kim',
    username: 'david_devops',
    profileImage: 'https://picsum.photos/100/100?random=4',
    totalScore: 10980,
    assessmentsCompleted: 18,
    averageScore: 91,
    specialization: 'DevOps Engineering',
    verified: true,
    monthlyGain: 540,
    lastActive: new Date('2024-03-13')
  },
  {
    id: '5',
    rank: 5,
    name: 'Emma Wilson',
    username: 'emma_pm',
    profileImage: 'https://picsum.photos/100/100?random=5',
    totalScore: 10540,
    assessmentsCompleted: 16,
    averageScore: 89,
    specialization: 'Project Management',
    verified: true,
    monthlyGain: 480,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '6',
    rank: 6,
    name: 'Michael Chang',
    username: 'mike_cloud',
    profileImage: 'https://picsum.photos/100/100?random=6',
    totalScore: 10120,
    assessmentsCompleted: 17,
    averageScore: 88,
    specialization: 'Cloud Architecture',
    verified: true,
    monthlyGain: 420,
    lastActive: new Date('2024-03-12')
  },
  {
    id: '7',
    rank: 7,
    name: 'Jessica Taylor',
    username: 'jess_mobile',
    profileImage: 'https://picsum.photos/100/100?random=7',
    totalScore: 9850,
    assessmentsCompleted: 15,
    averageScore: 90,
    specialization: 'Mobile Development',
    verified: false,
    monthlyGain: 380,
    lastActive: new Date('2024-03-14')
  },
  {
    id: '8',
    rank: 8,
    name: 'Ryan Parker',
    username: 'ryan_security',
    profileImage: 'https://picsum.photos/100/100?random=8',
    totalScore: 9420,
    assessmentsCompleted: 14,
    averageScore: 87,
    specialization: 'Cybersecurity',
    verified: true,
    monthlyGain: 340,
    lastActive: new Date('2024-03-11')
  },
  {
    id: '9',
    rank: 9,
    name: 'Lisa Zhang',
    username: 'lisa_ai',
    profileImage: 'https://picsum.photos/100/100?random=9',
    totalScore: 9180,
    assessmentsCompleted: 13,
    averageScore: 93,
    specialization: 'AI/Machine Learning',
    verified: true,
    monthlyGain: 520,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '10',
    rank: 10,
    name: 'Thomas Brown',
    username: 'tom_blockchain',
    profileImage: 'https://picsum.photos/100/100?random=10',
    totalScore: 8940,
    assessmentsCompleted: 12,
    averageScore: 85,
    specialization: 'Blockchain Development',
    verified: false,
    monthlyGain: 290,
    lastActive: new Date('2024-03-10')
  }
];

export const MOCK_ASSESSMENT_LEADERBOARDS: AssessmentLeaderboard[] = [
  {
    assessmentId: 'frontend-dev',
    title: 'Frontend Development',
    category: 'Development',
    leaders: [
      {
        rank: 1,
        name: 'Sarah Chen',
        username: 'sarah_codes',
        score: 98,
        completedAt: new Date('2024-03-10'),
        timeSpent: 42
      },
      {
        rank: 2,
        name: 'Jake Morrison',
        username: 'jake_react',
        score: 96,
        completedAt: new Date('2024-03-12'),
        timeSpent: 38
      },
      {
        rank: 3,
        name: 'Lily Zhang',
        username: 'lily_frontend',
        score: 94,
        completedAt: new Date('2024-03-14'),
        timeSpent: 45
      },
      {
        rank: 4,
        name: 'Marcus Johnson',
        username: 'marcus_js',
        score: 92,
        completedAt: new Date('2024-03-13'),
        timeSpent: 41
      },
      {
        rank: 5,
        name: 'Anna Kowalski',
        username: 'anna_vue',
        score: 90,
        completedAt: new Date('2024-03-11'),
        timeSpent: 47
      }
    ]
  },
  {
    assessmentId: 'data-analysis',
    title: 'Data Analysis',
    category: 'Analytics',
    leaders: [
      {
        rank: 1,
        name: 'Maria Santos',
        username: 'maria_data',
        score: 97,
        completedAt: new Date('2024-03-08'),
        timeSpent: 55
      },
      {
        rank: 2,
        name: 'Chris Anderson',
        username: 'chris_analytics',
        score: 95,
        completedAt: new Date('2024-03-11'),
        timeSpent: 52
      },
      {
        rank: 3,
        name: 'Nina Patel',
        username: 'nina_data',
        score: 93,
        completedAt: new Date('2024-03-13'),
        timeSpent: 48
      },
      {
        rank: 4,
        name: 'Robert Chen',
        username: 'robert_stats',
        score: 91,
        completedAt: new Date('2024-03-09'),
        timeSpent: 58
      },
      {
        rank: 5,
        name: 'Elena Rodriguez',
        username: 'elena_bi',
        score: 89,
        completedAt: new Date('2024-03-12'),
        timeSpent: 54
      }
    ]
  },
  {
    assessmentId: 'ux-design',
    title: 'UX Design',
    category: 'Design',
    leaders: [
      {
        rank: 1,
        name: 'Alex Rodriguez',
        username: 'alex_designs',
        score: 96,
        completedAt: new Date('2024-03-09'),
        timeSpent: 40
      },
      {
        rank: 2,
        name: 'Sophie Chen',
        username: 'sophie_ux',
        score: 94,
        completedAt: new Date('2024-03-12'),
        timeSpent: 37
      },
      {
        rank: 3,
        name: 'James Wilson',
        username: 'james_design',
        score: 92,
        completedAt: new Date('2024-03-14'),
        timeSpent: 43
      },
      {
        rank: 4,
        name: 'Maya Singh',
        username: 'maya_ui',
        score: 90,
        completedAt: new Date('2024-03-10'),
        timeSpent: 39
      },
      {
        rank: 5,
        name: 'Daniel Kim',
        username: 'daniel_product',
        score: 88,
        completedAt: new Date('2024-03-13'),
        timeSpent: 42
      }
    ]
  },
  {
    assessmentId: 'cloud-architecture',
    title: 'Cloud Architecture',
    category: 'Infrastructure',
    leaders: [
      {
        rank: 1,
        name: 'David Kim',
        username: 'david_devops',
        score: 95,
        completedAt: new Date('2024-03-07'),
        timeSpent: 70
      },
      {
        rank: 2,
        name: 'Michael Chang',
        username: 'mike_cloud',
        score: 93,
        completedAt: new Date('2024-03-10'),
        timeSpent: 68
      },
      {
        rank: 3,
        name: 'Sandra Liu',
        username: 'sandra_aws',
        score: 91,
        completedAt: new Date('2024-03-12'),
        timeSpent: 72
      },
      {
        rank: 4,
        name: 'Ahmed Hassan',
        username: 'ahmed_azure',
        score: 89,
        completedAt: new Date('2024-03-11'),
        timeSpent: 75
      },
      {
        rank: 5,
        name: 'Isabella Garcia',
        username: 'bella_k8s',
        score: 87,
        completedAt: new Date('2024-03-13'),
        timeSpent: 69
      }
    ]
  }
];

export const PLATFORM_RANKING_STATS: RankingPlatformStats = {
  totalParticipants: 15420,
  activeThisWeek: 1240,
  averageScore: 78,
  completionsToday: 156
};

// Weekly trending performers (additional data)
export const WEEKLY_TRENDING_PERFORMERS = [
  {
    id: '1',
    name: 'Lisa Zhang',
    username: 'lisa_ai',
    weeklyGain: 520,
    assessmentsThisWeek: 3,
    specialization: 'AI/Machine Learning'
  },
  {
    id: '2', 
    name: 'Sarah Chen',
    username: 'sarah_codes',
    weeklyGain: 480,
    assessmentsThisWeek: 2,
    specialization: 'Full-Stack Development'
  },
  {
    id: '3',
    name: 'Maria Santos', 
    username: 'maria_data',
    weeklyGain: 420,
    assessmentsThisWeek: 2,
    specialization: 'Data Science'
  }
];

// Assessment completion trends
export const ASSESSMENT_COMPLETION_TRENDS = {
  thisWeek: 1240,
  lastWeek: 1180,
  growthRate: 5.1,
  topCategories: [
    { category: 'Development', completions: 420 },
    { category: 'Design', completions: 280 },
    { category: 'Data Science', completions: 240 },
    { category: 'DevOps', completions: 180 },
    { category: 'Project Management', completions: 120 }
  ]
};

// ==============================================
// PORTFOLIO DATA
// ==============================================

export const MOCK_PORTFOLIOS: Record<string, Portfolio> = {
  'alice_creates': {
    id: '1',
    userId: '1',
    username: 'alice_creates',
    name: 'Alice Johnson',
    title: 'Creative Director & Digital Artist',
    tagline: 'Transforming ideas into immersive digital experiences',
    bio: 'Award-winning creative director with 8+ years of experience crafting digital narratives that resonate. My work spans interactive installations, brand identities, and digital products that have reached millions of users worldwide. Featured in major galleries and recognized by industry leaders for innovative approaches to storytelling through technology.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=1',
    coverImage: 'https://picsum.photos/1400/700?random=1',
    visibility: 'public',
    status: 'active',
    location: 'San Francisco, CA',
    yearsOfExperience: 8,
    specializations: ['Digital Art', 'Creative Direction', 'Brand Strategy', 'UI/UX Design', '3D Visualization'],
    tags: ['Creative', 'Digital Art', 'Design', 'Innovation', 'Technology'],
    socialLinks: {
      website: 'https://alice-creates.com',
      instagram: 'https://instagram.com/alice_creates',
      twitter: 'https://twitter.com/alice_creates',
      linkedin: 'https://linkedin.com/in/alice',
      behance: 'https://behance.net/alice',
      github: 'https://github.com/alice'
    },
    contactEmail: 'alice@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 125000,
      uniqueVisitors: 18500,
      totalPieces: 42,
      totalReviews: 127,
      averageRating: 4.9,
      responseRate: 95,
      responseTime: 'within 2 hours',
      viewsThisWeek: 3200,
      viewsThisMonth: 14800,
      shareCount: 890,
      savedCount: 1240
    },
    featuredPieces: ['1', '2', '3'],
    createdAt: new Date('2024-01-15'),
    lastActiveAt: new Date('2024-03-10')
  },
  'bob_codes': {
    id: '2',
    userId: '2', 
    username: 'bob_codes',
    name: 'Robert Chen',
    title: 'Senior Software Architect',
    tagline: 'Building scalable systems that power the future',
    bio: 'Senior software architect with 12+ years of experience designing enterprise-scale systems. Led architecture for platforms serving 100M+ users. Passionate about clean code, system design, and mentoring the next generation of engineers. Certified in multiple cloud platforms and recognized for innovative solutions.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/1000/1000?random=2',
    coverImage: 'https://picsum.photos/1400/700?random=2',
    visibility: 'public',
    status: 'active',
    location: 'Seattle, WA',
    yearsOfExperience: 12,
    specializations: ['System Architecture', 'Cloud Computing', 'Microservices', 'Team Leadership', 'DevOps'],
    tags: ['Architecture', 'Leadership', 'Cloud', 'Scalability', 'Innovation'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/bob',
      github: 'https://github.com/bob',
      website: 'https://bob-codes.dev'
    },
    contactEmail: 'bob@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 15,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 67000,
      uniqueVisitors: 8900,
      totalPieces: 28,
      totalReviews: 84,
      averageRating: 4.8,
      responseRate: 98,
      responseTime: 'within 4 hours',
      viewsThisWeek: 1800,
      viewsThisMonth: 8400,
      shareCount: 420,
      savedCount: 680
    },
    featuredPieces: ['4', '5'],
    createdAt: new Date('2024-02-10'),
    lastActiveAt: new Date('2024-03-09')
  },
  'charlie_learns': {
    id: '3',
    userId: '3',
    username: 'charlie_learns',
    name: 'Charlie Davis',
    title: 'Full-Stack Developer & Lifelong Learner',
    tagline: 'Documenting my journey from curiosity to mastery',
    bio: 'Self-taught developer on a mission to master modern web technologies. I believe in learning in public and helping others grow. Currently diving deep into system design while building projects that solve real problems. Follow my journey as I tackle new concepts and share what I learn.',
    kind: 'educational',
    profileImage: 'https://picsum.photos/900/900?random=3',
    coverImage: 'https://picsum.photos/1400/700?random=3',
    visibility: 'public',
    status: 'active',
    location: 'Austin, TX',
    yearsOfExperience: 3,
    specializations: ['Web Development', 'JavaScript', 'React', 'Node.js', 'System Design'],
    tags: ['Learning', 'Development', 'Self-Taught', 'Growth', 'Community'],
    socialLinks: {
      github: 'https://github.com/charlie',
      twitter: 'https://twitter.com/charlie_learns',
      linkedin: 'https://linkedin.com/in/charlie'
    },
    contactEmail: 'charlie@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 25,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true,
      showProgress: true,
      publicProgress: true,
      showCertifications: true,
      trackLearningTime: true,
      notifyOnConceptCompletion: true,
      weeklyProgressEmail: true
    },
    stats: {
      totalViews: 28000,
      uniqueVisitors: 3200,
      totalPieces: 15,
      totalReviews: 42,
      averageRating: 4.6,
      responseRate: 88,
      responseTime: 'within 8 hours',
      viewsThisWeek: 850,
      viewsThisMonth: 3600,
      shareCount: 190,
      savedCount: 280,
      totalConcepts: 156,
      completedConcepts: 134,
      inProgressConcepts: 22,
      totalLearningHours: 420,
      averageScore: 87,
      streakDays: 127,
      certificationsEarned: 8
    },
    conceptProgress: [
      {
        conceptId: '1',
        status: 'completed',
        startedAt: '2024-02-01T10:00:00Z',
        completedAt: '2024-02-05T14:30:00Z',
        score: 95,
        attempts: 2,
        notes: 'Excellent understanding of React hooks patterns'
      },
      {
        conceptId: '2', 
        status: 'in-progress',
        startedAt: '2024-03-01T09:00:00Z',
        score: 78,
        attempts: 1,
        notes: 'Working on advanced database optimization techniques'
      }
    ],
    learningGoals: [
      'Master system design principles',
      'Build a distributed application',
      'Contribute to open source projects',
      'Learn DevOps best practices',
      'Understand advanced algorithms'
    ],
    currentBooks: ['book1', 'book2'],
    completedBooks: ['book3', 'book4', 'book5'],
    featuredPieces: ['6', '7'],
    createdAt: new Date('2024-01-20'),
    lastActiveAt: new Date('2024-03-10')
  }
};

// Enhanced gallery pieces with Thrive integration
export const MOCK_GALLERY: Record<string, GalleryPiece[]> = {
  'alice_creates': [
    {
      _id: '1',
      title: 'Interactive Brand Experience for TechFlow',
      artist: 'Alice Johnson',
      description: 'Complete digital brand transformation...',
      thumbnailUrl: 'https://picsum.photos/200/300?random=10',
      imageUrl: 'https://picsum.photos/800/1200?random=10',
      alt: 'Interactive brand experience design',
      size: 'large',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '1',
      uploadedBy: '1',
      portfolioId: '1',
      views: 12500,
      likes: 890,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      category: 'Brand Design',
      medium: 'Digital Design',
      year: 2024,
      dimensions: {
        width: 1200,
        height: 800,
        unit: 'px'
      },
      tags: ['Branding', 'Interactive', 'UI/UX'],
    },
    {
      _id: '2',
      title: 'Sustainable Fashion AR Experience',
      artist: 'Alice Johnson',
      description: 'Immersive AR installation for sustainable fashion week, allowing users to visualize the environmental impact of clothing choices.',
      thumbnailUrl: 'https://picsum.photos/200/300?random=11',
      imageUrl: 'https://picsum.photos/1000/800?random=11',
      alt: 'Sustainable Fashion AR Experience',
      size: 'large',
      displayOrder: 2,
      status: 'published',
      visibility: 'public',
      ownerId: '1',
      uploadedBy: '1',
      views: 9800,
      likes: 670,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      category: 'mixed-media',
      tags: ['AR', 'Sustainability', 'Fashion', 'Installation'],
      medium: 'Digital AR Installation',
      year: 2024,
      dimensions: {
        width: 1000,
        height: 800,
        unit: 'px'
      },
      portfolioId: '1'
    }
  ],
  'bob_codes': [
    {
      _id: '4',
      portfolioId: '2',
      title: 'Microservices Architecture for E-commerce Platform',
      artist: 'Robert Chen',
      description: 'Designed and implemented scalable microservices architecture serving 10M+ daily active users with 99.99% uptime.',
      thumbnailUrl: 'https://picsum.photos/300/200?random=20',
      imageUrl: 'https://picsum.photos/1200/800?random=20',
      alt: 'Microservices architecture diagram',
      size: 'medium',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '2',
      uploadedBy: '2',
      views: 6500,
      likes: 340,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      category: 'Design',
      tags: ['Microservices', 'Scalability', 'Cloud', 'Performance'],
      medium: 'System Architecture',
      year: 2024,
      dimensions: {
        width: 1200,
        height: 800,
        unit: 'px'
      }
    }
  ],
  'charlie_learns': [
    {
      _id: '6',
      portfolioId: '3',
      title: 'Learning Progress: React Mastery Journey',
      artist: 'Charlie Davis',
      description: 'Complete documentation of my React learning journey, from basics to advanced patterns. Includes projects, notes, and insights.',
      thumbnailUrl: 'https://picsum.photos/300/200?random=30',
      imageUrl: 'https://picsum.photos/800/600?random=30',
      alt: 'React learning journey documentation',
      size: 'medium',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '3',
      uploadedBy: '3',
      views: 2800,
      likes: 180,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      category: 'Digital',
      tags: ['React', 'Learning', 'Documentation', 'Progress'],
      medium: 'Educational Content',
      year: 2024,
      dimensions: {
        width: 800,
        height: 600,
        unit: 'px'
      }
    }
  ]
};

// Mock reviews with better structure
export const MOCK_REVIEWS: Record<string, PortfolioReview[]> = {
  'alice_creates': [
    {
      id: '1',
      portfolioId: '1',
      portfolioUserId: '1',
      reviewerId: '101',
      reviewerName: 'Sarah Chen',
      rating: 5,
      title: 'Exceptional Creative Vision',
      comment: "Alice's work on our brand transformation was absolutely phenomenal. She didn't just design - she crafted an entire experience that perfectly captured our company's soul. The attention to detail and innovative approach exceeded all expectations.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 12,
      reportCount: 0,
      createdAt: new Date('2024-03-01')
    },
    {
      id: '2', 
      portfolioId: '1',
      portfolioUserId: '1',
      reviewerId: '102',
      reviewerName: 'Marcus Johnson',
      rating: 5,
      title: 'World-Class Designer',
      comment: "Working with Alice was a game-changer for our startup. Her creative direction helped us stand out in a crowded market. The AR experience she created got us featured in TechCrunch!",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 8,
      reportCount: 0,
      createdAt: new Date('2024-02-28'),
      artistResponse: {
        comment: "Thank you Marcus! It was amazing collaborating with your team. Your vision made this project truly special.",
        respondedAt: new Date('2024-03-01')
      }
    }
  ]
};

export const THRIVE_ASSESSMENTS: Record<string, any[]> = {
  'alice_creates': [
    {
      id: 'ui-ux-design',
      title: 'UI/UX Design Mastery',
      score: 98,
      percentile: 99,
      completedAt: '2024-02-15',
      certification: 'Expert Level',
      skills: ['User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      timeSpent: 45
    },
    {
      id: 'creative-thinking',
      title: 'Creative Problem Solving',
      score: 96,
      percentile: 97,
      completedAt: '2024-01-20',
      certification: 'Expert Level',
      skills: ['Innovation', 'Ideation', 'Creative Strategy'],
      timeSpent: 35
    }
  ],
  'bob_codes': [
    {
      id: 'system-architecture',
      title: 'System Architecture & Design',
      score: 94,
      percentile: 96,
      completedAt: '2024-03-01',
      certification: 'Expert Level',
      skills: ['Microservices', 'Scalability', 'Performance Optimization'],
      timeSpent: 60
    }
  ],
  'charlie_learns': [
    {
      id: 'frontend-development',
      title: 'Frontend Development',
      score: 89,
      percentile: 85,
      completedAt: '2024-02-28',
      certification: 'Advanced Level',
      skills: ['React', 'JavaScript', 'HTML/CSS'],
      timeSpent: 50
    }
  ]
};


// ==============================================
// EMPLOYER TOOLS DATA
// ==============================================

export const EMPLOYER_TOOLS = [
  {
    id: 'candidate-verification',
    title: 'Candidate Verification',
    description: 'Verify candidate assessment scores and certifications instantly',
    icon: 'Shield',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    status: 'active' as const,
    features: ['Real-time verification', 'Blockchain secured', 'API integration']
  },
  {
    id: 'bulk-assessment',
    title: 'Bulk Assessment Portal',
    description: 'Assess multiple candidates simultaneously with custom test suites',
    icon: 'Users',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    status: 'active' as const,
    features: ['Custom test creation', 'Batch processing', 'Detailed analytics']
  },
  {
    id: 'skills-analytics',
    title: 'Skills Analytics Dashboard',
    description: 'Advanced analytics on candidate skills and industry benchmarks',
    icon: 'BarChart3',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    status: 'active' as const,
    features: ['Industry benchmarking', 'Skill gap analysis', 'Custom reports']
  },
  {
    id: 'integration-api',
    title: 'ATS Integration API',
    description: 'Seamlessly integrate with your existing hiring workflow',
    icon: 'Settings',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    status: 'beta' as const,
    features: ['REST API', 'Webhook support', 'Custom integrations']
  },
  {
    id: 'team-management',
    title: 'Team Assessment Management',
    description: 'Manage and track your existing team\'s skill development',
    icon: 'Building2',
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    status: 'beta' as const,
    features: ['Team dashboards', 'Progress tracking', 'Skill development plans']
  },
  {
    id: 'certification-portal',
    title: 'Certification Portal',
    description: 'Issue and manage professional certifications for your organization',
    icon: 'FileCheck',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    status: 'coming-soon' as const,
    features: ['Custom certificates', 'Digital badges', 'Verification system']
  }
];

export const EMPLOYER_PLATFORM_METRICS = {
  verifiedCandidates: 15420,
  partnerCompanies: 247,
  monthlyAssessments: 8930,
  averageVerificationTime: '2.3s'
};