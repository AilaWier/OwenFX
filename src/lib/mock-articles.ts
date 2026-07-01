export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  readTime: string;
  featured: boolean;
}

export const mockArticles: Article[] = [
  {
    id: 'a1',
    title: '2026 Essentials: Windows Tools You Need',
    description: 'Top 10 open-source utilities to boost your workflow on Windows.',
    content: '## Overview\nWindows has many great free tools. Here are the must-haves.\n## 1. Everything\nThe fastest file search tool for Windows.',
    category: 'Tool Review',
    tags: ['Windows', 'efficiency', 'open-source'],
    author: 'OwenFX',
    createdAt: '2026-06-25',
    readTime: '8 min',
    featured: true,
  },
  {
    id: 'a2',
    title: 'Open Source Guide: From Beginner to Pro',
    description: 'How to choose and use open-source software the right way.',
    content: '## Why Open Source?\nFree, transparent, and community-driven.\n## How to Choose\nCheck GitHub stars, update frequency, and documentation.',
    category: 'Tutorial',
    tags: ['open-source', 'guide', 'beginner'],
    author: 'OwenFX',
    createdAt: '2026-06-22',
    readTime: '5 min',
    featured: false,
  },
  {
    id: 'a3',
    title: 'System Optimization: Complete Guide',
    description: 'From startup optimization to disk cleanup, a full Windows guide.',
    content: '## Startup Optimization\nReduce startup programs for faster boot.\n## Disk Cleanup\nClear temp files and system cache regularly.',
    category: 'System Tips',
    tags: ['Windows', 'optimization', 'guide'],
    author: 'OwenFX',
    createdAt: '2026-06-18',
    readTime: '6 min',
    featured: false,
  },
  {
    id: 'a4',
    title: 'Best Android Apps of 2026',
    description: 'Top picks for productivity and entertainment on Android.',
    content: '## Productivity\nTasker and Solid Explorer are must-have Android tools.\n## Entertainment\nGreat apps for media and fun.',
    category: 'App Picks',
    tags: ['Android', 'apps', 'picks'],
    author: 'OwenFX',
    createdAt: '2026-07-01',
    readTime: '3 min',
    featured: false,
  },
];

export const getArticle = (id: string) => mockArticles.find((a) => a.id === id);
