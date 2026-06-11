import { useState } from 'react';

interface Scen {
  level: 'L2' | 'L3' | 'L4';
  title: string;
  desc:  string;
  driver:   string;
  vehicle:  string;
  insurer:  string;
  tone:     'amber' | 'pink' | 'red';
}

const SCENS: Scen[] = [
  { level: 'L2', tone: 'amber', title: 'L2 高速 NOA · 撞静止车辆',
    desc:  '驾驶员开启 NOA，未保持注意力，前方 1km 出现故障停车，系统未及时识别。',
    driver:  '主责（60%）— 未保持注意义务',
    vehicle: '次责（30%）— AEB 触发不及时',
    insurer: '10% — 走交强险 + 商业险组合赔付' },
  { level: 'L2', tone: 'amber', title: 'L2 城区 NOA · 撞两轮车',
    desc:  '城区右转时与盲区外卖两轮车剐蹭；DMS 检测到驾驶员视线偏离。',
    driver:  '主责（70%）— 视线偏离 + 未及时接管',
    vehicle: '次责（25%）— 盲区感知存在缺陷',
    insurer: '5%' },
  { level: 'L3', tone: 'pink', title: 'L3 高速 · 系统 ODD 内事故',
    desc:  'ODD 内系统主驾，驾驶员被允许视线短暂脱离；前方出现施工锥桶，系统未能识别。',
    driver:  '无责',
    vehicle: '主责（100%）— 系统缺陷',
    insurer: '车企责任险 + 交强险' },
  { level: 'L3', tone: 'pink', title: 'L3 高速 · ODD 越界事故',
    desc:  '系统请求接管（T-10s），驾驶员未在 6s 内响应，发生碰撞。',
    driver:  '主责（80%）— 未及时响应',
    vehicle: '次责（15%）— HMI 提示不够显著',
    insurer: '5%' },
  { level: 'L4', tone: 'red',  title: 'L4 Robotaxi · 正常 ODD 内事故',
    desc:  '限定区域运营，与闯红灯行人发生碰撞。',
    driver:  '无驾驶员（安全员监控）',
    vehicle: '主责（60%）— 防御性驾驶不足',
    insurer: '行人违法承担 30%，剩余 10% 平台 + 道路方' },
  { level: 'L4', tone: 'red',  title: 'L4 Robotaxi · 系统失效',
    desc:  '传感器单点失效，冗余系统接管失败，碰撞隔离墩。',
    driver:  '无',
    vehicle: '主责（100%）— 冗余设计 / FMEA 不充分',
    insurer: '车企全责' },
];

const TONE: Record<Scen['tone'], string> = {
  amber: 'border-amber-500/30 bg-amber-500/5',
  pink:  'border-pink-500/30 bg-pink-500/5',
  red:   'border-red-500/30 bg-red-500/5',
};

export default function LiabilityGuide() {
  const [active, setActive] = useState(0);
  const s = SCENS[active];

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <aside className="space-y-2">
        {SCENS.map((x, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-full text-left p-3.5 rounded-xl border transition-colors
                        ${i === active
                          ? 'border-neon-400 bg-neon-400/5'
                          : 'border-ink-800 hover:border-ink-600 bg-ink-900/40'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-ink-700 text-ink-300 font-mono">
                {x.level}
              </span>
              <span className="text-sm font-semibold leading-snug line-clamp-1">{x.title}</span>
            </div>
            <p className="mt-1 text-xs text-ink-400 line-clamp-2">{x.desc}</p>
          </button>
        ))}
      </aside>

      <article className={`glass-panel p-6 ${TONE[s.tone]}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full border border-ink-700 font-mono">{s.level}</span>
          <h3 className="text-lg font-semibold">{s.title}</h3>
        </div>
        <p className="text-sm text-ink-300 leading-relaxed">{s.desc}</p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <Box tone="cyan"    label="驾驶员"  text={s.driver}  />
          <Box tone="amber"   label="车企/车端" text={s.vehicle} />
          <Box tone="violet"  label="保险 / 其他" text={s.insurer} />
        </div>

        <div className="mt-5 rounded-xl border border-ink-800 bg-ink-950/60 p-4 text-xs text-ink-300 space-y-1.5">
          <p>· 责任判定核心：<b>ODD 内 / 外</b>、<b>系统是否触发</b>、<b>驾驶员响应时序</b></p>
          <p>· 数据依据：<b>DSSAD（Data Storage System for Automated Driving）</b> 记录全链路状态</p>
          <p>· 关键判例：UN-R157 要求事故后 6 个月内可还原事件链</p>
        </div>
      </article>
    </div>
  );
}

function Box({ label, text, tone }: { label: string; text: string; tone: 'cyan' | 'amber' | 'violet' }) {
  const TONE: Record<string, string> = {
    cyan:   'border-cyan-500/30 bg-cyan-500/5 text-cyan-200',
    amber:  'border-amber-500/30 bg-amber-500/5 text-amber-200',
    violet: 'border-violet-500/30 bg-violet-500/5 text-violet-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${TONE[tone]}`}>
      <div className="text-[10px] tracking-widest opacity-80">{label}</div>
      <div className="mt-1.5 text-sm font-medium">{text}</div>
    </div>
  );
}
