import { mockSoftware, mockCategories, allTags } from '@/lib/mock';
import SoftwareCard from '@/components/SoftwareCard';
import TrendingPanel from '@/components/TrendingPanel';

export default function HomePage() {
  const featured = mockSoftware.filter((s) => s.featured);
  const recent = mockSoftware;

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            OwenFX <span className="text-text-secondary font-normal">发现精选软件</span>
          </h1>
          <p className="text-sm text-text-secondary">
            浏览我们精选的免费和开源软件集合，找到提升效率的最佳工具。
          </p>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              精选推荐
            </h2>
            <div className="space-y-3">
              {featured.map((software) => (
                <SoftwareCard key={software.id} software={software} />
              ))}
            </div>
          </section>
        )}

        {/* All Software */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            最新更新
          </h2>
          <div className="space-y-3">
            {recent.map((software) => (
              <SoftwareCard key={software.id} software={software} />
            ))}
          </div>
        </section>
      </div>

      {/* Right Panel */}
      <div className="w-72 shrink-0 p-6 pl-2 hidden xl:block">
        <div className="sticky top-20">
          <TrendingPanel tags={allTags} categories={mockCategories} />
        </div>
      </div>
    </div>
  );
}
