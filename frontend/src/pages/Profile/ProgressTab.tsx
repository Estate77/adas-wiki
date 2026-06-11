import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLearningStore } from '@/store/learningStore';
import { useChatStore } from '@/store/chatStore';
import { DIMENSIONS } from '@/types';

/**
 * 学习进度：根据用户活动推断各维度的掌握度
 * - 收藏数（按维度）
 * - 提问数（按维度，从会话摘要推断）
 * - 准备清单完成度
 */
export default function ProgressTab() {
  const favorites = useLearningStore((s) => s.favorites);
  const prepList  = useLearningStore((s) => s.prepList);
  const conversations = useChatStore((s) => s.conversations);

  const stats = useMemo(() => {
    const favCount: Record<string, number> = {};
    favorites.forEach((f) => {
      if (f.dimension) {
        favCount[f.dimension] = (favCount[f.dimension] ?? 0) + 1;
      }
    });

    // 完成度 = 收藏贡献（每维度上限 5）+ 准备清单贡献
    const dims = DIMENSIONS.map((d) => {
      const fav = favCount[d.key] ?? 0;
      const prepForDim = prepList.filter((p) => {
        if (d.key === 'TECH_UNDERSTANDING')       return p.category === 'TECH' || p.category === 'GENERAL';
        if (d.key === 'PRODUCT_DEFINITION')       return p.category === 'PRODUCT';
        if (d.key === 'SAFETY_COMPLIANCE')        return p.category === 'SAFETY';
        if (d.key === 'SCENARIO_SYSTEM_THINKING') return p.category === 'TEST';
        return false;
      });
      const donePrep = prepForDim.filter((p) => p.status === 'DONE').length;
      const totalPrep = prepForDim.length;
      const prepProgress = totalPrep === 0 ? 0 : (donePrep / totalPrep) * 100;

      // 综合得分：收藏 30% + 准备清单 70%
      const score = Math.min(100, fav * 20 + prepProgress * 0.7);

      return {
        key: d.key,
        label: d.label,
        short: d.short,
        color: d.color,
        fav,
        prepProgress,
        totalPrep,
        donePrep,
        score: Math.round(score),
      };
    });

    const overall = Math.round(
      dims.reduce((s, d) => s + d.score, 0) / Math.max(1, dims.length),
    );
    return { dims, overall };
  }, [favorites, prepList]);

  return (
    <div className="space-y-5">
      {/* 总分 */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative w-32 h-32 shrink-0 mx-auto sm:mx-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" stroke="#1E293B" strokeWidth="8" fill="none" />
            <circle
              cx="60" cy="60" r="50"
              stroke="url(#g)"
              strokeWidth="8" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(stats.overall / 100) * 314} 314`}
              style={{ filter: 'drop-shadow(0 0 8px #38BDF8)' }}
            />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-semibold font-mono text-white">{stats.overall}</div>
            <div className="text-[10px] text-ink-500 tracking-widest">能力评分</div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold">个人能力成长报告</h3>
          <p className="mt-2 text-sm text-ink-400 leading-relaxed">
            基于你的 <b className="text-neon-200">{favorites.length}</b> 个收藏、
            <b className="text-neon-200"> {prepList.length}</b> 条准备清单、
            <b className="text-neon-200"> {conversations.length}</b> 个对话会话计算得出。
          </p>
          <p className="mt-2 text-xs text-ink-500">
            评分公式：<code className="text-neon-300">收藏 × 20 + 清单完成度 × 0.7</code>，取 6 维平均。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/qna" className="btn-primary text-xs">继续提问</Link>
            <Link to="/interview" className="btn-ghost text-xs">刷面试题</Link>
            <Link to="/graph" className="btn-ghost text-xs">看图谱</Link>
          </div>
        </div>
      </div>

      {/* 各维度明细 */}
      <div className="grid sm:grid-cols-2 gap-3">
        {stats.dims.map((d) => (
          <div key={d.key} className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: d.color, boxShadow: `0 0 8px ${d.color}` }}
                />
                <span className="text-sm font-medium text-ink-100">{d.label}</span>
              </div>
              <span className="text-lg font-mono font-semibold text-white">{d.score}</span>
            </div>

            <div className="space-y-1.5 text-xs text-ink-400">
              <div className="flex items-center justify-between">
                <span>收藏数</span>
                <span className="font-mono text-ink-200">{d.fav}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>清单完成</span>
                <span className="font-mono text-ink-200">
                  {d.donePrep}/{d.totalPrep}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${d.score}%`,
                    background: `linear-gradient(90deg, ${d.color}, #818CF8)`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 行动建议 */}
      <div className="glass-panel p-5 border-neon-400/20">
        <div className="flex items-center gap-2 text-[11px] text-ink-500 tracking-widest mb-3">
          <span className="inline-block w-3 h-px bg-gradient-to-r from-neon-400 to-transparent" />
          下一步行动建议
        </div>
        <ul className="space-y-2 text-sm text-ink-200">
          <Suggestion
            text="把薄弱维度的内容多收藏一些，评分提升最直接"
            score={stats.dims.reduce((a, b) => (a.score < b.score ? a : b))}
          />
          <Suggestion
            text="完成准备清单中标记为 TODO 的条目，可显著拉高综合评分"
            score={null}
          />
          <Suggestion
            text="在问答中尝试切换不同维度提问，建立多角度思考习惯"
            score={null}
          />
        </ul>
      </div>
    </div>
  );
}

function Suggestion({ text, score }: { text: string; score: { label: string; score: number } | null }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-5 h-5 rounded-md bg-neon-400/15 text-neon-300
                       text-[11px] font-mono flex items-center justify-center mt-0.5">→</span>
      <span className="leading-relaxed">
        {text}
        {score && (
          <span className="ml-2 text-[10px] text-ink-500">
            （当前最低：<b className="text-ink-300">{score.label}</b> · {score.score} 分）
          </span>
        )}
      </span>
    </li>
  );
}
