import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

/** Phase 1: static pages. Campaign, business and city/area pages are added as those modules ship. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 }];
}
