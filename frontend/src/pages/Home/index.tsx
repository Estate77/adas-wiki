import { Link } from 'react-router-dom';
import HeroSection       from './HeroSection';
import RadarSection      from './RadarSection';
import HotNewsSection    from './HotNewsSection';
import QuickAskSection   from './QuickAskSection';
import LearningPath      from './LearningPath';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <RadarSection />
      <QuickAskSection />
      <HotNewsSection />
      <LearningPath />
      {/* 底部 CTA */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-20">
        <div className="relative overflow-hidden glass-panel p-8 sm:p-12 text-center">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full
                          bg-gradient-radial from-neon-400/20 to-transparent blur-3xl pointer-events-none" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              从 0 到 1，搭建你的智驾认知体系
            </h3>
            <p className="mt-3 text-ink-400 max-w-2xl mx-auto text-sm">
              所有内容免费开放，注册账号即可保存学习进度、收藏高频考点、生成专属能力报告
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="btn-primary">免费注册</Link>
              <Link to="/graph" className="btn-ghost">浏览全景图谱</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
