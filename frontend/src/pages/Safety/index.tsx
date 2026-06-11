import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Tabs       from '@/components/Tabs';
import LevelMatrix      from './LevelMatrix';
import ODDExplorer      from './ODDExplorer';
import TakeoverPlaybook from './TakeoverPlaybook';
import LiabilityGuide   from './LiabilityGuide';
import SOTIFExplorer    from './SOTIFExplorer';
import DataCompliance   from './DataCompliance';

const TABS = [
  { key: 'level',  label: 'L0~L5 分级' },
  { key: 'odd',    label: 'ODD 解读' },
  { key: 'handoff',label: '接管机制' },
  { key: 'risk',   label: '责任划分' },
  { key: 'sotif',  label: 'SOTIF 预期安全' },
  { key: 'data',   label: '数据/网安/AI 伦理' },
];

export default function SafetyPage() {
  const [active, setActive] = useState('level');
  return (
    <div>
      <PageHeader
        eyebrow="SAFETY & COMPLIANCE"
        title="安全与合规专区"
        desc="覆盖 L0~L5 法律界定、ODD 边界、接管机制、责任划分，并深入 SOTIF 预期功能安全 + 数据合规/网安/AI 伦理，强化你的「底线认知」。"
      />
      <div className="sticky top-16 z-30 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {active === 'level'  && <LevelMatrix />}
        {active === 'odd'    && <ODDExplorer />}
        {active === 'handoff'&& <TakeoverPlaybook />}
        {active === 'risk'   && <LiabilityGuide />}
        {active === 'sotif'  && <SOTIFExplorer />}
        {active === 'data'   && <DataCompliance />}
      </main>
    </div>
  );
}
