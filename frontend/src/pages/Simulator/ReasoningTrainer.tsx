import { useState } from 'react';

interface Case {
  id:      string;
  title:   string;
  scenario: string;
  choices: { k: string; label: string; isRight: boolean; reason: string }[];
  hint:    string;
  answer:  string;
}

const CASES: Case[] = [
  { id: 'c1', title: '01 · L2 退出后事故',
    scenario: '驾驶员在开启 LCC 高速巡航 12 分钟后，低头看手机，系统未提示接管，3 秒后撞上前方施工区。',
    choices: [
      { k: 'A', label: '驾驶员全责（未保持注意力）',           isRight: true,  reason: 'L2 仍由驾驶员承担责任，未保持注意力是直接原因。' },
      { k: 'B', label: '车企全责（系统未及时退出）',           isRight: false, reason: 'L2 阶段驾驶员仍是责任主体，但车企应优化 DSM + 提示。' },
      { k: 'C', label: '施工方全责（未按规范设置警示）',         isRight: false, reason: '可作为事故次因，但不是 L2 责任划分主体。' },
      { k: 'D', label: '保险公司全责',                       isRight: false, reason: '保险公司按保险合同赔付，不承担事故认定责任。' },
    ],
    hint: '关键看：系统是否在 ODD 内运行？驾驶员是否被合理监控？',
    answer: 'L2 系统下，驾驶员负主责；车企 DSM 设计不足是次因，可作为产品改进点。' },
  { id: 'c2', title: '02 · 城区 NOA 撞两轮车',
    scenario: '城市 NOA 右转时与从盲区驶出的外卖两轮车剐蹭。',
    choices: [
      { k: 'A', label: '驾驶员全责',                           isRight: false, reason: 'L2 阶段驾驶员需要监督，但 NOA 未能识别盲区两轮车是产品缺陷。' },
      { k: 'B', label: '车企全责',                             isRight: false, reason: '尚不能简单归属车企。' },
      { k: 'C', label: '驾驶员 + 车企按比例担责',              isRight: true,  reason: '实践常见划分：驾驶员未保持注意力 + 系统盲区感知不足。' },
      { k: 'D', label: '两轮车全责（违章驶入）',                isRight: false, reason: '可作为次因，但 NOA 系统应具备防御性驾驶。' },
    ],
    hint: '结合产品 + 法规 + 工程实践判断',
    answer: 'L2 NOA 阶段，事故责任大概率主责在驾驶员；车企若 DMS / 盲区监测存在缺陷可承担次责或产品责任。' },
  { id: 'c3', title: '03 · AEB 主动刹车争议',
    scenario: '行人横穿马路，AEB 触发但驾驶员同步踩油门，最终发生碰撞。',
    choices: [
      { k: 'A', label: 'AEB 优先 → 行人全责',                  isRight: false, reason: 'AEB 不能保证避免事故，更不能转嫁责任。' },
      { k: 'B', label: '驾驶员全责（油门覆盖 AEB）',            isRight: true,  reason: 'AEB 设计为「驾驶员油门覆盖时不启动」是法规共识。' },
      { k: 'C', label: 'AEB 未及时减速 → 车企全责',             isRight: false, reason: '需根据 AEB 触发时间戳 / 速度曲线鉴定。' },
      { k: 'D', label: '行人全责（横穿马路）',                  isRight: false, reason: '行人违法是次因，主责仍在驾驶操作。' },
    ],
    hint: 'AEB 主动介入与人类驾驶权的优先级',
    answer: '驾驶员油门优先级高于 AEB；如系统未启动 AEB 才是车企问题。' },
  { id: 'c4', title: '04 · L3 系统 ODD 越界后事故',
    scenario: '驾驶员在 L3 高速 NOA 模式下，车辆驶出 ODD 边界（暴雨超出降水阈值），系统未提示接管，5s 后追尾。',
    choices: [
      { k: 'A', label: '驾驶员全责（未保持注意力）',     isRight: false, reason: 'L3 阶段 ODD 内由系统承担主责，越界时系统必须及时移交。' },
      { k: 'B', label: '车企全责（系统未及时移交）',     isRight: true,  reason: 'L3 系统的法定责任是"在 ODD 越界前 10s 提示接管"；未达 10s 移交属于产品缺陷。' },
      { k: 'C', label: '驾驶员 + 车企按比例担责',        isRight: false, reason: 'L3 阶段责任清晰，比例担责易引发争议。' },
      { k: 'D', label: '天气全责（不可抗力）',            isRight: false, reason: 'ODD 定义里已包含天气条件，触发越界是产品责任。' },
    ],
    hint: 'L3 责任主体：ODD 内归系统，ODD 外归驾驶员；越界未及时移交是车企责任。',
    answer: 'L3 阶段系统 ODD 边界管理是法定义务；未达 10s 接管移交时间线 = 车企产品责任。' },
  { id: 'c5', title: '05 · 影子模式下事故',
    scenario: 'L2+ 系统处于影子模式（人类驾驶），系统计算结果会触发 AEB，但实际未执行。人类驾驶同时踩油门，发生事故。',
    choices: [
      { k: 'A', label: '驾驶员全责',                       isRight: true,  reason: '影子模式不参与控制，事故责任在驾驶员；可作为产品迭代数据。' },
      { k: 'B', label: '车企全责（系统应介入未介入）',     isRight: false, reason: '影子模式设计即"不控制"，车企无控制责任。' },
      { k: 'C', label: '驾驶员 + 车企按比例担责',          isRight: false, reason: 'L2 + 影子模式责任清晰，无比例划分。' },
      { k: 'D', label: '无责（系统未执行控制）',            isRight: false, reason: '事故责任不可能无主体。' },
    ],
    hint: '影子模式的边界：只记录 + 不控制',
    answer: '影子模式本质是"数据采集工具"，车企和系统不参与控制，事故责任在人类驾驶员。' },
  { id: 'c6', title: '06 · OTA 升级导致事故',
    scenario: 'OTA 升级后 1 周内，L2 系统的 AEB 漏触发导致追尾前车。驾驶员未踩刹车，事故后用户控诉"OTA 引入了 Bug"。',
    choices: [
      { k: 'A', label: '驾驶员全责（未踩刹车）',           isRight: false, reason: 'AEB 是 L2 系统的法定义务，未触发是产品缺陷。' },
      { k: 'B', label: '车企全责（OTA 引入 Bug）',         isRight: true,  reason: 'UN-R156 要求 OTA 升级不能降低安全性能；违规可被处罚款。' },
      { k: 'C', label: '用户 + 车企按比例担责',            isRight: false, reason: 'AEB 设计目的就是兜底驾驶员失误，比例划分不合理。' },
      { k: 'D', label: '保险公司全责',                     isRight: false, reason: '保险按合同赔付，不承担事故认定责任。' },
    ],
    hint: 'OTA 升级 + 安全性能 + 法规义务',
    answer: 'UN-R156 + EU AI Act 都要求 OTA 不能降低安全；AEB 漏触发 = 车企产品责任。' },
  { id: 'c7', title: '07 · 网安攻击导致事故',
    scenario: '黑客通过 OTA 通道植入恶意代码，篡改感知数据导致 NOA 误判并撞车。',
    choices: [
      { k: 'A', label: '驾驶员全责',                       isRight: false, reason: '驾驶员被系统欺骗，不是主观错误。' },
      { k: 'B', label: '黑客全责（刑事）',                 isRight: true,  reason: '黑客承担主要刑事 + 民事责任；车企需证明 CSMS 符合 UN-R155。' },
      { k: 'C', label: '车企全责（网安不达标）',           isRight: false, reason: '需先鉴定车企 CSMS 是否合规；若合规可减责。' },
      { k: 'D', label: 'OTA 平台全责',                     isRight: false, reason: '责任分散在车企 / 黑客 / OTA 平台。' },
    ],
    hint: 'UN-R155 CSMS + UN-R156 SUMS + 黑客刑事责任',
    answer: '黑客主责（刑事+民事），车企按 CSMS 合规程度承担次责；OEM 必须建立完整网安体系。' },
];

export default function ReasoningTrainer() {
  const [active, setActive] = useState(CASES[0].id);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const c = CASES.find((x) => x.id === active)!;

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      <aside className="space-y-2">
        {CASES.map((x) => (
          <button
            key={x.id}
            onClick={() => setActive(x.id)}
            className={`w-full text-left p-4 rounded-xl border transition-colors
                        ${x.id === active
                          ? 'border-neon-400 bg-neon-400/5'
                          : 'border-ink-800 hover:border-ink-600 bg-ink-900/40'}`}
          >
            <div className="text-sm font-semibold">{x.title}</div>
            <p className="mt-1 text-xs text-ink-400 line-clamp-2">{x.scenario}</p>
          </button>
        ))}
      </aside>

      <article className="space-y-5">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold">{c.title}</h3>
          <p className="mt-2 text-sm text-ink-300 leading-relaxed">{c.scenario}</p>
          <p className="mt-2 text-xs text-ink-500">💡 提示：{c.hint}</p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          {c.choices.map((ch) => {
            const userPicked = picked[c.id] === ch.k;
            const show = picked[c.id] !== undefined;
            return (
              <button
                key={ch.k}
                onClick={() => setPicked((p) => ({ ...p, [c.id]: ch.k }))}
                className={`w-full text-left p-4 rounded-xl border transition-colors
                            ${!show
                              ? 'border-ink-800 hover:border-ink-600 bg-ink-900/40'
                              : ch.isRight
                                ? 'border-emerald-400 bg-emerald-500/10'
                                : userPicked
                                  ? 'border-red-400 bg-red-500/10'
                                  : 'border-ink-800 opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-mono
                                    ${show
                                      ? ch.isRight
                                        ? 'bg-emerald-400 text-ink-950'
                                        : userPicked
                                          ? 'bg-red-400 text-ink-950'
                                          : 'bg-ink-800 text-ink-400'
                                      : 'bg-ink-800 text-ink-300'}`}>
                    {ch.k}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm">{ch.label}</div>
                    {show && (
                      <div className={`mt-1.5 text-xs ${ch.isRight ? 'text-emerald-200' : userPicked ? 'text-red-200' : 'text-ink-400'}`}>
                        {ch.reason}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {picked[c.id] && (
          <div className="glass-panel p-5 border-neon-400/30">
            <h4 className="text-sm font-semibold text-neon-300">📝 完整解析</h4>
            <p className="mt-2 text-sm text-ink-200 leading-relaxed">{c.answer}</p>
          </div>
        )}
      </article>
    </div>
  );
}
