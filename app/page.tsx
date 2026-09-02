import Image from 'next/image';
import Link from 'next/link';
import {
  AudioLines,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Database,
  GraduationCap,
  Mail,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';

const links = [
  { label: '关于', href: '#about' },
  { label: '项目', href: '#work' },
  { label: '经历', href: '#experience' },
  { label: '联系', href: '#contact' },
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="主导航">
        <a className="brand" href="#top" aria-label="返回首页">
          <span>ZZ</span>
        </a>
        <div className="nav-links">
          {links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <a className="nav-contact" href="mailto:zz6666@mail.ustc.edu.cn">
          联系我 <ArrowUpRight size={15} />
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={15} /> AI STUDENT · RESEARCH BUILDER
          </p>
          <h1>
            让多模态信息，
            <span>成为可检索的智能。</span>
          </h1>
          <p className="hero-intro">
            你好，我是张荘，中国科学技术大学人工智能与数据科学学院本科生。
            我关注多模态表征、时间序列建模、检索增强生成与大模型智能体，
            喜欢把一个研究问题做成可验证、可复现的完整系统。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              查看代表项目 <ArrowDownRight size={17} />
            </a>
            <Link className="button button-ghost" href="/resume-zhang-zhuang.pdf" target="_blank">
              下载简历
            </Link>
          </div>
          <div className="hero-meta">
            <span><MapPin size={15} /> Hefei, China</span>
            <span className="availability"><i /> Open to research opportunities</span>
          </div>
        </div>

        <aside className="portrait-wrap" aria-label="个人信息卡片">
          <div className="portrait-frame">
            <Image
              src="/avatar.png"
              alt="张荘的证件照"
              fill
              priority
              sizes="(max-width: 800px) 72vw, 360px"
            />
          </div>
          <div className="portrait-note">
            <span>张荘</span>
            <small>Data Science & AI · USTC</small>
          </div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
        </aside>
      </section>

      <section className="intro-strip" id="about">
        <p>MY QUESTION</p>
        <h2>
          如果模型能找到真正有帮助的历史邻居，
          <em>下游任务能否变得更简单、更可靠？</em>
        </h2>
      </section>

      <section className="featured" id="work">
        <div className="section-heading">
          <p>SELECTED WORK · 01</p>
          <h2>ContextMTS-Retriever</h2>
          <span>2026.01 — 2026.07</span>
        </div>
        <div className="featured-grid">
          <div className="feature-story">
            <p className="project-kicker">语境增强的多模态时间序列检索预测</p>
            <h3>不只寻找“长得像”的曲线，也寻找“处境相似”的历史。</h3>
            <p>
              传统时序检索常被波形相似度限制：两段曲线形态接近，背后的事件与演化机制却可能完全不同。
              我引入冻结的 Qwen3-0.6B 编码预测时点前的事实文本，将波形、动态和语境证据共同用于邻居选择。
            </p>
            <div className="tag-row">
              <span>Multimodal RAG</span><span>Time Series</span><span>Qwen3-0.6B</span>
            </div>
            <a className="text-link" href="https://github.com/6z6z6z6z/ContextMTS-Retriever" target="_blank" rel="noreferrer">
              查看开源项目 <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="metric-panel" aria-label="ContextMTS-Retriever 核心结果">
            <div className="metric-main">
              <span>MASE ↓</span>
              <strong>0.7328</strong>
              <p>297 个严格时间顺序 query</p>
            </div>
            <div className="metric-compare">
              <span>vs. raw cosine 0.8842</span>
              <strong>−17.1%</strong>
            </div>
            <div className="signal-lines" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
          </div>
        </div>
      </section>

      <section className="focus-section" aria-labelledby="focus-title">
        <div className="focus-heading">
          <p>RESEARCH FOCUS</p>
          <h2 id="focus-title">我关心的不只是模型更大，而是信息如何被表示、检索与使用。</h2>
        </div>
        <div className="focus-grid">
          <article>
            <Search size={22} />
            <span>01</span>
            <h3>可检索表征</h3>
            <p>让时间序列的形态、趋势机制与场景语义进入同一个可比较的表示空间。</p>
          </article>
          <article>
            <Database size={22} />
            <span>02</span>
            <h3>多模态语境</h3>
            <p>把数值、事实文本与任务证据结合起来，判断什么信息在当前查询下真正有用。</p>
          </article>
          <article>
            <BrainCircuit size={22} />
            <span>03</span>
            <h3>可验证智能</h3>
            <p>重视严格评测、消融和失败分析，让智能系统的收益能够被解释和复现。</p>
          </article>
        </div>
      </section>

      <section className="projects-section" aria-labelledby="projects-title">
        <div className="projects-header">
          <p>MORE SELECTED WORK</p>
          <h2 id="projects-title">从分类智能体到个性化语音。</h2>
        </div>
        <div className="project-grid">
          <article className="project-card project-card-dark">
            <div className="project-card-top">
              <span>02 · TIME SERIES AGENT</span>
              <Code2 size={22} />
            </div>
            <h3>TSCAgent</h3>
            <p className="project-subtitle">可复现的多变量时间序列分类智能体</p>
            <p>
              在多种时域与频域距离上检索训练样本，通过训练集内部校准估计各指标可靠性；
              数学集成负责预测，LLM 仅作为可选解释层。
            </p>
            <div className="card-result">
              <div><strong>95.56%</strong><span>Accuracy</span></div>
              <div><strong>0.9555</strong><span>Macro F1</span></div>
            </div>
            <a href="https://github.com/6z6z6z6z/TSCAgent" target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={16} />
            </a>
          </article>

          <article className="project-card project-card-clay">
            <div className="project-card-top">
              <span>03 · SPEECH GENERATION</span>
              <AudioLines size={22} />
            </div>
            <h3>Qwen3-TTS</h3>
            <p className="project-subtitle">个性化语音合成与混合上下文克隆</p>
            <p>
              围绕低资源单说话人场景，对比 Zero-shot、LoRA 与 Full SFT，
              探索参数级个性化和参考上下文协同的混合推理路径。
            </p>
            <div className="card-result single-result">
              <div><strong>+0.3275</strong><span>M3 相比 M2 的匿名主观综合分</span></div>
            </div>
            <a href="https://github.com/6z6z6z6z/qwen3-tts-personalized" target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={16} />
            </a>
          </article>
        </div>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <div className="experience-intro">
          <p>EXPERIENCE</p>
          <h2 id="experience-title">在研究中学习，<br />也在实现中检验想法。</h2>
        </div>
        <div className="timeline">
          <article>
            <time>2025.09 — 2026.07</time>
            <div>
              <h3>科研实习 · AGI 研究组</h3>
              <p>中国科学技术大学认知全重实验室</p>
              <small>导师：刘淇、程明月</small>
              <p className="timeline-detail">个人主导 ContextMTS-Retriever 与 TSCAgent，并参与组内其他研究。</p>
            </div>
          </article>
          <article>
            <time>2025.07</time>
            <div>
              <h3>暑期研究工作坊</h3>
              <p>香港城市大学计算学院</p>
              <p className="timeline-detail">参与 A 股 AI 分析助手的原型设计与实现。</p>
            </div>
          </article>
          <article>
            <time>2025.03 — 2025.07</time>
            <div>
              <h3>科研实践 · “知之道”极客中心</h3>
              <p>中国科学技术大学</p>
              <p className="timeline-detail">探索 DSPy 提示优化与金融 AI Agent。</p>
            </div>
          </article>
        </div>
      </section>

      <section className="profile-section">
        <div className="education-card">
          <GraduationCap size={26} />
          <p>EDUCATION</p>
          <h2>中国科学技术大学</h2>
          <h3>人工智能与数据科学学院 · 数据科学与大数据技术</h3>
          <div className="education-stats">
            <span><strong>2023 — 至今</strong>本科在读</span>
            <span><strong>3.53 / 4.3</strong>GPA</span>
            <span><strong>85.9</strong>加权平均分</span>
          </div>
        </div>
        <div className="profile-notes">
          <div>
            <p>HONORS</p>
            <ul>
              <li>第十六届全国大学生数学竞赛省级一等奖</li>
              <li>2023、2024、2025 年校优秀学生奖学金</li>
            </ul>
          </div>
          <div>
            <p>TOOLBOX</p>
            <div className="skill-cloud">
              {['PyTorch', 'Transformers', 'PEFT', 'scikit-learn', 'Python', 'C/C++', 'SQL', 'Linux', 'Docker', 'Slurm', 'Git', 'LaTeX'].map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p>LET&apos;S CONNECT</p>
          <h2>如果你也在思考表示、检索与智能系统，欢迎交流。</h2>
        </div>
        <div className="contact-actions">
          <a href="mailto:zz6666@mail.ustc.edu.cn"><Mail size={18} /> zz6666@mail.ustc.edu.cn</a>
          <a href="https://github.com/6z6z6z6z" target="_blank" rel="noreferrer"><Code2 size={18} /> github.com/6z6z6z6z</a>
        </div>
      </section>

      <footer>
        <span>© 2026 张荘</span>
        <span>Designed with curiosity · Built for GitHub Pages</span>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </main>
  );
}
