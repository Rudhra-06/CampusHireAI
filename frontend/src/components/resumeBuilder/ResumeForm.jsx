import { useState } from 'react';

/* ── tiny helpers ─────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2);

function SectionHeader({ title, onAdd, addLabel }) {
  return (
    <div className="rb-section-header">
      <span className="rb-section-title">{title}</span>
      {onAdd && (
        <button type="button" className="rb-add-btn" onClick={onAdd}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div className="rb-field">
      <label className="form-label">
        {label}{required && <span className="rb-required"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ marginBottom: 0 }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, required }) {
  return (
    <div className="rb-field">
      <label className="form-label">
        {label}{required && <span className="rb-required"> *</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ marginBottom: 0, minHeight: '80px' }}
      />
    </div>
  );
}

function EntryCard({ children, onRemove }) {
  return (
    <div className="rb-entry-card">
      <button type="button" className="rb-remove-btn" onClick={onRemove} title="Remove">✕</button>
      {children}
    </div>
  );
}

/* ── main component ───────────────────────────────────────── */
export default function ResumeForm({ data, onChange }) {
  const [skillInput, setSkillInput] = useState('');

  const set = (key, val) => onChange({ ...data, [key]: val });
  const setPI = (field, val) => set('personalInfo', { ...data.personalInfo, [field]: val });

  /* list helpers */
  const addItem    = (key, item) => set(key, [...(data[key] || []), { ...item, _id: uid() }]);
  const removeItem = (key, id)   => set(key, data[key].filter(x => x._id !== id));
  const updateItem = (key, id, field, val) =>
    set(key, data[key].map(x => x._id === id ? { ...x, [field]: val } : x));

  /* skill tag */
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || data.skills.includes(s)) return;
    set('skills', [...data.skills, s]);
    setSkillInput('');
  };
  const removeSkill = (s) => set('skills', data.skills.filter(x => x !== s));

  return (
    <div className="rb-form">

      {/* ── Personal Information ─────────────────────────── */}
      <SectionHeader title="Personal Information" />
      <div className="rb-grid-2">
        <Field label="Full Name"  value={data.personalInfo.name}      onChange={v => setPI('name', v)}      placeholder="John Doe"            required />
        <Field label="Email"      value={data.personalInfo.email}     onChange={v => setPI('email', v)}     placeholder="john@example.com"    required type="email" />
        <Field label="Phone"      value={data.personalInfo.phone}     onChange={v => setPI('phone', v)}     placeholder="+91 9876543210" />
        <Field label="Address"    value={data.personalInfo.address}   onChange={v => setPI('address', v)}   placeholder="City, State" />
        <Field label="LinkedIn"   value={data.personalInfo.linkedin}  onChange={v => setPI('linkedin', v)}  placeholder="linkedin.com/in/..." />
        <Field label="GitHub"     value={data.personalInfo.github}    onChange={v => setPI('github', v)}    placeholder="github.com/..." />
        <Field label="Portfolio"  value={data.personalInfo.portfolio} onChange={v => setPI('portfolio', v)} placeholder="yoursite.com" />
      </div>

      {/* ── Professional Summary ─────────────────────────── */}
      <SectionHeader title="Professional Summary" />
      <TextArea
        value={data.summary}
        onChange={v => set('summary', v)}
        placeholder="A brief summary of your background, skills, and career goals..."
      />

      {/* ── Education ────────────────────────────────────── */}
      <SectionHeader title="Education" onAdd={() => addItem('education', { college:'', degree:'', cgpa:'', year:'' })} addLabel="Add Education" />
      {data.education.map(e => (
        <EntryCard key={e._id} onRemove={() => removeItem('education', e._id)}>
          <div className="rb-grid-2">
            <Field label="College / University" value={e.college} onChange={v => updateItem('education', e._id, 'college', v)} placeholder="IIT Delhi" required />
            <Field label="Degree"               value={e.degree}  onChange={v => updateItem('education', e._id, 'degree',  v)} placeholder="B.Tech CSE" required />
            <Field label="CGPA / Percentage"    value={e.cgpa}    onChange={v => updateItem('education', e._id, 'cgpa',    v)} placeholder="8.5" />
            <Field label="Year"                 value={e.year}    onChange={v => updateItem('education', e._id, 'year',    v)} placeholder="2021 – 2025" />
          </div>
        </EntryCard>
      ))}
      {!data.education.length && <p className="rb-empty-hint">No education added yet.</p>}

      {/* ── Skills ───────────────────────────────────────── */}
      <SectionHeader title="Skills" />
      <div className="rb-skill-input-row">
        <input
          type="text"
          value={skillInput}
          onChange={e => setSkillInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
          placeholder="Type a skill and press Enter or click Add"
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button type="button" className="btn btn-primary rb-skill-add-btn" onClick={addSkill}>Add</button>
      </div>
      <div className="rb-skill-tags">
        {data.skills.map(s => (
          <span key={s} className="rb-skill-tag">
            {s}
            <button type="button" onClick={() => removeSkill(s)} className="rb-skill-remove">✕</button>
          </span>
        ))}
        {!data.skills.length && <p className="rb-empty-hint">No skills added yet.</p>}
      </div>

      {/* ── Experience ───────────────────────────────────── */}
      <SectionHeader title="Experience" onAdd={() => addItem('experience', { company:'', role:'', duration:'', description:'' })} addLabel="Add Experience" />
      {data.experience.map(e => (
        <EntryCard key={e._id} onRemove={() => removeItem('experience', e._id)}>
          <div className="rb-grid-2">
            <Field label="Company"  value={e.company}  onChange={v => updateItem('experience', e._id, 'company',  v)} placeholder="Google" />
            <Field label="Role"     value={e.role}     onChange={v => updateItem('experience', e._id, 'role',     v)} placeholder="Software Engineer" />
            <Field label="Duration" value={e.duration} onChange={v => updateItem('experience', e._id, 'duration', v)} placeholder="Jan 2023 – Present" />
          </div>
          <TextArea label="Description" value={e.description} onChange={v => updateItem('experience', e._id, 'description', v)} placeholder="Key responsibilities and achievements..." />
        </EntryCard>
      ))}
      {!data.experience.length && <p className="rb-empty-hint">No experience added yet.</p>}

      {/* ── Internships ──────────────────────────────────── */}
      <SectionHeader title="Internships" onAdd={() => addItem('internships', { company:'', role:'', duration:'', description:'' })} addLabel="Add Internship" />
      {data.internships.map(e => (
        <EntryCard key={e._id} onRemove={() => removeItem('internships', e._id)}>
          <div className="rb-grid-2">
            <Field label="Company"  value={e.company}  onChange={v => updateItem('internships', e._id, 'company',  v)} placeholder="Startup Inc." />
            <Field label="Role"     value={e.role}     onChange={v => updateItem('internships', e._id, 'role',     v)} placeholder="Frontend Intern" />
            <Field label="Duration" value={e.duration} onChange={v => updateItem('internships', e._id, 'duration', v)} placeholder="May 2023 – Jul 2023" />
          </div>
          <TextArea label="Description" value={e.description} onChange={v => updateItem('internships', e._id, 'description', v)} placeholder="What you built or contributed..." />
        </EntryCard>
      ))}
      {!data.internships.length && <p className="rb-empty-hint">No internships added yet.</p>}

      {/* ── Projects ─────────────────────────────────────── */}
      <SectionHeader title="Projects" onAdd={() => addItem('projects', { name:'', description:'', tech:'', github:'' })} addLabel="Add Project" />
      {data.projects.map(p => (
        <EntryCard key={p._id} onRemove={() => removeItem('projects', p._id)}>
          <div className="rb-grid-2">
            <Field label="Project Name"      value={p.name}   onChange={v => updateItem('projects', p._id, 'name',   v)} placeholder="Portfolio Website" />
            <Field label="Technologies Used" value={p.tech}   onChange={v => updateItem('projects', p._id, 'tech',   v)} placeholder="React, Node.js, MongoDB" />
            <Field label="GitHub Link"       value={p.github} onChange={v => updateItem('projects', p._id, 'github', v)} placeholder="github.com/you/project" />
          </div>
          <TextArea label="Description" value={p.description} onChange={v => updateItem('projects', p._id, 'description', v)} placeholder="What the project does and your role..." />
        </EntryCard>
      ))}
      {!data.projects.length && <p className="rb-empty-hint">No projects added yet.</p>}

      {/* ── Certifications ───────────────────────────────── */}
      <SectionHeader title="Certifications" onAdd={() => addItem('certifications', { name:'', issuer:'', year:'' })} addLabel="Add Certification" />
      {data.certifications.map(c => (
        <EntryCard key={c._id} onRemove={() => removeItem('certifications', c._id)}>
          <div className="rb-grid-2">
            <Field label="Certificate Name" value={c.name}   onChange={v => updateItem('certifications', c._id, 'name',   v)} placeholder="AWS Solutions Architect" />
            <Field label="Issuing Body"     value={c.issuer} onChange={v => updateItem('certifications', c._id, 'issuer', v)} placeholder="Amazon Web Services" />
            <Field label="Year"             value={c.year}   onChange={v => updateItem('certifications', c._id, 'year',   v)} placeholder="2024" />
          </div>
        </EntryCard>
      ))}
      {!data.certifications.length && <p className="rb-empty-hint">No certifications added yet.</p>}

      {/* ── Achievements ─────────────────────────────────── */}
      <SectionHeader title="Achievements" onAdd={() => addItem('achievements', { title:'', description:'' })} addLabel="Add Achievement" />
      {data.achievements.map(a => (
        <EntryCard key={a._id} onRemove={() => removeItem('achievements', a._id)}>
          <Field label="Title" value={a.title} onChange={v => updateItem('achievements', a._id, 'title', v)} placeholder="1st Place — National Hackathon 2024" />
          <TextArea label="Description" value={a.description} onChange={v => updateItem('achievements', a._id, 'description', v)} placeholder="Brief details..." />
        </EntryCard>
      ))}
      {!data.achievements.length && <p className="rb-empty-hint">No achievements added yet.</p>}

      {/* ── Languages ────────────────────────────────────── */}
      <SectionHeader title="Languages" onAdd={() => addItem('languages', { name:'', proficiency:'' })} addLabel="Add Language" />
      {data.languages.map(l => (
        <EntryCard key={l._id} onRemove={() => removeItem('languages', l._id)}>
          <div className="rb-grid-2">
            <Field label="Language"    value={l.name}        onChange={v => updateItem('languages', l._id, 'name',        v)} placeholder="English" />
            <Field label="Proficiency" value={l.proficiency} onChange={v => updateItem('languages', l._id, 'proficiency', v)} placeholder="Native / Fluent / Intermediate" />
          </div>
        </EntryCard>
      ))}
      {!data.languages.length && <p className="rb-empty-hint">No languages added yet.</p>}

    </div>
  );
}
