import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { moreAboutMe, profile, projects, publications } from "./content.js";

const tabs = [
  { id: "home", label: "Academic Home" },
  { id: "portfolio", label: "Design Portfolio" },
];

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
let hasPlayedEntryStickerBurst = false;

class StickerParticle {
  constructor(width, images) {
    this.x = Math.random() * width;
    this.y = Math.random() * -420 - 80;
    this.vx = (Math.random() - 0.5) * 1.4;
    this.vy = Math.random() * 1.3 + 0.65;
    this.size = Math.random() * 38 + 44;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 3.2;
    this.image = images[Math.floor(Math.random() * images.length)];
    this.gravity = 0.034;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    context.restore();
  }
}

function StickerRain({ disabled }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const particlesRef = useRef([]);
  const animationRef = useRef(0);

  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0 || disabled) return;
    const particles = Array.from(
      { length: 72 },
      () => new StickerParticle(canvas.width, imagesRef.current),
    );
    particlesRef.current.push(...particles);
  }, [disabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const urls = Array.from({ length: 6 }, (_, index) => assetUrl(`stickers/sticker${index + 1}.png`));
    Promise.all(urls.map((url) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = url;
    }))).then((images) => {
      if (cancelled) return;
      imagesRef.current = images;
      if (!hasPlayedEntryStickerBurst) {
        hasPlayedEntryStickerBurst = true;
        spawnParticles();
      }
    });
    return () => { cancelled = true; };
  }, [spawnParticles]);

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.update();
        particle.draw(context);
        if (particle.y > canvas.height + 100) particles.splice(index, 1);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return <canvas className="sticker-canvas" ref={canvasRef} aria-hidden="true" />;
}

function AuthorLine({ children }) {
  const parts = children.split("Lingyu Peng");
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 && <strong>Lingyu Peng</strong>}
          {part}
        </span>
      ))}
    </>
  );
}

function LinkedBio({ children }) {
  const names = profile.advisors.map((advisor) => advisor.name);
  const highlights = [
    "human-computer interaction (HCI) and design",
    "how generative AI can enable people to engage with cultural materials through creation, interpretation, learning, and reflection",
    "how users navigate AI-supported creative and design processes and what forms of support they need",
  ];
  const tokens = [...names, ...highlights];
  const escapedTokens = tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escapedTokens.join("|")})`, "g");

  return children.split(pattern).map((part) => {
    const advisor = profile.advisors.find((item) => item.name === part);
    if (advisor) {
      return <a href={advisor.href} target="_blank" rel="noreferrer" key={part}>{part}</a>;
    }
    if (highlights.includes(part)) {
      return <strong className="bio-highlight" key={part}>{part}</strong>;
    }
    return part;
  });
}

function ProfileIcon({ type }) {
  if (type === "Google Scholar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.8 1.5 8.4 12 14l8.1-4.3v5.4H22V8.4L12 2.8Z" />
        <path d="M5 12.2v4.9c1.7 2 4.1 3 7 3s5.3-1 7-3v-4.9L12 16l-7-3.8Z" />
      </svg>
    );
  }

  if (type === "GitHub") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 .8C5.8.8.8 5.8.8 12c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.5v-2.1c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3.1 1.1a10.7 10.7 0 0 1 5.6 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2v3.2c0 .3.2.7.8.5A11.2 11.2 0 0 0 23.2 12C23.2 5.8 18.2.8 12 .8Z" />
      </svg>
    );
  }

  if (type === "CV") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 2h8l4 4v16H6V2Zm8 1.8V7h3.2L14 3.8ZM9 11v1.5h6V11H9Zm0 3.5V16h6v-1.5H9Zm0 3.5v1.5h4V18H9Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3a2 2 0 0 0-2 2v1H4a3 3 0 0 0-3 3v3.2c3.3 1.3 7 2 11 2s7.7-.7 11-2V9a3 3 0 0 0-3-3h-3V5a2 2 0 0 0-2-2H9Zm0 3V5h6v1H9Z" />
      <path d="M1 14.3V19a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-4.7c-2.9 1-6.1 1.6-9.5 1.8V18h-3v-1.9C7.1 15.9 3.9 15.3 1 14.3Z" />
    </svg>
  );
}

function PublicationTeaser({ publication, large = false }) {
  if (publication.teaser) {
    return (
      <div className={`publication-teaser${large ? " large" : ""}`}>
        <img src={assetUrl(publication.teaser)} alt={`${publication.title} teaser`} />
      </div>
    );
  }

  return (
    <div
      className={`publication-teaser publication-cover${large ? " large" : ""}`}
      data-tone={publication.teaserTone}
      aria-label={`${publication.title} typographic teaser`}
    >
      <span>{publication.id}</span>
      <strong>{publication.teaserLabel}</strong>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="portrait-stack">
        <img className="portrait portrait-photo" src={assetUrl(profile.portrait)} alt={`${profile.name} portrait`} />
        <img className="portrait portrait-drawing" src={assetUrl(profile.drawnPortrait)} alt="A hand-drawn portrait by Lingyu Peng" />
      </div>

      <div className="identity">
        <div className="name-lockup">
          <h1>{profile.name}</h1>
          <p className="name-cn">{profile.chineseName}</p>
        </div>
        <div className="affiliation">
          <p>{profile.school}</p>
          <p>{profile.university}</p>
        </div>
      </div>

      <dl className="profile-meta">
        <div>
          <dt><span aria-hidden="true">📍</span> Location</dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt><span aria-hidden="true">✉️</span> Email</dt>
          <dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd>
        </div>
      </dl>

      <nav className="contact-links" aria-label="Academic and professional profiles">
        {profile.links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            <span className="contact-link-label">
              <ProfileIcon type={link.label} />
              {link.label}
            </span>
            <span className="external-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
        <span className="contact-link-placeholder" title="CV PDF will be added later">
          <span className="contact-link-label">
            <ProfileIcon type="CV" />
            CV
          </span>
          <span className="external-arrow" aria-hidden="true">↗</span>
        </span>
      </nav>
    </aside>
  );
}

function PublicationEntry({ publication, onOpenPortfolio, onOpenDetails }) {
  return (
    <article className="publication">
      <div className="publication-visual">
        <PublicationTeaser publication={publication} />
        <div className="publication-index">
          <span>{publication.id}</span>
          <time>{publication.displayDate || publication.year}</time>
        </div>
      </div>
      <div className="publication-copy">
        {publication.titleZh && <p className="publication-title-zh">{publication.titleZh}</p>}
        <h3>
          <button type="button" onClick={() => onOpenDetails(publication.id)}>
            {publication.title}
          </button>
        </h3>
        <p className="authors"><AuthorLine>{publication.authors}</AuthorLine></p>
        <p className="venue">{publication.venue}</p>
        <ul className="keyword-list" aria-label="Keywords">
          {publication.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
        </ul>
        {publication.links.length > 0 && (
          <div className="publication-links">
            {publication.links.map((link) => (
              <a href={link.href} target="_blank" rel="noreferrer" key={link.label}>{link.label}</a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function AcademicHome({ onOpenPortfolio, onOpenDetails }) {
  const [showMore, setShowMore] = useState(false);
  const publicationGroups = ["Research Papers", "Art Papers"].map((category) => ({
    category,
    items: publications
      .filter((publication) => publication.category === category)
      .sort((a, b) => b.date.localeCompare(a.date)),
  }));

  return (
    <div className="academic-home">
      <section className="intro-section" aria-labelledby="intro-title">
        <h2 id="intro-title">Hi, I'm Yu. <span className="intro-avatar" role="img" aria-label="Boy">👦🏻</span></h2>
        <div className="intro-copy">
          {profile.bio.map((paragraph) => <p key={paragraph}><LinkedBio>{paragraph}</LinkedBio></p>)}
        </div>
        <button
          className="more-about-toggle"
          type="button"
          aria-expanded={showMore}
          aria-controls="more-about-content"
          onClick={() => setShowMore((current) => !current)}
        >
          {showMore ? "Less about me" : "More about me"}
          <span aria-hidden="true">{showMore ? "↑" : "↓"}</span>
        </button>
        <AnimatePresence initial={false}>
          {showMore && (
            <motion.div
              id="more-about-content"
              className="more-about-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                {moreAboutMe.map((paragraph, index) => (
                  <p className={index === 1 ? "name-quote" : ""} key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="publications-section" aria-labelledby="selected-publications-title">
        <div className="section-heading">
          <h2 id="selected-publications-title">Publications</h2>
        </div>
        {publicationGroups.map((group) => (
          <section className="home-publication-group" key={group.category}>
            <h3>{group.category}</h3>
            <div className="publication-list">
              {group.items.map((publication) => (
                <PublicationEntry
                  publication={publication}
                  onOpenPortfolio={onOpenPortfolio}
                  onOpenDetails={onOpenDetails}
                  key={publication.id}
                />
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}

function PublicationDetail({ publication, onBack, onOpenPortfolio }) {
  return (
    <article className="publication-detail">
      <button className="back-button" type="button" onClick={onBack}>← Back to academic home</button>
      <PublicationTeaser publication={publication} large />
      <header className="detail-heading">
        <p className="detail-kicker">{publication.category} · {publication.displayDate || publication.year}</p>
        {publication.titleZh && <p className="detail-title-zh">{publication.titleZh}</p>}
        <h2>{publication.title}</h2>
        <p className="authors"><AuthorLine>{publication.authors}</AuthorLine></p>
        <p className="venue">{publication.venue}</p>
      </header>

      <section className="abstract-section" aria-labelledby="abstract-title">
        <h3 id="abstract-title">Abstract</h3>
        <p>{publication.abstract}</p>
      </section>

      <section className="detail-keywords" aria-labelledby="keywords-title">
        <h3 id="keywords-title">Keywords</h3>
        <ul className="keyword-list">
          {publication.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
        </ul>
      </section>

      {publication.links.length > 0 && (
        <div className="detail-actions">
          {publication.links.map((link) => (
            <a href={link.href} target="_blank" rel="noreferrer" key={link.label}>{link.label} ↗</a>
          ))}
        </div>
      )}
    </article>
  );
}

function PortfolioPage() {
  const chronologicalProjects = [...projects].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="portfolio-page" aria-labelledby="portfolio-title">
      <header className="page-heading">
        <h2 id="portfolio-title">Design Portfolio</h2>
      </header>

      <div className="project-grid">
        {chronologicalProjects.map((project) => (
          <a className="project" href={project.link} target="_blank" rel="noreferrer" key={project.id}>
            <img src={assetUrl(project.image)} alt={`${project.title} project preview`} />
            <div className="project-copy">
              <time>{project.displayDate || project.year}</time>
              <h3>{project.title}</h3>
              <p className="project-subtitle">{project.subtitle}</p>
              <p className="project-type">{project.type}</p>
              <p className="project-description">{project.description}</p>
              <span className="project-open">View project ↗</span>
            </div>
          </a>
        ))}
      </div>

      <a className="portfolio-link" href={profile.links[2].href} target="_blank" rel="noreferrer">
        Open the full design portfolio ↗
      </a>
    </section>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activePaper, setActivePaper] = useState(null);
  const reduceMotion = useReducedMotion();

  const openTab = (tab) => {
    setActivePaper(null);
    setActiveTab(tab);
  };

  const openPaper = (paperId) => setActivePaper(paperId);
  const openPortfolio = () => openTab("portfolio");

  const pages = {
    home: (
      <AcademicHome
        onOpenPortfolio={openPortfolio}
        onOpenDetails={openPaper}
      />
    ),
    portfolio: <PortfolioPage />,
  };

  const selectedPaper = publications.find((publication) => publication.id === activePaper);
  const currentPage = selectedPaper ? (
    <PublicationDetail
      publication={selectedPaper}
      onBack={() => setActivePaper(null)}
      onOpenPortfolio={openPortfolio}
    />
  ) : pages[activeTab];

  return (
    <div className="site-frame">
      <StickerRain disabled={reduceMotion} />
      <header className="masthead">
        <div className="masthead-inner">
          <button className="site-name" type="button" onClick={() => openTab("home")}>
            Yu
          </button>
          <nav className="tab-nav" aria-label="Primary navigation">
            <div role="tablist" aria-label="Website sections">
              {tabs.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="main-panel"
                    className={selected ? "active" : ""}
                    onClick={() => openTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <div className="site-shell">
        <Sidebar />
        <main className="main-column">
          <div id="main-panel" className="content-panel" role="tabpanel">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activePaper || activeTab}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {currentPage}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer>
            <p>© 2026 Lingyu Peng</p>
            <p>Last updated September 2026</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
