// 通用类型定义
import type { ReactNode } from 'react';

export type Dimension =
  | 'TECH_UNDERSTANDING'
  | 'PRODUCT_DEFINITION'
  | 'SAFETY_COMPLIANCE'
  | 'USER_EXPERIENCE'
  | 'BUSINESS_COMPETITION'
  | 'SCENARIO_SYSTEM_THINKING';

export interface DimensionMeta {
  key: Dimension;
  label: string;
  short: string;
  color: string; // 雷达图描边色
}

export const DIMENSIONS: DimensionMeta[] = [
  { key: 'TECH_UNDERSTANDING',       label: '技术理解力',     short: '技术', color: '#38BDF8' },
  { key: 'PRODUCT_DEFINITION',       label: '产品定义力',     short: '产品', color: '#A78BFA' },
  { key: 'SAFETY_COMPLIANCE',        label: '安全与合规',     short: '合规', color: '#34D399' },
  { key: 'USER_EXPERIENCE',          label: '用户体验',       short: '体验', color: '#F472B6' },
  { key: 'BUSINESS_COMPETITION',     label: '商业与竞争',     short: '商业', color: '#FBBF24' },
  { key: 'SCENARIO_SYSTEM_THINKING', label: '场景与系统思维', short: '场景', color: '#F87171' },
];

export interface AbilityScore {
  dimension: Dimension;
  score: number; // 0~100
}

export interface QuickNavItem {
  title: string;
  desc: string;
  to: string;
  icon: ReactNode; // 允许传入 inline SVG / emoji
  accent: string;
}
