import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import './AboutPage.css'

const SOURCES = [
  { name: 'PACER (Public Access to Court Electronic Records)', url: 'https://pacer.uscourts.gov', note: 'Primary source for all federal court filings, docket entries, and orders.' },
  { name: 'U.S. Courts — Opinions and Orders', url: 'https://www.uscourts.gov', note: 'Official federal court website with links to opinions and procedural information.' },
  { name: 'The Associated Press', url: 'https://apnews.com', note: 'Reporting on major rulings, filings, and administration actions.' },
  { name: 'Reuters Legal', url: 'https://www.reuters.com/legal', note: 'Legal news desk covering federal court proceedings and regulatory actions.' },
  { name: 'NPR Law', url: 'https://www.npr.org/sections/law', note: 'In-depth reporting on constitutional challenges and Supreme Court cases.' },
  { name: 'The Washington Post', url: 'https://www.washingtonpost.com', note: 'Breaking news on administration actions and court responses.' },
  { name: 'SCOTUSblog', url: 'https://www.scotusblog.com', note: 'Authoritative source for Supreme Court case tracking and analysis.' },
  { name: 'Law360', url: 'https://www.law360.com', note: 'Specialized legal news coverage of federal litigation.' },
]

function Section({ title, children }) {
  return (
    <section className="about-section">
      <h2 className="about-section-title">{title}</h2>
      <div className="about-section-body">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <div className="bg-gradient" />
      <NavBar />

      <div className="issue-back-row">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
      </div>

      <header className="about-header">
        <h1 className="about-title">About &amp; Methodology</h1>
        <p className="about-sub">
          How this tracker works, how we select and categorize cases, and where our data comes from.
        </p>
      </header>

      <div className="about-body">

        <Section title="About This Project">
          <p>
            The Legal Challenges Tracker is a project of the{' '}
            <strong>Kellogg Institute for International Studies</strong> at the University of Notre Dame.
            It documents major federal lawsuits filed in response to executive orders, agency actions,
            and policy directives issued by the second Trump administration since January 20, 2025.
          </p>
          <p>
            Our goal is to provide an accurate, nonpartisan resource for researchers, journalists,
            educators, and members of the public seeking to understand the legal landscape surrounding
            current federal policy. We do not advocate for any outcome in any case. We present the
            legal record as it exists.
          </p>
          <div className="about-affil">
            <div className="about-affil-logo">ND</div>
            <div>
              <div className="about-affil-name">Notre Dame Kellogg Institute</div>
              <div className="about-affil-sub">University of Notre Dame · Notre Dame, Indiana</div>
            </div>
          </div>
        </Section>

        <Section title="Case Selection">
          <p>We track cases that meet <strong>at least one</strong> of the following criteria:</p>
          <ul className="about-list">
            <li>Filed in or transferred to a federal district court, circuit court, or the U.S. Supreme Court</li>
            <li>Challenging an executive order, agency action, regulatory rule, or policy directive signed or enforced since January 20, 2025</li>
            <li>Determined by our research team to have significant constitutional, statutory, or public interest implications</li>
          </ul>
          <p>
            We do not track every administrative law dispute, routine enforcement action, or private
            litigation. Our focus is on cases where the central legal question bears on the scope of
            executive power or the rights of individuals and institutions affected by federal policy.
          </p>
          <p>
            Cases are added within 48–72 hours of filing when possible. In high-volume periods, the
            database may lag real-time developments by several days.
          </p>
        </Section>

        <Section title="Case Status Definitions">
          <div className="status-defs">
            <div className="status-def-row">
              <span className="status-def-badge badge-active">Active</span>
              <p>The case is in active litigation with no final judgment. Includes cases at any court level where proceedings are ongoing.</p>
            </div>
            <div className="status-def-row">
              <span className="status-def-badge badge-injunction">Injunction</span>
              <p>A court has issued a preliminary injunction or TRO that halts the challenged policy while the case proceeds. The underlying case remains active.</p>
            </div>
            <div className="status-def-row">
              <span className="status-def-badge badge-closed-for">Closed — For</span>
              <p>The case has concluded with a final judgment in favor of the administration — the challenged policy stands.</p>
            </div>
            <div className="status-def-row">
              <span className="status-def-badge badge-closed-against">Closed — Against</span>
              <p>The case has concluded with a final judgment against the administration — the challenged policy was struck down or modified.</p>
            </div>
          </div>
        </Section>

        <Section title="Timeline Methodology">
          <p>
            Each case timeline begins with the administration action that gave rise to the lawsuit
            (an executive order signing, agency directive, or policy implementation) and proceeds
            through all significant court events: filings, hearings, TROs, injunctions, rulings,
            and appeals.
          </p>
          <p>
            All timeline events are sourced from:
          </p>
          <ul className="about-list">
            <li>Federal court docket entries (via PACER)</li>
            <li>Published court orders and opinions</li>
            <li>Official government press releases and agency guidance documents</li>
            <li>Verified reporting from major news organizations</li>
          </ul>
          <p>
            Where an event is based on news reporting rather than a primary court document, it is
            reviewed against multiple independent sources before inclusion.
          </p>
        </Section>

        <Section title="Executive Actions Spotlight">
          <p>
            The "Before the Courts Intervened" feature documents actions the administration took
            before any court had an opportunity to rule — often creating facts on the ground that
            courts cannot fully reverse even when they ultimately rule against the policy.
          </p>
          <p>
            Entries in this section describe factual events (a system being shut down, workers being
            terminated, data being accessed) that are documented in court filings, government records,
            or verified news reporting. We do not characterize these events as "illegal" — that
            determination is for courts to make. We describe what happened and what courts subsequently ruled.
          </p>
          <p>
            Source links in this section point to search results pages on major news organization
            websites. Where possible, researchers should verify events against primary court records.
          </p>
        </Section>

        <Section title="Judicial Appointee Visualization">
          <p>
            The judicial visualization on the home page represents rulings in the tracked cases,
            colored by the party of the president who appointed the ruling judge. Appointments are
            classified as:
          </p>
          <ul className="about-list">
            <li><strong>Democratic (blue):</strong> Appointed by President Clinton, Obama, or Biden</li>
            <li><strong>Republican (red):</strong> Appointed by President Reagan, Bush (41), Bush (43), or Trump</li>
          </ul>
          <p>
            This visualization is provided for analytical purposes. Party of appointing president
            is a common (though imperfect) proxy for judicial philosophy. Many judges rule against
            the expectations of the president who appointed them, and this data reflects that complexity.
            The visualization should not be construed as characterizing any individual judge as politically
            motivated.
          </p>
          <p>
            Data in this visualization is representative of the overall pattern of rulings. Exact
            judge names and citations are available in the individual case timelines.
          </p>
        </Section>

        <Section title="Limitations">
          <ul className="about-list">
            <li>The tracker covers <em>major</em> cases, not all litigation. Thousands of smaller administrative proceedings are not included.</li>
            <li>Case status may lag real-time court developments by up to 72 hours.</li>
            <li>Statistics on the home page (total cases, breakdown by status) are research estimates updated periodically and may not capture every jurisdiction.</li>
            <li>This tracker is not a substitute for legal advice. If you are affected by a policy, consult a licensed attorney.</li>
            <li>Court records can be complex and ambiguous. We make every effort to describe legal outcomes accurately, but the law in this area is rapidly evolving.</li>
          </ul>
        </Section>

        <Section title="Data Sources">
          <div className="sources-list">
            {SOURCES.map(src => (
              <div key={src.name} className="source-row">
                <div className="source-name-row">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    {src.name}
                    <svg viewBox="0 0 12 12" fill="none" className="source-ext-icon">
                      <path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
                <p className="source-note">{src.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Contact &amp; Corrections">
          <p>
            If you identify an error in a case description, timeline event, or case status, please
            contact the Kellogg Institute research team. We are committed to correcting errors promptly.
          </p>
          <p>
            For media inquiries, academic collaboration, or to report a case we may have missed,
            please reach out through the Notre Dame Kellogg Institute.
          </p>
          <a
            href="https://kellogg.nd.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="about-contact-link"
          >
            Visit the Kellogg Institute →
          </a>
        </Section>

      </div>

      <footer className="footer">
        <p>Data is for informational purposes only and does not constitute legal advice.</p>
        <p className="footer-small">Not affiliated with any political organization.</p>
      </footer>
      <div className="bottom-banner">A project of the Notre Dame Kellogg Institute</div>
    </div>
  )
}
