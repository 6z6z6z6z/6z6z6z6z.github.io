import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://6z6z6z6z.github.io',
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
