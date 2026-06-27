import { Software } from '@/lib/types';

interface SoftwareCardProps {
  software: Software;
}

export default function SoftwareCard({ software }: SoftwareCardProps) {
  const {
    title,
    description,
    category,
    tags,
    downloadUrl,
    updatedAt,
    featured,
    version,
    size,
    platform,
  } = software;

  return (
    <article className="card-hover bg-bg-card border border-border-color rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-base font-semibold text-text-primary truncate">{title}</h3>
            {featured && (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold text-accent bg-accent/10 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary mb-3 line-clamp-2">{description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs text-accent bg-accent/8 rounded-full"
              >
                {tag}
              </span>
            ))}
            <span className="px-2 py-0.5 text-xs text-text-secondary bg-white/5 rounded-full">
              {category}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            {version && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                v{version}
              </span>
            )}
            {size && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {size}
              </span>
            )}
            {platform && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {platform}
              </span>
            )}
            {updatedAt && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(updatedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        {/* Right: Download */}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-success/80 hover:bg-success rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </a>
      </div>
    </article>
  );
}
