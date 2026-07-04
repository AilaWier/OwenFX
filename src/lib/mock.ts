import { Software } from './types';

export const mockSoftware: Software[] = [
  { id: '1', title: 'NanaZip', description: '一款开源文件归档工具，经典 7-Zip 的现代化分支。', category: '工具', tags: ['压缩', '开源', '免费'], downloadUrl: 'https://github.com/M2Team/NanaZip', updatedAt: '2026-06-20', featured: true, version: '5.0', size: '8.2 MB', platform: 'Windows' },
  { id: '2', title: 'Everything', description: '瞬间按名称定位文件和文件夹。', category: '工具', tags: ['搜索', '文件管理', '高效'], downloadUrl: 'https://www.voidtools.com/', updatedAt: '2026-06-18', featured: true, version: '1.4.1', size: '1.5 MB', platform: 'Windows' },
  { id: '3', title: 'PowerToys', description: '微软为高级用户打造的一组系统增强工具集。', category: '系统增强', tags: ['微软', '开源', '生产力'], downloadUrl: 'https://github.com/microsoft/PowerToys', updatedAt: '2026-06-15', featured: true, version: '0.89.0', size: '120 MB', platform: 'Windows' },
  { id: '4', title: 'OBS Studio', description: '免费开源的视频录制与直播软件。', category: '多媒体', tags: ['录屏', '直播', '开源'], downloadUrl: 'https://obsproject.com/', updatedAt: '2026-06-12', featured: true, version: '30.2.3', size: '90 MB', platform: 'Windows/Mac/Linux' },
  { id: '5', title: 'VS Code', description: '轻量但功能强大的源代码编辑器。', category: '开发工具', tags: ['编辑器', '微软', '开源'], downloadUrl: 'https://code.visualstudio.com/', updatedAt: '2026-06-10', featured: true, version: '1.96.0', size: '85 MB', platform: 'Windows/Mac/Linux' },
  { id: '6', title: 'Ditto Clipboard', description: 'Windows 剪贴板的增强扩展工具。', category: '工具', tags: ['剪贴板', '效率', '免费'], downloadUrl: 'https://ditto-cp.sourceforge.io/', updatedAt: '2026-06-08', featured: true, version: '3.24', size: '3.5 MB', platform: 'Windows' },
  { id: '7', title: 'Tasker', description: 'Android平台最强大的自动化工具，支持自定义任务、触发器和场景模式。', category: 'Android软件', tags: ['自动化', '效率', 'Android'], downloadUrl: 'https://tasker.joaoapps.com/', updatedAt: '2026-06-05', featured: false, version: '6.3', size: '15 MB', platform: 'Android' },
  { id: '8', title: 'Solid Explorer', description: '双栏布局的Android文件管理器，支持云存储和压缩文件。', category: 'Android软件', tags: ['文件管理', '探索', 'Android'], downloadUrl: 'https://play.google.com/store/apps/details?id=pl.solidexplorer2', updatedAt: '2026-06-03', featured: false, version: '2.8', size: '8 MB', platform: 'Android' },
  { id: '9', title: 'Notepad++', description: 'Windows平台轻量级代码编辑器，支持多种编程语言。', category: 'Windows软件', tags: ['编辑器', '开源', 'Windows'], downloadUrl: 'https://notepad-plus-plus.org/', updatedAt: '2026-06-01', featured: false, version: '8.6', size: '4.5 MB', platform: 'Windows' },
  { id: '10', title: 'ShareX', description: 'Windows平台功能强大的截图和录屏工具，开源免费。', category: 'Windows软件', tags: ['截图', '录屏', '开源'], downloadUrl: 'https://getsharex.com/', updatedAt: '2026-05-28', featured: false, version: '16.1', size: '12 MB', platform: 'Windows' },
  { id: '11', title: 'Audacity', description: '免费开源的音频编辑与录制工具。', category: '多媒体', tags: ['音频', '编辑', '开源'], downloadUrl: 'https://www.audacityteam.org/', updatedAt: '2026-07-01', featured: true, version: '3.7.1', size: '28 MB', platform: 'Windows/Mac/Linux' },
];

export const mockCategories = [
  { id: 'cat-1', name: '工具', slug: 'tools', count: 3 },
  { id: 'cat-3', name: '多媒体', slug: 'media', count: 1 },
  { id: 'cat-4', name: '开发工具', slug: 'devtools', count: 1 },
  { id: 'cat-2', name: '系统增强', slug: 'system', count: 1 },
  { id: 'cat-5', name: 'Android软件', slug: 'android', count: 2 },
  { id: 'cat-6', name: 'Windows软件', slug: 'windows', count: 2 },
];

export const categoryOrder = ['工具', '多媒体', '开发工具', '系统增强', 'Android软件', 'Windows软件'];

export const allTags = Array.from(new Set(mockSoftware.flatMap(s => s.tags)));


export const categoryColors: Record<string, string> = {
  '工具': '#FF4444',
  '多媒体': '#FF8C00',
  '开发工具': '#FFD700',
  '系统增强': '#3FB950',
  'Android软件': '#3B82F6',
  'Windows软件': '#A855F7',
};
