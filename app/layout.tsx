import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://6z6z6z6z.github.io'),
  title: 'Zhuang Zhang | AI & Data Science',
  description: 'Academic homepage of Zhuang Zhang, an undergraduate researcher at USTC working on multimodal representation, time-series learning, retrieval-augmented AI, and foundation models.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Zhuang Zhang | AI & Data Science',
    description: 'Multimodal representation, time-series learning, retrieval-augmented AI, and foundation models.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Zhuang Zhang · AI & Data Science' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zhuang Zhang | AI & Data Science',
    description: 'Multimodal representation, time-series learning, retrieval-augmented AI, and foundation models.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Zhuang Zhang',
              url: 'https://6z6z6z6z.github.io',
              image: 'https://6z6z6z6z.github.io/profile.jpg',
              email: 'mailto:zz6666@mail.ustc.edu.cn',
              affiliation: {
                '@type': 'CollegeOrUniversity',
                name: 'University of Science and Technology of China',
              },
              sameAs: ['https://github.com/6z6z6z6z'],
              knowsAbout: ['Multimodal Representation', 'Time Series', 'Retrieval-Augmented Generation', 'AI Agents'],
            }),
          }}
        />
      </body>
    </html>
  );
}
