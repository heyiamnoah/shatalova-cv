import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { content } from "./content";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

function useLanguage() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("cv-lang") === "ru" ? "ru" : "en";
  });

  const switchLang = (next) => {
    setLang(next);
    localStorage.setItem("cv-lang", next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, switchLang];
}

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return active;
}

function AmbientBackground({ reducedMotion, isMobile }) {
  if (isMobile || reducedMotion) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="ambient-blob ambient-blob-static w-[280px] h-[280px] -top-20 right-0" />
        <div className="ambient-blob ambient-blob-static w-[220px] h-[220px] top-[55%] -left-16 opacity-[0.04]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <motion.div
        className="ambient-blob w-[420px] h-[420px] -top-28 right-[8%] opacity-[0.06]"
        animate={{ opacity: [0.05, 0.07, 0.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ambient-blob w-[300px] h-[300px] top-[60%] -left-20 opacity-[0.04]"
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function LanguageToggle({ lang, onChange }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {["en", "ru"].map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-btn ${lang === code ? "lang-btn-active" : ""}`}
          onClick={() => onChange(code)}
          aria-pressed={lang === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function Navigation({ active, nav, lang, onLangChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen && !isDesktop);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen, isDesktop]);

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-8 lg:px-16 py-4 md:py-6">
      <div className="depth-panel mx-auto max-w-7xl rounded-2xl lg:rounded-full px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-3">
        <a href="#about" className="type-nav-brand nav-link shrink-0">
          {nav.brand}
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {nav.items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`nav-link type-nav ${
                  active === item.id
                    ? "nav-link-active"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle lang={lang} onChange={onLangChange} />
          <button
            type="button"
            className="menu-btn hidden max-lg:flex lg:!hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M3 7h16M3 11h16M3 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="depth-panel mx-auto max-w-7xl mt-3 rounded-2xl p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {nav.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={closeMenu}
                    className={`mobile-menu-link ${
                      active === item.id ? "mobile-menu-link-active" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Portrait({ enableParallax, alt }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!enableParallax) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setOffset({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 8,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className="relative w-full flex items-center justify-center order-first lg:order-2"
    >
      <div className="portrait-radial absolute inset-0 rounded-2xl lg:rounded-[2rem] pointer-events-none" />
      <div
        className="portrait-glass-frame relative z-10 w-full rounded-2xl lg:rounded-[2rem] flex items-end justify-center pt-4 px-4 sm:pt-6 sm:px-6 pb-0 min-h-[280px] sm:min-h-[340px] lg:min-h-[420px] overflow-hidden"
        style={
          enableParallax
            ? { transform: `translate(${offset.x * 0.15}px, ${offset.y * 0.15}px)` }
            : undefined
        }
      >
        <img
          src="/portrait.png"
          alt={alt}
          className="portrait-photo max-h-[260px] sm:max-h-[320px] lg:max-h-[400px] w-auto object-contain object-bottom"
          style={
            enableParallax
              ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
              : undefined
          }
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <motion.h2
      variants={fadeUp}
      className="type-section-label mb-6 sm:mb-8 pb-4 border-b border-[var(--border)]"
    >
      {children}
    </motion.h2>
  );
}

function RevealSection({ id, className = "", children }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-6%" }}
      variants={fadeUp}
      className={`relative z-10 section-pad ${className}`}
    >
      {children}
    </motion.section>
  );
}

function Chevron({ open }) {
  return (
    <svg
      className={`module-chevron w-5 h-5 ${open ? "module-chevron-open" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExperienceAccordion({ areas }) {
  const [open, setOpen] = useState(null);

  return (
    <motion.div
      variants={stagger}
      className="accordion-grid grid grid-cols-1 lg:grid-cols-2 gap-3 w-full"
    >
      {areas.map((area, index) => {
        const isOpen = open === index;
        return (
          <motion.div
            key={area.title}
            variants={fadeUp}
            className={`accordion-card glass-card rounded-xl overflow-hidden w-full ${isOpen ? "glass-card-active" : ""}`}
          >
            <button
              type="button"
              className="module-trigger"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="pr-2">{area.title}</span>
              <Chevron open={isOpen} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="px-4 sm:px-5 pb-5 pt-1 space-y-3 border-t border-[var(--border)]">
                    {area.items.map((item) => (
                      <li key={item} className="content-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function ProjectCard({ title, summary, details, isOpen, onToggle, labels, className = "" }) {
  return (
    <motion.article
      variants={fadeUp}
      className={`initiative-card glass-card rounded-2xl p-5 sm:p-6 md:p-7 w-full h-full ${isOpen ? "glass-card-active" : ""} ${className}`}
    >
      <h3 className="type-heading-md leading-snug min-h-[2.6em]">
        {title}
      </h3>
      <p className="mt-3 type-body-sm leading-relaxed flex-1">
        {summary}
      </p>
      <button
        type="button"
        className="detail-btn initiative-detail-btn"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {isOpen ? labels.hideDetails : labels.viewDetails}
        <span aria-hidden="true">→</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3">
              {details.map((paragraph) => (
                <p
                  key={paragraph}
                  className="type-body-sm leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function InitiativesGrid({ items, labels }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-4%" }}
      className="initiative-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {items.map((item, index) => (
        <ProjectCard
          key={item.title}
          {...item}
          labels={labels}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((prev) => (prev === index ? null : index))}
        />
      ))}
    </motion.div>
  );
}

function CapabilityCard({ title, countLabel, skills, isOpen, onToggle }) {
  return (
    <motion.article
      variants={fadeUp}
      className={`accordion-card glass-card capability-card rounded-2xl w-full ${isOpen ? "glass-card-active" : ""}`}
    >
      <button
        type="button"
        className="capability-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div>
          <p className="capability-count">{countLabel}</p>
          <h3 className="capability-title">{title}</h3>
        </div>
        <Chevron open={isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function ToolkitGrid({ categories }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-4%" }}
      className="accordion-grid grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {categories.map((category, index) => (
        <CapabilityCard
          key={category.title}
          {...category}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((prev) => (prev === index ? null : index))}
        />
      ))}
    </motion.div>
  );
}

function InfoCard({ label, children }) {
  return (
    <motion.article
      variants={fadeUp}
      className="info-card glass-card rounded-2xl p-5 sm:p-6 w-full h-full"
    >
      <p className="type-card-label mb-3">
        {label}
      </p>
      <div className="compact-stat space-y-1.5">{children}</div>
    </motion.article>
  );
}

function HeroContacts({ hero }) {
  return (
    <div className="mt-6 sm:mt-8 space-y-2">
      {hero.telegram && (
        <p className="contact-line">
          <span className="contact-label">{hero.telegramLabel}</span>{" "}
          <a
            href={hero.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-link"
          >
            {hero.telegram}
          </a>
        </p>
      )}
      <p className="contact-line">
        <span className="contact-label">{hero.emailLabel}</span>{" "}
        <a href="mailto:n.shatalova@icloud.com" className="accent-link">
          n.shatalova@icloud.com
        </a>
        <span className="contact-sep"> | </span>
        <a href="mailto:noah.shatalova@gmail.com" className="accent-link">
          noah.shatalova@gmail.com
        </a>
      </p>
      <p className="contact-line">
        <span className="contact-label">{hero.phoneLabel}</span>{" "}
        <a href={hero.phoneHref} className="accent-link">
          {hero.phone}
        </a>
      </p>
    </div>
  );
}

function App() {
  const [lang, setLang] = useLanguage();
  const t = content[lang];
  const active = useActiveSection(t.nav.items.map((n) => n.id));
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <main className="grain min-h-screen text-[var(--ink)] relative overflow-x-hidden">
      <AmbientBackground reducedMotion={reducedMotion} isMobile={isMobile} />

      <Navigation
        active={active}
        nav={t.nav}
        lang={lang}
        onLangChange={setLang}
      />

      <section
        id="about"
        className="relative z-10 min-h-0 lg:min-h-screen section-pad pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 max-w-7xl mx-auto"
      >
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-8 sm:gap-12 lg:gap-16 lg:items-center"
        >
          <Portrait
            enableParallax={canHover && !reducedMotion}
            alt={t.hero.name}
          />

          <div className="order-2 lg:order-1">
            <h1 className="type-display">
              {t.hero.name}
            </h1>
            <p className="mt-4 type-hero-subtitle">
              {t.hero.role}
            </p>
            <p className="mt-3 type-eyebrow">
              {t.hero.location}
            </p>
            <HeroContacts hero={t.hero} />
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-20 max-w-2xl"
        >
          <SectionLabel>{t.about.label}</SectionLabel>
          {t.about.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="type-body leading-relaxed mt-3 first:mt-0"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
      </section>

      <RevealSection
        id="experience"
        className="py-20 sm:py-24 lg:py-28 max-w-7xl mx-auto"
      >
        <SectionLabel>{t.experience.label}</SectionLabel>

        <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
          <h3 className="type-heading-lg">
            {t.experience.company}
          </h3>
          <p className="mt-1.5 type-body">
            {t.experience.role}
          </p>
          <p className="type-meta mt-0.5">
            {t.experience.period}
          </p>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="type-body leading-relaxed mb-8 sm:mb-10"
        >
          {t.experience.intro}
        </motion.p>

        {t.experience.areasHeading && (
          <motion.p variants={fadeUp} className="type-subsection-label mb-4">
            {t.experience.areasHeading}
          </motion.p>
        )}

        <ExperienceAccordion areas={t.experience.areas} />

        {t.experience.categories && (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-6 sm:mt-8 type-body-sm"
          >
            <span className="type-ink">{t.experience.categoriesLabel} </span>
            {t.experience.categories}
          </motion.p>
        )}
      </RevealSection>

      <RevealSection
        id="initiatives"
        className="py-20 sm:py-24 lg:py-28 max-w-7xl mx-auto"
      >
        <SectionLabel>{t.initiatives.label}</SectionLabel>
        <InitiativesGrid
          items={t.initiatives.items}
          labels={{
            viewDetails: t.initiatives.viewDetails,
            hideDetails: t.initiatives.hideDetails,
          }}
        />
      </RevealSection>

      <RevealSection
        id="toolkit"
        className="py-20 sm:py-24 lg:py-28 max-w-7xl mx-auto"
      >
        <SectionLabel>{t.toolkit.label}</SectionLabel>
        <ToolkitGrid categories={t.toolkit.categories} />
      </RevealSection>

      <RevealSection
        id="background"
        className="py-20 sm:py-24 lg:py-28 pb-28 sm:pb-36 lg:pb-40 max-w-7xl mx-auto"
      >
        <SectionLabel>{t.background.label}</SectionLabel>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-4%" }}
          className="info-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
        >
          <InfoCard label={t.background.education.label}>
            <p>{t.background.education.university}</p>
            <p>{t.background.education.degree}</p>
            <p>{t.background.education.period}</p>
            <p>{t.background.education.gpa}</p>
          </InfoCard>

          <InfoCard label={t.background.languages.label}>
            {t.background.languages.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </InfoCard>

          <InfoCard label={t.background.competitions.label}>
            {t.background.competitions.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </InfoCard>

          <InfoCard label={t.background.interests.label}>
            {t.background.interests.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </InfoCard>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-4%" }}
          className="info-card-grid grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {t.background.previous.map((item) => (
            <InfoCard key={item.label} label={item.label}>
              <p>{item.text}</p>
            </InfoCard>
          ))}
        </motion.div>
      </RevealSection>
    </main>
  );
}

export default App;
