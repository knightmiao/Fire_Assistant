/**
 * 宝可梦现代化风格图标 — 森林/海洋/游戏元素
 * 圆角矢量风格，用于导航与卡片
 */
import type { SVGProps } from 'react';

const size = 20;

export function IconDashboard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.85" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.85" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.85" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.85" />
      <rect x="9" y="9" width="6" height="6" rx="2" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

export function IconProfile(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M12 4L6 10l6 10 6-10L12 4z" fill="currentColor" fillOpacity="0.95" />
      <path d="M12 7l-3 4 3 5 3-5-3-4z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}

export function IconAssets(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
      <rect x="9" y="13.5" width="6" height="3" rx="1" fill="currentColor" fillOpacity="0.9" />
    </svg>
  );
}

export function IconIncome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M12 3C9 7 6 11 6 15a6 6 0 1 0 12 0c0-4-3-8-6-12z" fill="currentColor" fillOpacity="0.95" />
      <path d="M12 7c-1.5 2.5-3 5-3 8a3 3 0 0 0 6 0c0-3-1.5-5.5-3-8z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}
