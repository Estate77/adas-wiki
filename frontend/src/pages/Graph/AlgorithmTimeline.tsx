import { useState } from 'react';

interface Milestone {
  year:     string;
  title:    string;
  category: '感知' | '融合' | '规控' | '端到端' | '数据' | '算力';
  desc:     string;
  hot:      boolean;
  /** 知识点 */
  kp:       string;
  /** 关键论文/玩家 */
  kpRefs:   string[];
  /** 关键指标 */
  kpMetric: string;
}

const TIMELINE: Milestone[] = [
  { year: '2016', category: '感知', hot: false, title: '传统 CV 阶段',
    desc: 'Haar/HOG + SVM/LaneNet；依赖规则与小模型，泛化能力差。',
    kp: '智驾感知从"手工特征 + 浅层模型"起步，泛化能力差、对长尾场景几乎无解。',
    kpRefs: ['LaneNet', '传统车道线检测综述'],
    kpMetric: 'mAP@COCO < 30%' },
  { year: '2018', category: '感知', hot: false, title: 'CNN 主导感知',
    desc: 'ResNet/YOLO 等深度模型大幅提升检测精度；BEV 概念尚未落地。',
    kp: '深度卷积网络成为感知主流，Anchor-based 检测器主导；BEV 概念尚未工程化。',
    kpRefs: ['YOLOv3', 'ResNet-50', 'Faster R-CNN'],
    kpMetric: 'mAP@COCO 50%+' },
  { year: '2020', category: '融合', hot: true, title: 'BEV 范式兴起',
    desc: 'Tesla AI Day 提出 BEV + Transformer，统一多相机到鸟瞰空间。',
    kp: 'BEV 是"统一空间"的范式革命，把感知、预测、规划全部统一到鸟瞰坐标系。',
    kpRefs: ['Tesla AI Day 2020', 'BEV 开山论文'],
    kpMetric: '感知统一空间' },
  { year: '2021', category: '融合', hot: false, title: 'BEVFormer / UniAD',
    desc: '学术界首批 BEV 感知 + 端到端规划联合训练工作。',
    kp: '上海 AI Lab 的 BEVFormer 与 UniAD 让 BEV 范式工程化，并把"端到端规划"带到现实。',
    kpRefs: ['BEVFormer (ECCV 2022)', 'UniAD (CVPR 2023 Best)'],
    kpMetric: 'nuScenes NDS 0.6+' },
  { year: '2022', category: '规控', hot: false, title: '传统规控 + ML 增强',
    desc: 'EM Planner / Frenet + 学习型代价函数，仍保留较多规则。',
    kp: 'Apollo 式规则规划 + ML 增强代价函数是过渡形态，仍有大量人工调参。',
    kpRefs: ['EM Planner', 'Frenet 坐标系', 'Cost Function 学习'],
    kpMetric: 'MPI ~ 50 km' },
  { year: '2023', category: '端到端', hot: true, title: '模块化端到端 (UniAD)',
    desc: '感知-预测-规划联合训练，单一损失函数推动上限提升。',
    kp: 'UniAD 用单一损失函数把感知-预测-规划打通，是端到端智驾的"工程样板"。',
    kpRefs: ['UniAD (CVPR 2023)', 'CVPR Best Paper'],
    kpMetric: 'MPI 提升 30%+' },
  { year: '2024', category: '端到端', hot: true, title: 'One Model 端到端上车',
    desc: 'Tesla FSD V12、小鹏 XNGP 5.0 引入 One Model + 强化学习。',
    kp: '取消模块切分，单一模型从传感器直接输出轨迹；可解释性差但上限高。',
    kpRefs: ['Tesla FSD v12', '小鹏 XNGP 5.0', '华为 ADS 3.0'],
    kpMetric: '接管率 ↓ 60%' },
  { year: '2025', category: '端到端', hot: true, title: 'VLM 接管规控',
    desc: '视觉语言模型作为"驾驶员大脑"，处理长尾 + 跨场景泛化。',
    kp: 'VLM 用大语言模型的常识与推理能力，弥补端到端模型"会开车但不会思考"的短板。',
    kpRefs: ['DriveVLM (CoRL 2024)', 'Hi-Drive', '理想 VLM 司机'],
    kpMetric: 'MPI ~ 200 km' },
  { year: '2026', category: '数据', hot: true, title: '世界模型 + 仿真闭环',
    desc: '生成式世界模型用于 Corner Case 训练，解决数据稀缺。',
    kp: '世界模型通过"想象未来"反哺训练，是 L3+ 解决 Corner Case 关键路径。',
    kpRefs: ['GAIA-1', 'DriveDreamer', 'Wayve World Model'],
    kpMetric: '仿真里程 10⁹ km' },
];

const CAT_COLOR: Record<Milestone['category'], string> = {
  '感知': 'cyan', '融合': 'violet', '规控': 'amber', '端到端': 'pink', '数据': 'emerald', '算力': 'red',
};

const COLOR: Record<string, string> = {
  cyan:    'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
  violet:  'bg-violet-500/15 text-violet-200 border-violet-500/30',
  amber:   'bg-amber-500/15 text-amber-200 border-amber-500/30',
  pink:    'bg-pink-500/15 text-pink-200 border-pink-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  red:     'bg-red-500/15 text-red-200 border-red-500/30',
};

export default function AlgorithmTimeline() {
  const [active, setActive] = useState(7);
  const sel = TIMELINE[active];

  return (
    <div className="space-y-5">
      {/* 顶部：时间轴 + 详情（左右布局） */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 左侧：时间轴（缩小） */}
        <div className="lg:col-span-3 glass-panel p-4">
          <h3 className="text-sm font-semibold">算法演进时间轴（2016 → 2026）</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">点击节点查看详情</p>

          <div className="relative mt-4 pl-2 sm:pl-0">
            <div className="absolute left-2 sm:left-0 right-0 top-1/2 -translate-y-1/2 h-0.5
                            bg-gradient-to-r from-cyan-400/30 via-violet-400/30 to-pink-400/30" />
            <ol className="flex overflow-x-auto gap-4 sm:gap-5 pb-2 no-scrollbar">
              {TIMELINE.map((m, i) => {
                const isActive = active === i;
                return (
                  <li key={m.year} className="relative shrink-0 w-32 sm:w-36">
                    <button
                      onClick={() => setActive(i)}
                      className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 w-3 h-3 rounded-full transition-all
                                  ${isActive ? 'bg-neon-300 shadow-glow-sm scale-125' : 'bg-neon-400/60 hover:bg-neon-300'}`}
                    />
                    <div className={`glass-panel p-2.5 ${m.year === '2018' || m.year === '2022' || m.year === '2025' ? 'mt-10' : 'mb-10'}
                                     ${isActive ? 'border-neon-400' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-neon-300">{m.year}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded-full border ${COLOR[CAT_COLOR[m.category]]}`}>
                          {m.category}
                        </span>
                      </div>
                      <h4 className="mt-1 text-[11px] font-semibold leading-snug line-clamp-2">{m.title}</h4>
                      {m.hot && <div className="mt-1 text-[9px] text-red-400">🔥 关键节点</div>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* 右侧：节点详情 */}
        <div className="lg:col-span-2 space-y-3">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-mono text-neon-300">{sel.year}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${COLOR[CAT_COLOR[sel.category]]}`}>
                {sel.category}
              </span>
              {sel.hot && <span className="text-[10px] text-red-400">🔥 关键节点</span>}
            </div>
            <h3 className="text-base font-semibold text-ink-100">{sel.title}</h3>
            <p className="mt-2 text-[12px] text-ink-300 leading-relaxed">{sel.desc}</p>
            <p className="mt-2 text-[12px] text-ink-300 leading-relaxed">{sel.kp}</p>
          </div>

          <div className="glass-panel p-4">
            <div className="text-[10px] text-ink-500 tracking-widest mb-2">关键论文 / 玩家</div>
            <div className="flex flex-wrap gap-1.5">
              {sel.kpRefs.map((r) => (
                <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-800 text-ink-200">
                  {r}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[10px] text-ink-500">关键指标</span>
              <span className="text-[12px] font-mono text-neon-300">{sel.kpMetric}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 核心概念速查（更紧凑） */}
      <section className="glass-panel p-4">
        <h3 className="text-sm font-semibold mb-3">核心概念速查</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { t: 'BEV (Bird\'s Eye View)', d: '统一空间范式。' },
            { t: 'Transformer 融合', d: '跨模态注意力。' },
            { t: 'Occupancy Network', d: '体素级 0/1 占据。' },
            { t: '端到端 (E2E)', d: '传感器→规划统一网络。' },
            { t: 'VLM / VLA', d: '视觉语言模型接管。' },
            { t: '世界模型', d: '可交互生成环境。' },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
              <div className="text-[12px] font-semibold text-neon-300">{c.t}</div>
              <p className="mt-1 text-[10px] text-ink-400 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
