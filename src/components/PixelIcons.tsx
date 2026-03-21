/** 简洁矢量图标 — 用于侧栏导航等 */
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

/** 删除 / 垃圾桶 — 与导航图标同尺度，用于列表危险操作 */
export function IconTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M9.5 3.25c-.41 0-.75.34-.75.75V5H5.5c-.55 0-1 .45-1 1s.45 1 1 1h.5v11.25A2.25 2.25 0 0 0 8.25 21h7.5A2.25 2.25 0 0 0 18 18.25V7h.5c.55 0 1-.45 1-1s-.45-1-1-1h-3.25V4c0-.41-.34-.75-.75-.75h-5zM11 5h2v1h-2V5zm-2.25 3h6.5v11.25h-6.5V8z"
        fill="currentColor"
        fillOpacity="0.92"
      />
      <path d="M10.1 10.5v6M13.9 10.5v6" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}
