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
    <div className="animate-fade-in">
      {/* Hero with heartbeat light orbs */}
      <div className="w-full h-28 md:h-36 rounded-xl overflow-hidden mb-4" style={{background:'transparent',position:'relative'}}>
      <ParticleBackground />
    </div>
    <SearchBar />
    <Carousel />

            <HomeSections articles={topArticles} featured={featured} />
<footer className="text-center py-8 text-sm border-t" style={{color:'var(--text-tertiary)', borderColor:'var(--border-color)'}}><p>OwenFX © {new Date().getFullYear()}</p></footer>
    </div>
  );
}
