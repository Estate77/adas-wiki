import { useState } from 'react';

interface Axis {
  key:     string;
  label:   string;
  options: { v: string; label: string; ok: boolean; note: string }[];
}

const AXES: Axis[] = [
  { key: 'road',   label: '道路类型', options: [
    { v: 'high',  label: '高速 / 快速路', ok: true,  note: 'NOA 主流场景' },
    { v: 'urban', label: '城市主路',     ok: true,  note: '城区 NOA 逐步开放' },
    { v: 'local', label: '小区 / 园区',  ok: false, note: '需要 L4 限定方案' },
  ] },
  { key: 'speed',  label: '速度区间', options: [
    { v: '0-30',  label: '0~30km/h',    ok: true,  note: '城市拥堵 / 泊车' },
    { v: '30-80', label: '30~80km/h',   ok: true,  note: '城市常见' },
    { v: '80-130',label: '80~130km/h',  ok: true,  note: '高速主流' },
    { v: '>130',  label: '>130km/h',    ok: false, note: 'UN-R157 限速 130' },
  ] },
  { key: 'weather',label: '天气', options: [
    { v: 'sun',   label: '晴朗',         ok: true,  note: '全功能可用' },
    { v: 'rain',  label: '小雨',         ok: true,  note: '降级部分功能' },
    { v: 'heavy', label: '暴雨 / 大雪',  ok: false, note: '需降级或退出' },
    { v: 'fog',   label: '团雾',         ok: false, note: '建议接管' },
  ] },
  { key: 'time',   label: '时间 / 光照', options: [
    { v: 'day',   label: '白天',         ok: true,  note: '全功能' },
    { v: 'night', label: '夜间有路灯',   ok: true,  note: '主要依赖雷达' },
    { v: 'dark',  label: '夜间无路灯',   ok: false, note: '限速 + 跟车' },
  ] },
  { key: 'map',    label: '高精地图', options: [
    { v: 'hd',    label: 'HD Map 已覆盖', ok: true,  note: '推荐全功能' },
    { v: 'sd',    label: '仅 SD Map',     ok: false, note: '降级到基础 LCC' },
    { v: 'no',    label: '未测绘区域',    ok: false, note: '需驾驶员接管' },
  ] },
];

export default function ODDExplorer() {
  const [picked, setPicked] = useState<Record<string, string>>({
    road: 'high', speed: '80-130', weather: 'sun', time: 'day', map: 'hd',
  });
  const failedAxes = AXES.filter((a) => {
    const v = picked[a.key];
    return v && a.options.find((o) => o.v === v)?.ok === false;
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">交互式 ODD 边界检查</h3>
        <p className="text-sm text-ink-400 mt-1">逐项勾选 ODD 条件，实时判断功能是否可启用。</p>

        <div className="mt-6 space-y-5">
          {AXES.map((a) => (
            <div key={a.key}>
              <div className="text-xs text-ink-400 tracking-widest mb-2">{a.label}</div>
              <div className="flex flex-wrap gap-2">
                {a.options.map((o) => {
                  const isPicked = picked[a.key] === o.v;
                  return (
                    <button
                      key={o.v}
                      onClick={() => setPicked((p) => ({ ...p, [a.key]: o.v }))}
                      className={`px-3 py-1.5 text-sm rounded-xl border transition-all
                                  ${isPicked
                                    ? (o.ok ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'bg-red-500/15 border-red-500/40 text-red-200')
                                    : 'border-ink-700 text-ink-300 hover:border-ink-500'}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 判定结果 */}
      <div className={`glass-panel p-6 border ${failedAxes.length === 0 ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {failedAxes.length === 0 ? (
            <span className="text-emerald-300">✓ 在 ODD 内 · 功能可启用</span>
          ) : (
            <span className="text-red-300">✕ 超出 ODD · 建议退出或接管</span>
          )}
        </h3>
        {failedAxes.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm text-ink-200">
            {failedAxes.map((a) => {
              const o = a.options.find((x) => x.v === picked[a.key])!;
              return (
                <li key={a.key} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span><b>{a.label}</b> · {o.label}：{o.note}</span>
                </li>
              );
            })}
          </ul>
        )}
        {failedAxes.length === 0 && (
          <p className="mt-2 text-sm text-ink-300">所有条件均满足 ODD 边界，系统可全功能运行；建议持续关注环境变化。</p>
        )}
      </div>
    </div>
  );
}
