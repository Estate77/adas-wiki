import { useState } from 'react';

interface Weather {
  key: 'sunny' | 'rain' | 'night' | 'snow';
  label: string;
  icon:  string;
  desc:  string;
  tips:  string[];
  sensors: { name: string; perf: number; note: string }[];
}

const WEATHERS: Weather[] = [
  { key: 'sunny', label: '晴天 · 强光', icon: '☀️',
    desc: '进 / 出隧道光照剧烈变化，摄像头易出现「白平衡漂移」',
    tips: ['使用 HDR 摄像头', '在地图上提前标注隧道点', '出隧道前 200m 降低车速'],
    sensors: [
      { name: '前视摄像头', perf: 70, note: '出隧道眩光 → 误识别' },
      { name: '毫米波雷达', perf: 95, note: '基本无影响' },
      { name: '激光雷达',   perf: 90, note: '略受阳光红外噪声影响' },
    ] },
  { key: 'rain', label: '暴雨 / 积水', icon: '🌧️',
    desc: '能见度 < 50m，路面湿滑 + 摄像头水膜模糊',
    tips: ['激光雷达点云雨滴噪声', '毫米波雷达多径反射', '启用 AEB 增强模式', '车道线降级为车道拓扑'],
    sensors: [
      { name: '前视摄像头', perf: 40, note: '水膜遮挡严重' },
      { name: '毫米波雷达', perf: 75, note: '多径反射 + 误报' },
      { name: '激光雷达',   perf: 65, note: '雨滴散射点' },
    ] },
  { key: 'night', label: '夜间 · 无路灯', icon: '🌙',
    desc: '可见光摄像头近乎失效，需依赖雷达 + 高动态成像',
    tips: ['启用红外摄像头 / 热成像', '提高毫米波雷达权重', '限速 + 扩大跟车时距'],
    sensors: [
      { name: '前视摄像头', perf: 35, note: '依赖车灯' },
      { name: '毫米波雷达', perf: 95, note: '夜视主力' },
      { name: '激光雷达',   perf: 95, note: '主动光源' },
    ] },
  { key: 'snow', label: '雪天 · 冰雪', icon: '❄️',
    desc: '车道线被覆盖 + 车辆被积雪改变外形 + 制动距离延长 2~3 倍',
    tips: ['使用语义矢量地图', '跟车时距 ×2', '制动预填充', '检测到积雪覆盖 → 限制功能'],
    sensors: [
      { name: '前视摄像头', perf: 25, note: '车道线丢失' },
      { name: '毫米波雷达', perf: 80, note: '雪地吸收信号' },
      { name: '激光雷达',   perf: 50, note: '积雪覆盖镜头' },
    ] },
];

export default function WeatherPark() {
  const [active, setActive] = useState<Weather['key']>('rain');
  const w = WEATHERS.find((x) => x.key === active)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {WEATHERS.map((x) => (
          <button
            key={x.key}
            onClick={() => setActive(x.key)}
            className={`px-4 py-2 rounded-full text-sm transition-all
                        ${active === x.key
                          ? 'bg-neon-400 text-ink-950 font-medium shadow-glow-sm'
                          : 'border border-ink-700 text-ink-300 hover:border-ink-500'}`}
          >
            <span className="mr-1">{x.icon}</span>
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 场景描述 */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold">{w.icon} {w.label}</h3>
          <p className="text-sm text-ink-300 leading-relaxed">{w.desc}</p>

          <div>
            <h4 className="text-sm font-semibold text-amber-300 mb-2">⚙️ 系统应对策略</h4>
            <ul className="space-y-2 text-sm text-ink-200">
              {w.tips.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 传感器表现 */}
        <div className="glass-panel p-6 space-y-4">
          <h4 className="text-sm font-semibold text-cyan-300">🔧 传感器表现</h4>
          {w.sensors.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-200">{s.name}</span>
                <span className="font-mono text-xs text-ink-300">{s.perf}%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className={`h-full ${s.perf >= 80 ? 'bg-emerald-400' : s.perf >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${s.perf}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-500">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 极端泊车 */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">🚗 极端天气泊车 · 难点拆解</h3>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {[
            { t: '车位识别',  d: '车位线被积雪覆盖；AVM 环视拼接困难。' },
            { t: '障碍物',    d: '锥桶 / 雪堆 / 儿童玩具；尺寸与训练分布差异大。' },
            { t: '轨迹规划',  d: '低附着路面 + 转向回正力小，需更平滑曲线。' },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
              <div className="text-sm font-semibold text-neon-300">{c.t}</div>
              <p className="mt-1.5 text-xs text-ink-400">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 关注点 + 问题解析 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-amber-300 mb-3">🎯 工程关注点</h4>
          <div className="space-y-2">
            {[
              { l: '多传感器冗余',     d: '雨雾天激光雷达 + 毫米波雷达多源融合',                n: 'high' },
              { l: '去噪算法',         d: '雨滴 / 雪花 / 灰尘点云滤波（PointNet++ 改进）',     n: 'high' },
              { l: '积水识别',         d: '超声波雷达反射强度 + 视觉纹理双重判断',              n: 'high' },
              { l: '制动预填充',       d: '低附着路面提前建压，减少 AEB 响应时延',              n: 'mid'  },
              { l: '功能降级策略',     d: '能见度 < 50m 自动关闭城市 NOA',                       n: 'high' },
            ].map((w) => (
              <div key={w.l} className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-ink-200">{w.l}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border
                    ${w.n === 'high' ? 'border-red-500/40 text-red-200 bg-red-500/10' :
                                       'border-amber-500/40 text-amber-200 bg-amber-500/10'}`}>
                    {w.n === 'high' ? '高' : '中'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-ink-400">{w.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-violet-300 mb-3">🧠 问题解析 · 决策树</h4>
          <div className="space-y-3">
            {[
              { q: '暴雨天摄像头几乎失效，系统该怎么办？',
                a: '权重动态切换：摄像头 → 毫米波雷达 + 激光雷达主导；前向摄像头置信度 < 0.6 时主动降级到 LCC。' },
              { q: '雪天为什么要跟车时距 ×2？',
                a: '低附着路面制动距离延长 2~3 倍；1.5s 时距（常规）→ 3.0s 时距（雪天）才能保留安全余量。' },
              { q: '夜间无路灯场景应不应该禁用 NOA？',
                a: '建议：城区 ODD 排除 22:00~6:00 无路灯路段；高速场景因有激光雷达 + 毫米波可保留。' },
              { q: '激光雷达有水雾怎么办？',
                a: '硬件：镜头加热 + 雨刮 + 自清洁；算法：基于反射强度自适应过滤低置信度点云。' },
              { q: '如何验证极端天气下的安全性？',
                a: '封闭场地 + 真实雨雾 + 仿真回灌三重验证；欧洲 Euro NCAP 2025 起把"夜间 AEB"列为评分项。' },
            ].map((d, i) => (
              <div key={i} className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
                <div className="text-xs font-semibold text-ink-200">Q{i + 1}. {d.q}</div>
                <div className="mt-1 text-xs text-emerald-200">A. {d.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
