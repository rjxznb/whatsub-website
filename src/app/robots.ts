import type { MetadataRoute } from 'next';

const SITE_URL = 'https://whatsub.eversay.cc';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Post-purchase polling page — never useful in search results,
        // and indexing it can leak out_trade_no fragments to crawlers.
        disallow: ['/payment/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
