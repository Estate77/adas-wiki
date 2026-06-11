import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Tabs       from '@/components/Tabs';
import VendorCards      from './VendorCards';
import HardwareMatrix   from './HardwareMatrix';
import AlgorithmPath    from './AlgorithmPath';
import BusinessModel    from './BusinessModel';
import MarketShare      from './MarketShare';

const TABS = [
  { key: 'vendor',   label: '方案概览' },
  { key: 'market',   label: '市场份额' },
  { key: 'hardware', label: '硬件对比' },
  { key: 'algo',     label: '算法路线' },
  { key: 'biz',      label: '商业模式' },
];

export default function CompetitorPage() {
  const [active, setActive] = useState('vendor');
  return (
    <div>
      <PageHeader
        eyebrow="BENCHMARKING"
        title="竞品拆解"
        desc="横向对比主流车企智驾方案：硬件配置 / 算法路线 / 商业模式 / 2025 最新市场份额 / 亮点与价值。每个厂家都附有最新数据 + 差异化亮点。"
      />
      <div className="sticky top-16 z-30 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {active === 'vendor'   && <VendorCards />}
        {active === 'market'   && <MarketShare />}
        {active === 'hardware' && <HardwareMatrix />}
        {active === 'algo'     && <AlgorithmPath />}
        {active === 'biz'      && <BusinessModel />}
      </main>
    </div>
  );
}
