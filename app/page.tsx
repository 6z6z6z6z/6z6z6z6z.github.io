import Image from 'next/image';
import { ArrowUpRight, Download, Mail, MapPin } from './components/icons';
import { SiteNavigation } from './components/site-navigation';
import { Playground } from './components/playground';
import { ProjectVisual } from './components/project-visual';

export default function Home() {
  return (
    <main id="top">
      <a className="skip-link" href="#about">Skip to content</a>
      <SiteNavigation />

      <div className="academic-layout">
        <aside className="profile-card" aria-label="Profile">
          <a className="portrait" href="/profile.jpg" target="_blank" rel="noreferrer" aria-label="View full photograph at Huangshan">
            <Image src="/profile.jpg" alt="Zhuang Zhang at Huangshan" fill priority sizes="240px" />
          </a>
          <span className="photo-caption">A moment in Huangshan ↗</span>
          <div>
            <h2>Zhuang Zhang</h2>
            <p className="profile-role">Senior undergraduate student in<br />Artificial Intelligence &amp; Data Science</p>
          </div>
          <p className="profile-location"><MapPin size={14} /> Hefei, China</p>
          <div className="profile-links">
            <a href="/resume-zhang-zhuang.pdf" target="_blank" rel="noreferrer"><Download size={14} /> Curriculum Vitae</a>
            <a href="https://github.com/6z6z6z6z" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a>
            <a href="mailto:zz6666@mail.ustc.edu.cn"><Mail size={14} /> Email</a>
          </div>
          <div className="profile-topics">
            <span>Research interests</span>
            <p>Foundation Models</p>
            <p>Multimodal Learning</p>
            <p>AI Agents</p>
            <p>Reliable Machine Learning</p>
          </div>
        </aside>

        <div className="content-column">
          <section className="intro" id="about">
            <p className="section-label">Artificial intelligence · Data science</p>
            <p className="intro-greeting">Hello, I’m</p>
            <h1>Zhuang Zhang<span className="name-period">.</span></h1>
            <p className="hero-statement">Curious about intelligence.<br />Happy building things.</p>
            <div className="intro-copy">
              <p>
                I’m a senior undergraduate at the University of Science and Technology of China,
                studying Data Science and Big Data Technology. I explore AI through models,
                experiments, and things I build.
              </p>
              <p>
                My projects span multimodal learning, retrieval, agents, and personalized speech.
                I like turning a question into something I can test, and learning from what happens next.
              </p>
            </div>
            <div className="intro-actions"><a className="primary-action" href="mailto:zz6666@mail.ustc.edu.cn">Get in touch <ArrowUpRight size={18} /></a><span className="status-line"><i /> Open to graduate research opportunities</span></div>
          </section>

          <section className="projects-section" id="projects" aria-labelledby="projects-title">
            <div className="section-title-row">
              <div><p className="section-label">PROJECTS</p><h2 id="projects-title">Questions into experiments.</h2></div><span className="section-count">01 — 03</span>
            </div>
            <div className="project-list">
              <article className="project-entry">
                <ProjectVisual kind="voice" />
                <div>
                  <div className="entry-heading"><h3>Personalized Qwen3-TTS</h3><span>2026</span></div>
                  <p className="entry-subtitle">Voice adaptation with limited data and mixed context</p>
                  <p>
                    Compared zero shot inference, LoRA, and full supervised fine tuning for a single speaker setting,
                    then explored a hybrid inference path that combines parameter level adaptation with reference context.
                  </p>
                  <div className="entry-meta"><span>Speech synthesis</span><span>Model adaptation</span></div>
                  <a href="https://github.com/6z6z6z6z/qwen3-tts-personalized" target="_blank" rel="noreferrer">View repository <ArrowUpRight size={13} /></a>
                </div>
              </article>

              <article className="project-entry">
                <ProjectVisual kind="retrieval" />
                <div>
                  <div className="entry-heading"><h3>ContextMTS-Retriever</h3><span>2026</span></div>
                  <p className="entry-subtitle">Context enhanced retrieval for time series forecasting</p>
                  <p>
                    Explored whether factual context can complement numerical similarity when retrieving historical
                    cases. The system combines time series evidence with frozen Qwen3-0.6B text representations.
                  </p>
                  <div className="entry-meta"><span>Multimodal retrieval</span><span>Time series</span></div>
                  <a href="https://github.com/6z6z6z6z/ContextMTS-Retriever" target="_blank" rel="noreferrer">View repository <ArrowUpRight size={13} /></a>
                </div>
              </article>

              <article className="project-entry">
                <ProjectVisual kind="classification" />
                <div>
                  <div className="entry-heading"><h3>TSCAgent</h3><span>2025</span></div>
                  <p className="entry-subtitle">A reproducible agent for multivariate time series classification</p>
                  <p>
                    Retrieves examples under multiple time and frequency domain distances, calibrates their reliability
                    on training data, and uses a mathematical ensemble for prediction with an optional explanation layer.
                  </p>
                  <div className="entry-meta"><span>Classification</span><span>Evidence aggregation</span></div>
                  <a href="https://github.com/6z6z6z6z/TSCAgent" target="_blank" rel="noreferrer">View repository <ArrowUpRight size={13} /></a>
                </div>
              </article>
            </div>
          </section>

          <section className="tagline" aria-label="Research approach"><p className="section-label">A way of thinking</p><h2>{'Ask a better question.'.split(' ').map((word, i) => <span key={word} style={{ '--word': i } as React.CSSProperties}>{word}&nbsp;</span>)}<br />{'Build. Test. Understand.'.split(' ').map((word, i) => <span key={word} style={{ '--word': i + 4 } as React.CSSProperties}>{word}&nbsp;</span>)}</h2><p>From multimodal context to a personal voice, I explore what models can learn and how we can trust them.</p></section>

          <section className="experience-section" id="experience" aria-labelledby="experience-title">
            <div className="section-title-row">
              <div><p className="section-label">EXPERIENCE</p><h2 id="experience-title">Research experience</h2></div>
            </div>
            <div className="timeline">
              <article>
                <time>Sep 2025 — Jul 2026</time>
                <div><h3>Undergraduate Research Intern · AGI Group</h3><p>USTC Cognitive Intelligence Laboratory</p><small>Advised by Qi Liu and Mingyue Cheng</small><p>Initiated and led ContextMTS-Retriever and TSCAgent while contributing to additional group projects.</p></div>
              </article>
              <article>
                <time>Jul 2025</time>
                <div><h3>Summer Research Workshop</h3><p>College of Computing, City University of Hong Kong</p><p>Contributed to the design and implementation of a prototype AI assistant for China A share market analysis.</p></div>
              </article>
              <article>
                <time>Mar 2025 — Jul 2025</time>
                <div><h3>Research Practice · “Way of Knowing” Geek Center</h3><p>University of Science and Technology of China</p><p>Explored DSPy based prompt optimization and financial AI agents.</p></div>
              </article>
            </div>
          </section>

          <section className="education-section" id="education" aria-labelledby="education-title">
            <div className="section-title-row">
              <div><p className="section-label">EDUCATION</p><h2 id="education-title">Education &amp; honors</h2></div>
            </div>
            <div className="education-grid">
              <div className="education-main">
                <span>2023 — Present</span>
                <h3>University of Science and Technology of China</h3>
                <p>B.Eng. candidate in Data Science and Big Data Technology<br />School of Artificial Intelligence and Data Science</p>
              </div>
              <div className="honors-list">
                <p className="mini-label">SELECTED HONORS</p>
                <ul>
                  <li><span>Provincial First Prize</span><small>16th National College Student Mathematics Competition</small></li>
                  <li><span>Outstanding Student Scholarship</span><small>USTC · 2023, 2024, 2025</small></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="toolbox-section" aria-labelledby="toolbox-title">
            <div><p className="section-label">TOOLBOX</p><h2 id="toolbox-title">Methods &amp; tools</h2></div>
            <div className="toolbox-list">
              {['PyTorch', 'Transformers', 'PEFT', 'scikit-learn', 'Python', 'C/C++', 'SQL', 'Linux', 'Docker', 'Slurm', 'Git', 'LaTeX'].map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </section>

          <section className="contact-section" id="contact">
            <p className="section-label">CONTACT</p>
            <h2>Good ideas start<br />with a conversation.</h2>
            <p>I would be glad to discuss research ideas, graduate opportunities, or open source collaboration.</p>
            <a href="mailto:zz6666@mail.ustc.edu.cn">zz6666@mail.ustc.edu.cn <ArrowUpRight size={15} /></a>
          </section>

          <Playground />

          <footer className="page-footer">
            <span>© 2026 Zhuang Zhang · Built with curiosity</span><a href="#top">Back to top ↑</a>
          </footer>
        </div>
      </div>
    </main>
  );
}
