import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://6z6z6z6z.github.io'),
  title: '张荘 | AI & Data Science',
  description: '中国科学技术大学人工智能与数据科学学院本科生张荘的个人主页：多模态表征、时间序列建模、RAG 与大模型智能体。',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    title: '张荘 | AI & Data Science',
    description: '多模态表征、时间序列建模、RAG 与大模型智能体。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '张荘 · AI & Data Science' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '张荘 | AI & Data Science',
    description: '多模态表征、时间序列建模、RAG 与大模型智能体。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: '张荘',
              url: 'https://6z6z6z6z.github.io',
              image: 'https://6z6z6z6z.github.io/avatar.png',
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
