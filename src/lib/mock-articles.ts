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
    title: '2026 必备：Windows 效率工具推荐',
    description: '十大开源利器，提升你的 Windows 工作效率。',
    content: '## 概述\nWindows 拥有众多优秀的免费工具。以下是必装推荐。\n## Everything\nWindows 上最快的文件搜索工具。',
    category: '工具评测',
    tags: ['Windows', '效率', '开源'],
    author: 'OwenFX',
    createdAt: '2026-06-25',
    readTime: '8 分钟',
    featured: true,
  },
  {
    id: 'a2',
    title: '开源软件指南：从入门到精通',
    description: '教你正确选择和使用开源软件。',
    content: '## 为什么选择开源？\n免费、透明、社区驱动。\n## 如何选择\n查看 GitHub Stars、更新频率和文档质量。',
    category: '教程',
    tags: ['开源', '指南', '入门'],
    author: 'OwenFX',
    createdAt: '2026-06-22',
    readTime: '5 分钟',
    featured: false,
  },
  {
    id: 'a3',
    title: '系统优化：完全指南',
    description: '从启动优化到磁盘清理，完整的 Windows 优化指南。',
    content: '## 启动优化\n减少开机自启程序，加快启动速度。\n## 磁盘清理\n定期清理临时文件和系统缓存。',
    category: '系统技巧',
    tags: ['Windows', '优化', '指南'],
    author: 'OwenFX',
    createdAt: '2026-06-18',
    readTime: '6 分钟',
    featured: false,
  },
  {
    id: 'a4',
    title: '2026 最佳 Android 应用',
    description: 'Android 平台上效率与娱乐的精选应用推荐。',
    content: '## 效率工具\nTasker 和 Solid Explorer 是 Android 必备工具。\n## 娱乐应用\n优秀的媒体和娱乐应用推荐。',
    category: '应用推荐',
    tags: ['Android', '应用', '精选'],
    author: 'OwenFX',
    createdAt: '2026-07-01',
    readTime: '3 分钟',
    featured: false,
  },
];

export const getArticle = (id: string) => mockArticles.find((a) => a.id === id);
