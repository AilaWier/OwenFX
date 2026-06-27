import { Software } from './types';

/**
 * Sample software data for development / fallback when Notion API is unavailable.
 * After connecting Notion, this serves as the fallback mock data.
 */
export const mockSoftware: Software[] = [
  {
    id: '1',
    title: 'NanaZip',
    description: 'An open-source file archiver, a modern fork of the famous 7-Zip. Supports compression, encryption, and wide format compatibility.',
    category: '工具',
    tags: ['压缩', '开源', '免费'],
    downloadUrl: 'https://github.com/M2Team/NanaZip',
    updatedAt: '2026-06-20',
    featured: true,
    version: '5.0',
    size: '8.2 MB',
    platform: 'Windows',
  },
  {
    id: '2',
    title: 'Everything',
    description: 'Locate files and folders by name instantly. Small installation file, clean and simple user interface.',
    category: '工具',
    tags: ['搜索', '文件管理', '高效'],
    downloadUrl: 'https://www.voidtools.com/',
    updatedAt: '2026-06-18',
    featured: true,
    version: '1.4.1',
    size: '1.5 MB',
    platform: 'Windows',
  },
  {
    id: '3',
    title: 'PowerToys',
    description: 'Microsoft\'s set of utilities for power users to tune and streamline their Windows experience for greater productivity.',
    category: '系统增强',
    tags: ['微软', '开源', '生产力'],
    downloadUrl: 'https://github.com/microsoft/PowerToys',
    updatedAt: '2026-06-15',
    featured: true,
    version: '0.89.0',
    size: '120 MB',
    platform: 'Windows',
  },
  {
    id: '4',
    title: 'OBS Studio',
    description: 'Free and open source software for video recording and live streaming. Supports multiple platforms.',
    category: '多媒体',
    tags: ['录屏', '直播', '开源'],
    downloadUrl: 'https://obsproject.com/',
    updatedAt: '2026-06-12',
    featured: false,
    version: '30.2.3',
    size: '90 MB',
    platform: 'Windows/Mac/Linux',
  },
  {
    id: '5',
    title: 'VS Code',
    description: 'A lightweight but powerful source code editor which runs on your desktop. Built-in support for JavaScript, TypeScript and Node.js.',
    category: '开发工具',
    tags: ['编辑器', '微软', '开源'],
    downloadUrl: 'https://code.visualstudio.com/',
    updatedAt: '2026-06-10',
    featured: true,
    version: '1.96.0',
    size: '85 MB',
    platform: 'Windows/Mac/Linux',
  },
  {
    id: '6',
    title: 'Ditto Clipboard',
    description: 'An extension to the standard Windows clipboard. Saves each item placed on the clipboard, allowing access to any of those items later.',
    category: '工具',
    tags: ['剪贴板', '效率', '免费'],
    downloadUrl: 'https://ditto-cp.sourceforge.io/',
    updatedAt: '2026-06-08',
    featured: false,
    version: '3.24',
    size: '3.5 MB',
    platform: 'Windows',
  },
];

export const mockCategories = [
  { id: 'cat-1', name: '工具', slug: 'tools', count: 3 },
  { id: 'cat-2', name: '系统增强', slug: 'system', count: 1 },
  { id: 'cat-3', name: '多媒体', slug: 'media', count: 1 },
  { id: 'cat-4', name: '开发工具', slug: 'devtools', count: 1 },
];

export const allTags = Array.from(new Set(mockSoftware.flatMap(s => s.tags)));
