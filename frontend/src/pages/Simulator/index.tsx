import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Tabs       from '@/components/Tabs';
import HighwayNoa       from './HighwayNoa';
import Intersection     from './Intersection';
import WeatherPark      from './WeatherPark';
import ReasoningTrainer from './ReasoningTrainer';
import EdgeCases        from './EdgeCases';

const TABS = [
  { key: 'highway',  label: '高速 NOA' },
  { key: 'urban',    label: '城区路口博弈' },
  { key: 'weather',  label: '极端天气泊车' },
  { key: 'edge',     label: '长尾场景' },
  { key: 'reason',   label: '系统思维训练' },
];

export default function SimulatorPage() {
  const [active, setActive] = useState('highway');

  return (
    <div>
      <PageHeader
        eyebrow="SCENARIO SIMULATOR"
        title="场景模拟器"
        desc="把零散的智驾知识，放进真实场景里反复打磨：覆盖高速 NOA、城区博弈、极端天气、长尾场景和责任判定五大类。每类场景都附带关注点、问题解析和行业案例。"
      />

      <div className="sticky top-16 z-30 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {active === 'highway' && <HighwayNoa />}
        {active === 'urban'   && <Intersection />}
        {active === 'weather' && <WeatherPark />}
        {active === 'edge'    && <EdgeCases />}
        {active === 'reason'  && <ReasoningTrainer />}
      </main>
    </div>
  );
}
