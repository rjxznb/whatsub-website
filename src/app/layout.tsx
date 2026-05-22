import type { Metadata } from 'next';
// Self-host JetBrains Mono via @fontsource (used for version chips +
// timestamps). Inter dropped — body sans now uses the OS native font
// stack (system-ui → Microsoft YaHei UI / PingFang SC etc.) so Chinese
// chars match Latin chars with the same metrics, and we avoid the
// Google Fonts CDN cert-error issue in mainland China.
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './globals.css';

const SITE_URL = 'https://whatsub.eversay.cc';
const SITE_TITLE = 'whatSub — 让一句字幕，慢慢成为你的英语';
const SITE_DESC =
  '把 YouTube 视频变成你的英语课：一键下载解析、双语字幕重点标黄、词汇笔记沉淀。Windows / macOS 桌面应用，永久授权 ¥59.9（学生 ¥29.9）。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · whatSub',
  },
  description: SITE_DESC,
  applicationName: 'whatSub',
  authors: [{ name: 'whatSub' }],
  creator: 'whatSub',
  publisher: 'whatSub',
  keywords: [
    'whatSub',
    'whatsub',
    '英语学习软件',
    '字幕学习',
    'YouTube 字幕',
    '双语字幕',
    'Whisper 本地转录',
    '英语听力训练',
    '影子跟读',
    '看视频学英语',
    '词汇本',
    '字幕软件',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: 'whatSub',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'whatSub — 让一句字幕，慢慢成为你的英语',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // No explicit icons block — Next 14 auto-detects src/app/{favicon.ico,icon.png}
  // and emits the right <link rel="icon"> tags. Source PNG is the same
  // whatSub black-bg square as public/whatsub-icon.png.
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'whatSub',
  alternateName: ['whatsub', 'WhatSub'],
  url: SITE_URL,
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'LanguageLearning',
  operatingSystem: 'Windows 10/11, macOS 12+',
  description: SITE_DESC,
  inLanguage: 'zh-CN',
  softwareVersion: '0.1.x',
  downloadUrl: `${SITE_URL}/#download`,
  installUrl: `${SITE_URL}/#download`,
  featureList: [
    '一键下载解析视频',
    '英中双语字幕',
    '重点短语高亮',
    '一键导出字幕',
    '词汇笔记沉淀',
    '一份授权 3 台设备',
  ],
  offers: {
    '@type': 'Offer',
    price: '59.9',
    priceCurrency: 'CNY',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/#pricing`,
    priceValidUntil: '2026-12-31',
  },
  publisher: {
    '@type': 'Organization',
    name: 'whatSub',
    url: SITE_URL,
    logo: `${SITE_URL}/whatsub-icon.png`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preload"
          href="/fonts/Caveat-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
