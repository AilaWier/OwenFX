import { sortTagsByLength } from '@/lib/tag-utils';

interface TrendingPanelProps {
  tags: string[];
  categories: { name: string; count: number }[];
}

export default function TrendingPanel({ tags, categories }: TrendingPanelProps) {
  return (
    <aside className="space-y-4">
      {/* Trending Tags */}
      <div className="bg-bg-card border border-border-color rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          热门标签
        </h3>
        <div className="flex flex-wrap gap-2">
          {sortTagsByLength(tags).map((tag) => (
            <button
              key={tag}
              className="px-2.5 py-1 text-xs text-accent bg-accent/8 rounded-full hover:bg-accent/15 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-bg-card border border-border-color rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          分类
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
            >
              <span>{cat.name}</span>
              <span className="text-xs text-text-secondary bg-white/5 px-1.5 py-0.5 rounded-full">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-bg-card border border-border-color rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">关于 OwenFX</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          OwenFX 是一个软件资源分享站，汇集精选的免费、开源、实用软件。发现你下一个最喜欢的工具。
        </p>
      </div>
    </aside>
  );
}
