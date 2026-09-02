import Image from 'next/image';
import { ArrowUpRight, Download, Mail, MapPin } from 'lucide-react';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="wordmark" href="#top">Zhuang Zhang</a>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <a className="header-link" href="mailto:zz6666@mail.ustc.edu.cn">
          Get in touch <ArrowUpRight size={14} />
        </a>
      </header>

      <div className="academic-layout">
        <aside className="profile-card" aria-label="Profile">
          <div className="portrait">
            <Image src="/profile.jpg" alt="Zhuang Zhang at Huangshan" fill priority sizes="240px" />
          </div>
          <div>
            <h2>Zhuang Zhang</h2>
            <p className="profile-role">Undergraduate researcher in<br />Artificial Intelligence &amp; Data Science</p>
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
            <p className="section-label">ABOUT</p>
            <h1>I explore how foundation models can understand, connect, and act on complex information.</h1>
            <div className="intro-copy">
              <p>
                I am an undergraduate student at the University of Science and Technology of China (USTC),
                studying Data Science and Big Data Technology. I am interested in foundation models, multimodal
                learning, intelligent agents, and the representations that allow models to work across different data types.
              </p>
              <p>
                My past projects span time-series learning, retrieval-augmented modeling, and personalized speech
                generation. I enjoy turning an early idea into a complete, testable system and learning from both
                successful and unsuccessful experiments.
              </p>
            </div>
            <div className="status-line"><i /> Open to graduate research opportunities</div>
          </section>

          <section className="agenda" aria-labelledby="agenda-title">
            <div className="section-title-row compact-title">
              <div><p className="section-label">INTERESTS</p><h2 id="agenda-title">How I approach AI research</h2></div>
            </div>
            <div className="agenda-grid">
              <article><span>01</span><h3>Represent</h3><p>Learn useful structures from numerical, textual, and multimodal signals.</p></article>
              <article><span>02</span><h3>Reason &amp; act</h3><p>Use foundation models and agents to connect information with concrete tasks.</p></article>
              <article><span>03</span><h3>Evaluate</h3><p>Build reproducible systems whose gains, limitations, and failure modes can be examined.</p></article>
            </div>
          </section>

          <section className="projects-section" id="projects" aria-labelledby="projects-title">
            <div className="section-title-row">
              <div><p className="section-label">PROJECTS</p><h2 id="projects-title">Selected projects</h2></div>
            </div>
            <div className="project-list">
              <article className="project-entry">
                <div className="entry-index">01</div>
                <div>
                  <div className="entry-heading"><h3>Personalized Qwen3-TTS</h3><span>2026</span></div>
                  <p className="entry-subtitle">Low-resource voice adaptation with mixed-context cloning</p>
                  <p>
                    Compared zero-shot inference, LoRA, and full supervised fine-tuning for a single-speaker setting,
                    then explored a hybrid inference path that combines parameter-level adaptation with reference context.
                  </p>
                  <div className="entry-meta"><span><b>+0.3275</b> anonymous subjective score, M3 over M2</span></div>
                  <a href="https://github.com/6z6z6z6z/qwen3-tts-personalized" target="_blank" rel="noreferrer">View repository <ArrowUpRight size={13} /></a>
                </div>
              </article>

              <article className="project-entry">
                <div className="entry-index">02</div>
                <div>
                  <div className="entry-heading"><h3>ContextMTS-Retriever</h3><span>2026</span></div>
                  <p className="entry-subtitle">Context-enhanced retrieval for time-series forecasting</p>
                  <p>
                    Explored whether factual context can complement numerical similarity when retrieving historical
                    cases. The system combines time-series evidence with frozen Qwen3-0.6B text representations.
                  </p>
                  <div className="entry-meta"><span><b>0.7328</b> MASE across 297 chronological queries</span></div>
                  <a href="https://github.com/6z6z6z6z/ContextMTS-Retriever" target="_blank" rel="noreferrer">View repository <ArrowUpRight size={13} /></a>
                </div>
              </article>

              <article className="project-entry">
                <div className="entry-index">03</div>
                <div>
                  <div className="entry-heading"><h3>TSCAgent</h3><span>2025</span></div>
                  <p className="entry-subtitle">A reproducible agent for multivariate time-series classification</p>
                  <p>
                    Retrieves examples under multiple time- and frequency-domain distances, calibrates their reliability
                    on training data, and uses a mathematical ensemble for prediction with an optional explanation layer.
                  </p>
                  <div className="entry-meta"><span><b>95.56%</b> Accuracy</span><span><b>0.9555</b> Macro F1</span></div>
                  <a href="https://github.com/6z6z6z6z/TSCAgent" target="_blank" rel="noreferrer">View repository <ArrowUpRight size={13} /></a>
                </div>
              </article>
            </div>
          </section>

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
                <div><h3>Summer Research Workshop</h3><p>College of Computing, City University of Hong Kong</p><p>Contributed to the design and implementation of a prototype AI assistant for China A-share market analysis.</p></div>
              </article>
              <article>
                <time>Mar 2025 — Jul 2025</time>
                <div><h3>Student Researcher · “Way of Knowing” Geek Center</h3><p>University of Science and Technology of China</p><p>Explored DSPy-based prompt optimization and financial AI agents.</p></div>
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
                <div className="academic-stats"><span><b>3.53 / 4.3</b> GPA</span><span><b>85.9 / 100</b> Weighted average</span></div>
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

          <section className="contact-section">
            <p className="section-label">CONTACT</p>
            <h2>Interested in representation, retrieval, or multimodal AI?</h2>
            <p>I would be glad to discuss research ideas, graduate opportunities, or open-source collaboration.</p>
            <a href="mailto:zz6666@mail.ustc.edu.cn">zz6666@mail.ustc.edu.cn <ArrowUpRight size={15} /></a>
          </section>

          <footer className="page-footer">
            <span>© 2026 Zhuang Zhang</span><a href="#top">Back to top ↑</a>
          </footer>
        </div>
      </div>
    </main>
  );
}
