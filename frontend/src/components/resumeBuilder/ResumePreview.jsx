import { forwardRef } from 'react';

const Section = ({ title, children }) => (
  <div className="rp-section">
    <div className="rp-section-title">{title}</div>
    <div className="rp-section-body">{children}</div>
  </div>
);

const ResumePreview = forwardRef(function ResumePreview({ data }, ref) {
  const pi = data.personalInfo || {};

  return (
    <div className="rp-root" ref={ref}>
      {/* Header */}
      <div className="rp-header">
        <h1 className="rp-name">{pi.name || 'Your Name'}</h1>
        <div className="rp-contact">
          {pi.email    && <span>{pi.email}</span>}
          {pi.phone    && <span>{pi.phone}</span>}
          {pi.address  && <span>{pi.address}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}
          {pi.github   && <span>{pi.github}</span>}
          {pi.portfolio&& <span>{pi.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary?.trim() && (
        <Section title="Professional Summary">
          <p className="rp-summary">{data.summary}</p>
        </Section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <Section title="Education">
          {data.education.map((e, i) => (
            <div key={i} className="rp-entry">
              <div className="rp-entry-header">
                <span className="rp-entry-title">{e.degree}</span>
                <span className="rp-entry-right">{e.year}</span>
              </div>
              <div className="rp-entry-sub">
                {e.college}{e.cgpa ? ` · CGPA ${e.cgpa}` : ''}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <Section title="Skills">
          <p className="rp-skills">{data.skills.join(' · ')}</p>
        </Section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <Section title="Experience">
          {data.experience.map((e, i) => (
            <div key={i} className="rp-entry">
              <div className="rp-entry-header">
                <span className="rp-entry-title">{e.role}</span>
                <span className="rp-entry-right">{e.duration}</span>
              </div>
              <div className="rp-entry-sub">{e.company}</div>
              {e.description && <p className="rp-entry-desc">{e.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Internships */}
      {data.internships?.length > 0 && (
        <Section title="Internships">
          {data.internships.map((e, i) => (
            <div key={i} className="rp-entry">
              <div className="rp-entry-header">
                <span className="rp-entry-title">{e.role}</span>
                <span className="rp-entry-right">{e.duration}</span>
              </div>
              <div className="rp-entry-sub">{e.company}</div>
              {e.description && <p className="rp-entry-desc">{e.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <Section title="Projects">
          {data.projects.map((p, i) => (
            <div key={i} className="rp-entry">
              <div className="rp-entry-header">
                <span className="rp-entry-title">{p.name}</span>
                {p.github && <span className="rp-entry-right rp-link">{p.github}</span>}
              </div>
              {p.tech && <div className="rp-entry-sub">{p.tech}</div>}
              {p.description && <p className="rp-entry-desc">{p.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <Section title="Certifications">
          {data.certifications.map((c, i) => (
            <div key={i} className="rp-entry">
              <div className="rp-entry-header">
                <span className="rp-entry-title">{c.name}</span>
                <span className="rp-entry-right">{c.year}</span>
              </div>
              {c.issuer && <div className="rp-entry-sub">{c.issuer}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Achievements */}
      {data.achievements?.length > 0 && (
        <Section title="Achievements">
          {data.achievements.map((a, i) => (
            <div key={i} className="rp-entry">
              <div className="rp-entry-title">{a.title}</div>
              {a.description && <p className="rp-entry-desc">{a.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Languages */}
      {data.languages?.length > 0 && (
        <Section title="Languages">
          <p className="rp-skills">
            {data.languages.map(l => l.proficiency ? `${l.name} (${l.proficiency})` : l.name).join(' · ')}
          </p>
        </Section>
      )}
    </div>
  );
});

export default ResumePreview;
