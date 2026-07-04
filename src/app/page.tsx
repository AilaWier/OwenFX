import { mockSoftware } from '@/lib/mock';
import { mockArticles } from '@/lib/mock-articles';
import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';
import Carousel from '@/components/Carousel';
import SearchBar from '@/components/SearchBar';
import HomeSections from '@/components/HomeSections';

export default async function HomePage() {
  const software = mockSoftware;
  const featured = software.filter(s => s.featured);
  const topArticles = mockArticles;

  return (
    <div>
      {/* Hero with heartbeat light orbs */}
      <div className="particle-wrap">
        <style>{`.particle-wrap{width:100%;height:112px;border-radius:12px;overflow:hidden;margin-bottom:1rem;background:transparent;position:relative}@media(min-width:768px){.particle-wrap{height:144px}}`}</style>
        <ParticleBackground />
      </div>
    <SearchBar />
    <Carousel />

            <HomeSections articles={topArticles} featured={featured} />
<footer className="text-center py-8 text-sm border-t" style={{color:'var(--text-tertiary)', borderColor:'var(--border-color)'}}><p>OwenFX © {new Date().getFullYear()}</p></footer>
    </div>
  );
}
