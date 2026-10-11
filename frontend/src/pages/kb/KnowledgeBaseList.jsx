import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const KnowledgeBaseList = () => {
  const { user, isITStaff } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        category: category !== 'all' ? category : undefined,
        search: search.trim() ? search.trim() : undefined,
      };

      const res = await api.get('/kb', { params });
      if (res.data.success) {
        setArticles(res.data.data);
        setCategoryCounts(res.data.categoryCounts || []);
      }
    } catch (err) {
      console.error('Failed to load KB articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const categoriesList = [
    { name: 'all', label: 'All Articles', icon: 'bi-grid-fill', color: 'primary' },
    { name: 'Network', label: 'Network & VPN', icon: 'bi-wifi', color: 'cyan' },
    { name: 'Email & Communication', label: 'Email & Outlook', icon: 'bi-envelope-paper-fill', color: 'blue' },
    { name: 'Hardware', label: 'Hardware & Laptops', icon: 'bi-laptop-fill', color: 'amber' },
    { name: 'Software', label: 'OS & System Crashes', icon: 'bi-window-stack', color: 'purple' },
    { name: 'Access & Security', label: 'Access & Software', icon: 'bi-shield-lock-fill', color: 'green' },
  ];

  return (
    <div className="container-fluid p-0">
      {/* Knowledge Base Header Banner */}
      <div className="p-4 p-md-5 rounded-4 text-white text-center mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)' }}>
        <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-white text-primary mb-3 shadow">
          <i className="bi bi-journal-check fs-3"></i>
        </div>
        <h3 className="fw-bold mb-2">IT Knowledge Base & Self-Service</h3>
        <p className="text-light opacity-75 small mx-auto mb-4" style={{ maxWidth: '600px' }}>
          Explore approved company troubleshooting guides, standard operating procedures, and diagnostic steps.
        </p>

        {/* Big Search Input */}
        <form onSubmit={handleSearchSubmit} className="mx-auto" style={{ maxWidth: '580px' }}>
          <div className="input-group input-group-lg shadow-sm">
            <span className="input-group-text bg-white border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 px-2"
              placeholder="Search by keywords (e.g. VPN, Outlook sync, BSOD crash, Wi-Fi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary px-4 fw-semibold">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Admin / IT Staff Create Article Button */}
      {isITStaff && (
        <div className="d-flex justify-content-end mb-3">
          <Link to="/kb/create" className="btn btn-primary btn-sm fw-semibold shadow-sm d-flex align-items-center gap-1">
            <i className="bi bi-plus-circle"></i> Author Knowledge Article
          </Link>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categoriesList.map((cat) => (
          <button
            key={cat.name}
            className={`btn btn-sm d-flex align-items-center gap-2 py-2 px-3 rounded-pill fw-semibold ${category === cat.name ? 'btn-primary shadow-sm' : 'btn-white border text-secondary'}`}
            onClick={() => setCategory(cat.name)}
          >
            <i className={`bi ${cat.icon}`}></i>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted small mt-2">Loading knowledge articles...</p>
          </div>
        ) : articles.length > 0 ? (
          articles.map((art) => (
            <div key={art._id} className="col-12 col-md-6 col-lg-4">
              <div className="card-custom h-100 d-flex flex-column">
                <div className="card-custom-body p-4 flex-grow-1 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                      {art.articleId}
                    </span>
                    <span className="badge bg-light text-secondary border small">{art.category}</span>
                  </div>

                  <h5 className="fw-bold mb-2 fs-6">
                    <Link to={`/kb/${art.articleId}`} className="text-dark text-decoration-none">
                      {art.title}
                    </Link>
                  </h5>

                  <p className="text-muted small mb-3 flex-grow-1" style={{ lineHeight: 1.5 }}>
                    {art.problemSummary}
                  </p>

                  {/* Tags */}
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {art.tags?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="badge bg-light text-muted border small" style={{ fontSize: '0.65rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Stats */}
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top small text-muted">
                    <div className="d-flex align-items-center gap-3">
                      <span><i className="bi bi-eye me-1"></i>{art.views}</span>
                      <span className="text-success"><i className="bi bi-hand-thumbs-up me-1"></i>{art.helpfulVotes}</span>
                    </div>
                    <Link to={`/kb/${art.articleId}`} className="text-primary fw-semibold text-decoration-none">
                      Read Guide &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-journal-x fs-1 d-block mb-2"></i>
            <p className="fw-semibold">No articles found matching your search.</p>
            <button className="btn btn-link btn-sm text-decoration-none" onClick={() => { setSearch(''); setCategory('all'); }}>
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseList;
