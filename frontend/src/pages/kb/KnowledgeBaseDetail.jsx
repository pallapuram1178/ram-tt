import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const KnowledgeBaseDetail = () => {
  const { id } = useParams();
  const { user, isITStaff } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/kb/${id}`);
      if (res.data.success) {
        setArticle(res.data.data);
        setRelated(res.data.related || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Article not found', 'error');
      navigate('/kb');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (helpful) => {
    if (voted) return;
    try {
      const res = await api.post(`/kb/${article._id}/vote`, { helpful });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setVoted(true);
        setArticle({
          ...article,
          helpfulVotes: res.data.helpfulVotes,
          unhelpfulVotes: res.data.unhelpfulVotes,
        });
      }
    } catch (err) {
      showToast('Failed to record feedback vote', 'error');
    }
  };

  const toggleStep = (index) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading || !article) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading article...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Back button & Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <Link to="/kb" className="btn btn-sm btn-light border text-secondary">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{article.articleId}</span>
            <span className="badge bg-light text-secondary border">{article.category}</span>
          </div>
        </div>

        {isITStaff && (
          <Link to={`/kb/edit/${article._id}`} className="btn btn-sm btn-outline-primary fw-semibold">
            <i className="bi bi-pencil-square me-1"></i> Edit Article
          </Link>
        )}
      </div>

      <div className="row g-4">
        {/* Main Article Content */}
        <div className="col-12 col-lg-8">
          <div className="card-custom mb-4">
            <div className="card-custom-body p-4 p-md-5">
              <h2 className="fw-bold text-dark mb-3 fs-4">{article.title}</h2>

              {/* Metadata */}
              <div className="d-flex align-items-center gap-3 text-muted small pb-3 mb-4 border-bottom flex-wrap">
                <span><i className="bi bi-person me-1"></i>Author: {article.author?.name || 'IT Support Team'}</span>
                <span>&bull;</span>
                <span><i className="bi bi-calendar3 me-1"></i>Updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
                <span>&bull;</span>
                <span><i className="bi bi-eye me-1"></i>{article.views} views</span>
              </div>

              {/* Problem Summary Callout */}
              <div className="p-3 mb-4 rounded-3 border-start border-4 border-primary bg-light">
                <div className="fw-bold text-primary small mb-1">
                  <i className="bi bi-info-circle-fill me-1"></i> Problem Summary:
                </div>
                <p className="text-secondary small mb-0">{article.problemSummary}</p>
              </div>

              {/* Symptoms */}
              {article.symptoms && article.symptoms.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">
                    <i className="bi bi-exclamation-octagon text-danger me-2"></i> Common Symptoms
                  </h6>
                  <ul className="list-group list-group-flush border rounded-3">
                    {article.symptoms.map((sym, idx) => (
                      <li key={idx} className="list-group-item small text-secondary py-2">
                        <i className="bi bi-dash-circle text-danger me-2"></i>
                        {sym}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Step-by-Step Solution Checklist */}
              {article.stepByStepSolution && article.stepByStepSolution.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">
                    <i className="bi bi-check2-square text-success me-2"></i> Step-by-Step Troubleshooting Checklist
                  </h6>
                  <p className="text-muted small mb-3">Check off each step as you complete it:</p>

                  <div className="d-flex flex-column gap-2">
                    {article.stepByStepSolution.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition-all ${
                          completedSteps[idx] ? 'bg-success-subtle border-success-subtle text-decoration-line-through' : 'bg-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleStep(idx)}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-1 flex-shrink-0"
                          checked={!!completedSteps[idx]}
                          onChange={() => toggleStep(idx)}
                        />
                        <div className="small fw-semibold text-dark">
                          <span className="badge bg-light text-primary border me-2">Step {idx + 1}</span>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Detailed Content */}
              <div className="mb-4 pt-3 border-top">
                <h6 className="fw-bold text-dark mb-3">Additional Details & Technical Notes</h6>
                <div className="text-secondary small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {article.content}
                </div>
              </div>

              {/* Helpful Voting Feedback */}
              <div className="p-4 bg-light rounded-4 text-center border mt-5">
                <h6 className="fw-bold text-dark mb-1">Did this article resolve your problem?</h6>
                <p className="text-muted small mb-3">Your feedback helps improve our internal AI troubleshooting responses.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className={`btn btn-sm px-4 fw-semibold d-flex align-items-center gap-1 ${voted ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => handleVote(true)}
                    disabled={voted}
                  >
                    <i className="bi bi-hand-thumbs-up"></i> Yes, it helped! ({article.helpfulVotes})
                  </button>
                  <button
                    className={`btn btn-sm px-4 fw-semibold d-flex align-items-center gap-1 ${voted ? 'btn-secondary' : 'btn-outline-danger'}`}
                    onClick={() => handleVote(false)}
                    disabled={voted}
                  >
                    <i className="bi bi-hand-thumbs-down"></i> No, still broken
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: AI Diagnostic & Related Articles */}
        <div className="col-12 col-lg-4">
          {/* AI Assistance Callout */}
          <div className="p-4 rounded-4 text-white shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="ai-pulse-dot"></span>
              <span className="fw-bold small text-info">Need interactive help?</span>
            </div>
            <h5 className="fw-bold text-white mb-2">Ask AI Helpdesk</h5>
            <p className="small text-light opacity-75 mb-3">
              Still experiencing this problem? Our AI chatbot can guide you through live diagnostics or raise an official support ticket.
            </p>
            <div className="d-flex flex-column gap-2">
              <Link to="/ai-assistant" className="btn btn-light btn-sm fw-bold text-primary py-2 shadow-sm">
                <i className="bi bi-robot me-1"></i> Troubleshoot with AI
              </Link>
              <Link to="/tickets/create" className="btn btn-outline-light btn-sm fw-semibold py-2">
                <i className="bi bi-ticket-perforated me-1"></i> Create Support Ticket
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="card-custom mb-4">
              <div className="card-custom-header">
                <span className="fw-bold fs-6">
                  <i className="bi bi-journals text-primary me-2"></i> Related Articles
                </span>
              </div>
              <div className="card-custom-body p-0">
                <div className="list-group list-group-flush">
                  {related.map((rel) => (
                    <Link
                      key={rel._id}
                      to={`/kb/${rel.articleId}`}
                      className="list-group-item list-group-item-action p-3"
                    >
                      <div className="badge bg-light text-primary border small mb-1">{rel.articleId}</div>
                      <div className="fw-semibold small text-dark">{rel.title}</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>
                        {rel.problemSummary}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseDetail;
