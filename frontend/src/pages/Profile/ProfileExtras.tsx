import { useEffect, useState } from 'react';
import { useLearningStore } from '@/store/learningStore';
import HistoryTab     from './HistoryTab';
import FavoritesTab   from './FavoritesTab';
import ProgressTab    from './ProgressTab';
import PrepListTab    from './PrepListTab';

const TABS = [
  { key: 'history',   label: '提问历史' },
  { key: 'favorites', label: '我的收藏' },
  { key: 'progress',  label: '学习进度' },
  { key: 'prep',      label: '面试准备' },
];

export default function ProfileExtras() {
  const bootstrap = useLearningStore((s) => s.bootstrap);
  const [tab, setTab] = useState('history');

  useEffect(() => { bootstrap(); }, [bootstrap]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">个人学习中心</h2>

      <div className="glass-panel p-1 mb-5 inline-flex rounded-full bg-ink-900/80 border border-ink-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm rounded-full transition-all
                        ${tab === t.key
                          ? 'bg-neon-400 text-ink-950 font-medium'
                          : 'text-ink-300 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history'   && <HistoryTab />}
      {tab === 'favorites' && <FavoritesTab />}
      {tab === 'progress'  && <ProgressTab />}
      {tab === 'prep'      && <PrepListTab />}
    </div>
  );
}
