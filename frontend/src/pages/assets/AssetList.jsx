import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AssetList = () => {
  const { user, isEmployee, isITStaff, isAssetManager, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [warrantyStatus, setWarrantyStatus] = useState(searchParams.get('warrantyStatus') || 'all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAssets();
  }, [category, status, warrantyStatus, page]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        category: category !== 'all' ? category : undefined,
        status: status !== 'all' ? status : undefined,
        warrantyStatus: warrantyStatus !== 'all' ? warrantyStatus : undefined,
        search: search.trim() ? search.trim() : undefined,
      };

      const res = await api.get('/assets', { params });
      if (res.data.success) {
        setAssets(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  };

  const getStatusBadge = (assetStatus) => {
    switch (assetStatus) {
      case 'In Use':
        return <span className="badge bg-success-subtle text-success border border-success-subtle">In Use</span>;
      case 'In Storage':
        return <span className="badge bg-info-subtle text-info border border-info-subtle">In Storage</span>;
      case 'Under Repair':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Under Repair</span>;
      case 'Retired':
        return <span className="badge bg-secondary-subtle text-secondary border">Retired</span>;
      default:
        return <span className="badge bg-light text-dark border">{assetStatus}</span>;
    }
  };

  const getWarrantyBadge = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.round((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="badge bg-danger text-white">Expired</span>;
    }
    if (diffDays <= 60) {
      return <span className="badge bg-warning text-dark">{diffDays}d left</span>;
    }
    return <span className="badge bg-light text-success border">{expiry.toLocaleDateString()}</span>;
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            {isEmployee ? 'My Assigned Assets' : 'Asset Management & Inventory'}
          </h3>
          <p className="text-muted small mb-0">
            Hardware lifecycle, warranty tracking, software licenses, and repair logs
          </p>
        </div>

        {(isITStaff || isAssetManager || isAdmin) && (
          <Link to="/assets/create" className="btn btn-primary btn-sm fw-semibold shadow-sm d-flex align-items-center gap-1">
            <i className="bi bi-plus-circle"></i> Register New Asset
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-custom mb-4">
        <div className="card-custom-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search Asset Tag, device name, serial number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              >
                <option value="all">All Asset Categories</option>
                <option value="Laptop">Laptops</option>
                <option value="Desktop">Desktops</option>
                <option value="Server">Servers</option>
                <option value="Software License">Software Licenses</option>
                <option value="Network Device">Network Devices</option>
                <option value="Peripheral">Peripherals & Monitors</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="all">All Statuses</option>
                <option value="In Use">In Use</option>
                <option value="In Storage">In Storage</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={warrantyStatus}
                onChange={(e) => { setWarrantyStatus(e.target.value); setPage(1); }}
              >
                <option value="all">All Warranties</option>
                <option value="active">Active Warranty</option>
                <option value="expiring-soon">Expiring in 30 Days</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="col-6 col-md-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setStatus('all');
                  setWarrantyStatus('all');
                  setPage(1);
                }}
                title="Reset filters"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Asset Inventory Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Device / Software Name</th>
                <th>Category</th>
                <th>Serial / Key</th>
                <th>Assigned To</th>
                <th>Warranty</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted small">Loading asset inventory...</span>
                  </td>
                </tr>
              ) : assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset._id}>
                    <td>
                      <Link to={`/assets/${asset._id}`} className="fw-bold text-primary text-decoration-none small">
                        {asset.assetTag}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold small text-truncate" style={{ maxWidth: '240px' }} title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {asset.model} &bull; {asset.vendor}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border small">{asset.category}</span>
                    </td>
                    <td>
                      <code className="text-dark small">{asset.serialNumber}</code>
                    </td>
                    <td>
                      {asset.assignedTo ? (
                        <div>
                          <div className="small fw-semibold">{asset.assignedTo.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{asset.assignedDepartment}</div>
                        </div>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary">In Storage</span>
                      )}
                    </td>
                    <td>{getWarrantyBadge(asset.warrantyExpiry)}</td>
                    <td>{getStatusBadge(asset.status)}</td>
                    <td className="text-end">
                      <Link to={`/assets/${asset._id}`} className="btn btn-sm btn-light border py-1 px-2" title="View Asset Details">
                        <i className="bi bi-arrow-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted small">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    No assets found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="card-custom-header border-top d-flex justify-content-between align-items-center py-2 px-3">
            <span className="small text-muted">
              Showing page {page} of {totalPages} ({total} assets)
            </span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                &laquo; Prev
              </button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
