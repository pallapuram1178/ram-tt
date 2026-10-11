import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const KnowledgeBaseEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    category: 'Network',
    tags: '',
    problemSummary: '',
    symptoms: '',
    stepByStepSolution: '',
    content: '',
    status: 'Approved',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await api.get(`/kb/${id}`);
      if (res.data.success) {
        const art = res.data.data;
        setFormData({
          title: art.title,
          category: art.category,
          tags: art.tags?.join(', ') || '',
          problemSummary: art.problemSummary,
          symptoms: art.symptoms?.join('\n') || '',
          stepByStepSolution: art.stepByStepSolution?.join('\n') || '',
          content: art.content,
          status: art.status,
        });
      }
    } catch (err) {
      showToast('Failed to load article', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.problemSummary.trim() || !formData.content.trim()) {
      showToast('Please fill in title, problem summary, and content', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        problemSummary: formData.problemSummary,
        symptoms: formData.symptoms ? formData.symptoms.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        stepByStepSolution: formData.stepByStepSolution ? formData.stepByStepSolution.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        content: formData.content,
        status: formData.status,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/kb/${id}`, payload);
      } else {
        res = await api.post('/kb', payload);
      }

      if (res.data.success) {
        showToast(`Knowledge article ${isEditing ? 'updated' : 'published'} successfully!`, 'success');
        navigate(`/kb/${res.data.data.articleId}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save article', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/kb" className="btn btn-sm btn-light border text-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h3 className="fw-bold mb-0">{isEditing ? 'Edit Knowledge Article' : 'Author Knowledge Article'}</h3>
          <p className="text-muted small mb-0">Contribute solutions to the enterprise AI and self-service repository</p>
        </div>
      </div>

      <div className="card-custom">
        <div className="card-custom-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Article Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. Troubleshooting Corporate VPN Connection Drops"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Network">Network & VPN</option>
                  <option value="Email & Communication">Email & Communication</option>
                  <option value="Hardware">Hardware & Laptops</option>
                  <option value="Software">Software & OS</option>
                  <option value="Access & Security">Access & Security</option>
                  <option value="General IT">General IT</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Publishing Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Approved">Approved (Live for Employees & AI RAG)</option>
                  <option value="Draft">Draft (Internal review only)</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Tags (Comma-separated)</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                placeholder="vpn, cisco, remote-work, tunnel, dns"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Problem Summary *</label>
              <textarea
                name="problemSummary"
                className="form-control"
                rows="2"
                placeholder="Short 1-2 sentence overview of what this guide resolves..."
                value={formData.problemSummary}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Common Symptoms (One per line)</label>
              <textarea
                name="symptoms"
                className="form-control"
                rows="3"
                placeholder="Error code 403 on connection&#10;VPN tunnel drops every 20 minutes&#10;DNS resolution fails"
                value={formData.symptoms}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Step-by-Step Resolution Steps (One per line - Used by AI Chatbot)</label>
              <textarea
                name="stepByStepSolution"
                className="form-control"
                rows="4"
                placeholder="1. Restart local Wi-Fi router.&#10;2. Open Cisco AnyConnect and verify gateway address.&#10;3. Flush DNS cache via ipconfig /flushdns.&#10;4. Re-authenticate 2FA."
                value={formData.stepByStepSolution}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted">Full Article Content & Deep Diagnostic Details *</label>
              <textarea
                name="content"
                className="form-control"
                rows="6"
                placeholder="Write full background explanations, screenshots notes, and advanced commands..."
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/kb" className="btn btn-light border px-4">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary fw-semibold px-4 shadow-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseEditor;
