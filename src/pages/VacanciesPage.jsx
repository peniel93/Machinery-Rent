import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { mockDb, subscribeToDb } from '../lib/supabaseClient';
import { Briefcase, Calendar, MapPin, FileText, CheckCircle, Search, Award, X, Clock, Upload } from 'lucide-react';

export const VacanciesPage = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [vacancies, setVacancies] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);

  // Result search state
  const [resultQuery, setResultQuery] = useState('');
  const [foundApplications, setFoundApplications] = useState(null);

  // Application Form State (14 fields)
  const [appForm, setAppForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    residence_address: '',
    region: 'Addis Ababa',
    zone: 'Zone 1',
    woreda: 'Woreda 03',
    kebele: 'Kebele 05',
    cv_doc: null,
    academic_doc: null,
    university_temp_doc: null,
    grade12_transcript: null,
    grade10_transcript: null,
    grade8_transcript: null,
    grade12_entrance: null,
    grade10_matric: null,
    grade6_ministry: null,
    grade8_ministry: null,
    birth_cert: null,
    fayda_id: null
  });

  const defaultVacancies = [
    {
      id: 'vac-1',
      job_title: 'Senior Heavy Equipment Operator (Excavator / Dozer)',
      job_type: 'Full-Time Permanent',
      description: 'Operating CAT 320 excavators and D8 bulldozers on high-volume construction and road sites. Must have valid Grade-3 Ethiopian Heavy Driving License.',
      place_of_application: 'Head Office - Bole Subcity, Addis Ababa',
      expiry_date: '2026-08-30',
      written_exam_date: '2026-08-15T09:00',
      written_exam_venue: 'Main Assembly Hall, 2nd Floor',
      interview_date: '2026-08-20T10:30',
      interview_venue: 'HR Executive Boardroom'
    },
    {
      id: 'vac-2',
      job_title: 'Fleet Maintenance Engineer & Mechanical Specialist',
      job_type: 'Full-Time Contract',
      description: 'Responsible for diagnostic troubleshooting, hydraulic system repairs, and routine preventive maintenance across all rental machinery.',
      place_of_application: 'Central Fleet Workshop - Akaki Kaliti',
      expiry_date: '2026-09-15',
      written_exam_date: '2026-09-01T10:00',
      written_exam_venue: 'Engineering Training Center',
      interview_date: '2026-09-05T14:00',
      interview_venue: 'Technical Panel Office'
    }
  ];

  const loadData = () => {
    const data = mockDb.getTable('vacancies', defaultVacancies);
    setVacancies(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!appForm.full_name || !appForm.email || !appForm.phone || !appForm.residence_address) {
      showAlert('Please fill in all mandatory applicant details.', 'danger');
      return;
    }

    mockDb.insertRow('vacancy_applications', {
      vacancy_id: selectedJob.id,
      full_name: appForm.full_name,
      email: appForm.email,
      phone: appForm.phone,
      residence_address: appForm.residence_address,
      region: appForm.region,
      zone: appForm.zone,
      woreda: appForm.woreda,
      kebele: appForm.kebele,
      cv_doc_url: appForm.cv_doc ? appForm.cv_doc.name : 'cv_resume.pdf',
      academic_doc_url: appForm.academic_doc ? appForm.academic_doc.name : 'academic_doc.pdf',
      status: 'Submitted',
      created_at: new Date().toISOString()
    });

    showAlert(`Application submitted successfully for ${appForm.full_name}!`, 'success');
    setApplyModalOpen(false);
  };

  const handleSearchResult = (e) => {
    e.preventDefault();
    if (!resultQuery.trim()) return;

    const allApps = mockDb.getTable('vacancy_applications', []);
    const q = resultQuery.trim().toLowerCase();
    const matches = allApps.filter(app => 
      (app.email || '').toLowerCase() === q ||
      (app.phone || '').includes(resultQuery.trim())
    );

    setFoundApplications(matches);
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header & Check Results Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Job Vacancies & Recruitment
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Explore active career opportunities and apply online with document attachments.
          </p>
        </div>

        <button 
          onClick={() => {
            setResultQuery('');
            setFoundApplications(null);
            setResultsModalOpen(true);
          }}
          className="btn-primary"
          style={{ backgroundColor: '#0284c7' }}
        >
          <Award size={18} /> {t('checkResults')}
        </button>
      </div>

      {/* Vacancy Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {vacancies.map(job => {
          const isExpired = new Date(job.expiry_date) < new Date();
          return (
            <div key={job.id} className="card-glass" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-info">{job.job_type}</span>
                    <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                      {isExpired ? 'Expired' : 'Active Posting'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{job.job_title}</h2>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} className="text-primary-500" />
                  <span>Expiry Date: <strong style={{ color: 'var(--text-primary)' }}>{job.expiry_date}</strong></span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {job.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', background: 'var(--primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} className="text-primary-600" />
                  <span>Application Place: <strong>{job.place_of_application}</strong></span>
                </div>
              </div>

              {/* Exam & Interview Announcement schedules */}
              {(job.written_exam_date || job.interview_date) && (
                <div style={{ border: '1px dashed var(--primary-400)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', backgroundColor: 'var(--bg-surface)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} /> Exam & Interview Call-up Announcements
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    {job.written_exam_date && (
                      <div>
                        <strong>Written Exam:</strong> {new Date(job.written_exam_date).toLocaleString()}<br />
                        <span style={{ color: 'var(--text-muted)' }}>Venue: {job.written_exam_venue || 'Main Assembly Hall'}</span>
                      </div>
                    )}
                    {job.interview_date && (
                      <div>
                        <strong>Interview Date:</strong> {new Date(job.interview_date).toLocaleString()}<br />
                        <span style={{ color: 'var(--text-muted)' }}>Venue: {job.interview_venue || 'HR Boardroom'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleOpenApplyModal(job)}
                  className="btn-primary"
                  disabled={isExpired}
                  style={{ opacity: isExpired ? 0.5 : 1 }}
                >
                  <Briefcase size={18} /> Apply For Job
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Online Application Dedicated Modal Form (14 Fields) */}
      {applyModalOpen && selectedJob && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                Job Application Form - {selectedJob.job_title}
              </h3>
              <button onClick={() => setApplyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              {/* Personal Details */}
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                1. Personal & Contact Information
              </h4>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-control" required value={appForm.full_name} onChange={e => setAppForm({ ...appForm, full_name: e.target.value })} placeholder="Full Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-control" required value={appForm.email} onChange={e => setAppForm({ ...appForm, email: e.target.value })} placeholder="email@example.com" />
                </div>
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="text" className="form-control" required value={appForm.phone} onChange={e => setAppForm({ ...appForm, phone: e.target.value })} placeholder="+251 9..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Residence Address *</label>
                  <input type="text" className="form-control" required value={appForm.residence_address} onChange={e => setAppForm({ ...appForm, residence_address: e.target.value })} placeholder="Subcity / House No" />
                </div>
              </div>

              <div className="responsive-grid-4">
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <input type="text" className="form-control" value={appForm.region} onChange={e => setAppForm({ ...appForm, region: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Zone</label>
                  <input type="text" className="form-control" value={appForm.zone} onChange={e => setAppForm({ ...appForm, zone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Woreda</label>
                  <input type="text" className="form-control" value={appForm.woreda} onChange={e => setAppForm({ ...appForm, woreda: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kebele</label>
                  <input type="text" className="form-control" value={appForm.kebele} onChange={e => setAppForm({ ...appForm, kebele: e.target.value })} />
                </div>
              </div>

              {/* Document Attachments (PDF/Word ~10MB) */}
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.25rem 0 1rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                2. Mandatory & Optional Document Uploads
              </h4>

              <div className="responsive-form-row" style={{ fontSize: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">CV or Resume (PDF/Word ~10MB) (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={e => setAppForm({ ...appForm, cv_doc: e.target.files[0] })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Document in PDF *</label>
                  <input type="file" className="form-control" accept=".pdf" onChange={e => setAppForm({ ...appForm, academic_doc: e.target.files[0] })} />
                </div>
                <div className="form-group">
                  <label className="form-label">University Temporary Document</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 12 Transcript (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 10 Transcript (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 8 Transcript (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 12 Entrance Certificate (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 10 Matric Certificate (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 6 Ministry Exam Certificate (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade 8 Ministry Certificate (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Birth Certificate (Optional)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fayda or ID Front & Back (Optional)</label>
                  <input type="file" className="form-control" accept="image/*,.pdf" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setApplyModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Upload size={18} /> Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Exam Results Modal */}
      {resultsModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                Check Exam & Interview Results
              </h3>
              <button onClick={() => setResultsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchResult} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  {!resultQuery && <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />}
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t('enterPhoneOrEmail')}
                    value={resultQuery}
                    onChange={(e) => setResultQuery(e.target.value)}
                    required
                    style={{ paddingLeft: resultQuery ? '0.875rem' : '2.5rem', transition: 'padding-left 0.2s ease' }}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Search
                </button>
              </div>
            </form>

            {foundApplications !== null && (
              <div>
                {foundApplications.length === 0 ? (
                  <div className="alert alert-warning">
                    No application record found matching "{resultQuery}". Please verify your email or phone number.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {foundApplications.map(app => (
                      <div key={app.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', backgroundColor: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-700)' }}>{app.full_name}</h4>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>Contact: {app.email} | {app.phone}</p>
                          </div>
                          <span className={`badge ${app.final_result === 'Passed & Selected' ? 'badge-success' : app.final_result === 'Failed' ? 'badge-danger' : 'badge-info'}`}>
                            Final Decision: {app.final_result || app.status || 'Under Evaluation'}
                          </span>
                        </div>

                        {/* 2-STAGE RESULTS CARDS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          {/* STAGE 1: WRITTEN EXAM */}
                          <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              📝 STAGE 1: WRITTEN EXAM
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
                              <span className={`badge ${app.written_exam_status === 'Passed' ? 'badge-success' : app.written_exam_status === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                                {app.written_exam_status || 'Pending'}
                              </span>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                              Score: {app.written_exam_score || 0} / 100
                            </div>
                          </div>

                          {/* STAGE 2: INTERVIEW EXAM */}
                          <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              🎙️ STAGE 2: ORAL INTERVIEW
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
                              <span className={`badge ${app.interview_status === 'Passed' ? 'badge-success' : app.interview_status === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                                {app.interview_status || 'Pending'}
                              </span>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                              Score: {app.interview_score || 0} / 100
                            </div>
                          </div>
                        </div>

                        {/* Evaluator Remarks */}
                        {app.evaluator_remarks && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--primary-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-600)' }}>
                            <strong>Committee Remarks:</strong> {app.evaluator_remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
