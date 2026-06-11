import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Tabs       from '@/components/Tabs';
import SystemArchitecture from './SystemArchitecture';
import SensorTopology     from './SensorTopology';
import AlgorithmTimeline  from './AlgorithmTimeline';
import RegulationMap      from './RegulationMap';

const TABS = [
  { key: 'system',     label: '人-车-路-云' },
  { key: 'sensor',     label: '传感器拓扑' },
  { key: 'algorithm',  label: '算法演进' },
  { key: 'regulation', label: '法规体系' },
];

export default function GraphPage() {
  const [active, setActive] = useState('system');

  return (
    <div>
      <PageHeader
        eyebrow="KNOWLEDGE GRAPH"
        title="全景图谱"
        desc="把零散的智驾知识，串成一张可点击、可学习、可检索的系统级认知地图。覆盖人-车-路-云协同、传感器选型、算法演进、全球法规四大维度，每个模块都配有结构化知识点。"
      />

      <div className="sticky top-16 z-30 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {active === 'system'     && <SystemArchitecture />}
        {active === 'sensor'     && <SensorTopology />}
        {active === 'algorithm'  && <AlgorithmTimeline />}
        {active === 'regulation' && <RegulationMap />}
      </main>
    </div>
  );
}
