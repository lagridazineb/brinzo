import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import Logo from "../components/Logo";
import { LEGAL_DOCS, LEGAL_NAV_ORDER, EFFECTIVE_DATE, CONTACT_EMAIL } from "../data/legalContent";
import "./Legal.css";

function Block({ block }) {
  if (block.type === "p") return <p className="legal-p">{block.text}</p>;
  if (block.type === "note") return <p className="legal-note">{block.text}</p>;
  if (block.type === "list") {
    return (
      <ul className="legal-list">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function Legal() {
  const { slug } = useParams();
  const doc = LEGAL_DOCS[slug];
  const [activeSection, setActiveSection] = useState(doc?.sections?.[0]?.id);

  useEffect(() => {
    if (!doc) return;
    window.scrollTo({ top: 0 });
    setActiveSection(doc.sections[0]?.id);
  }, [doc]);

  useEffect(() => {
    if (!doc) return;
    const headings = doc.sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [doc]);

  if (!doc) {
    return <Navigate to="/legal/terms" replace />;
  }

  return (
    <PageShell>
      <div className="legal-page">
        <header className="legal-topbar">
          <Logo size="md" />
          <Link to="/" className="legal-topbar__back">← Back to BRINZO</Link>
        </header>

        <div className="legal-layout">
          {/* Sticky in-page nav of this doc's own sections */}
          <aside className="legal-sidenav" aria-label="Section navigation">
            <p className="legal-sidenav__title">On this page</p>
            <nav>
              <ul className="legal-sidenav__list">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`legal-sidenav__link ${activeSection === s.id ? "legal-sidenav__link--active" : ""}`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="legal-sidenav__title legal-sidenav__title--secondary">Other policies</p>
            <nav>
              <ul className="legal-sidenav__list legal-sidenav__list--secondary">
                {LEGAL_NAV_ORDER.filter((s) => s !== slug).map((s) => (
                  <li key={s}>
                    <Link to={`/legal/${s}`} className="legal-sidenav__cross-link">
                      {LEGAL_DOCS[s].shortLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main document */}
          <main className="legal-content">
            <p className="legal-eyebrow mono">LEGAL</p>
            <h1 className="legal-title">{doc.label}</h1>
            <p className="legal-summary">{doc.summary}</p>
            <p className="legal-effective-date">Effective Date: {EFFECTIVE_DATE}</p>

            {doc.intro && <p className="legal-intro">{doc.intro}</p>}

            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="legal-section">
                <h2 className="legal-section__title">{section.title}</h2>
                {section.body.map((block, i) => (
                  <Block block={block} key={i} />
                ))}
              </section>
            ))}

            {doc.closingNote && <p className="legal-closing-note">{doc.closingNote}</p>}

            <div className="legal-contact-card">
              <h3 className="legal-contact-card__title">Contact Us</h3>
              <p className="legal-contact-card__text">
                Questions about this {doc.shortLabel.toLowerCase()}? Reach BRINZO directly.
              </p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="legal-contact-card__email">
                📧 {CONTACT_EMAIL}
              </a>
            </div>

            <div className="legal-doc-links">
              {LEGAL_NAV_ORDER.filter((s) => s !== slug).map((s) => (
                <Link to={`/legal/${s}`} key={s} className="legal-doc-link">
                  {LEGAL_DOCS[s].label} →
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}
