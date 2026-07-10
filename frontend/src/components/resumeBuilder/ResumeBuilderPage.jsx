import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import useResumeBuilder from '../../hooks/useResumeBuilder';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';

/* strip internal _id keys before sending to API */
function clean(data) {
  const strip = (arr) =>
    (arr || []).map(({ _id, ...rest }) => rest);
  return {
    ...data,
    education:      strip(data.education),
    experience:     strip(data.experience),
    internships:    strip(data.internships),
    projects:       strip(data.projects),
    certifications: strip(data.certifications),
    achievements:   strip(data.achievements),
    languages:      strip(data.languages),
  };
}

/* inject _id into loaded array items so form can key them */
function hydrate(data) {
  const tag = (arr) =>
    (arr || []).map(item => ({ _id: Math.random().toString(36).slice(2), ...item }));
  return {
    ...data,
    education:      tag(data.education),
    experience:     tag(data.experience),
    internships:    tag(data.internships),
    projects:       tag(data.projects),
    certifications: tag(data.certifications),
    achievements:   tag(data.achievements),
    languages:      tag(data.languages),
  };
}

export default function ResumeBuilderPage() {
  const { data: saved, loading, saving, error, success, save } = useResumeBuilder();
  const [form, setForm] = useState(null);
  const previewRef = useRef();

  /* once saved data loads, hydrate it into local form state */
  useEffect(() => {
    if (!loading) setForm(hydrate(saved));
  }, [loading]);

  const handleSave = () => save(clean(form));

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `${form?.personalInfo?.name || 'Resume'} — Resume`,
    pageStyle: `
      @page { size: A4; margin: 16mm 14mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .rp-root { box-shadow: none !important; }
      }
    `,
  });

  if (loading || !form) {
    return (
      <div className="card empty-state">
        <p>Loading your resume...</p>
      </div>
    );
  }

  return (
    <div className="rb-page">
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Resume Builder</h2>
            <p>Build your professional resume — edits reflect live in the preview</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : '💾 Save Resume'}
            </button>
            <button className="btn btn-success" onClick={handlePrint}>
              📄 Export PDF
            </button>
          </div>
        </div>

        {error   && <div className="alert-error"   style={{ marginTop: '12px' }}>⚠ {error}</div>}
        {success && <div className="alert-success" style={{ marginTop: '12px' }}>✓ {success}</div>}
      </div>

      {/* Two-column layout */}
      <div className="rb-layout">
        {/* Left — Form */}
        <div className="rb-left">
          <div className="card" style={{ padding: '24px' }}>
            <ResumeForm data={form} onChange={setForm} />
          </div>
        </div>

        {/* Right — Preview */}
        <div className="rb-right">
          <div className="rb-preview-sticky">
            <div className="rb-preview-label">Live Preview</div>
            <div className="rb-preview-wrapper">
              <ResumePreview ref={previewRef} data={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
