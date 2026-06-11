// 全局静态常量
export const APP_NAME = '智驾百科';
export const APP_EN_NAME = 'ADAS-Wiki';
export const SLOGAN = '用最简单的方式，看懂最硬核的智能驾驶';

// 导航配置
export interface NavItem {
  label: string;
  to: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: '首页',     to: '/' },
  { label: '功能问答', to: '/qna' },
  { label: '全景图谱', to: '/graph' },
  { label: '面试题库', to: '/interview' },
  { label: '场景模拟', to: '/simulator' },
  { label: '安全合规', to: '/safety' },
  { label: '竞品拆解', to: '/competitor' },
];
