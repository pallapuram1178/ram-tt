import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container-custom">
        {toasts.map((toast) => {
          let bgClass = 'bg-success text-white';
          let icon = 'bi-check-circle-fill';

          if (toast.type === 'error') {
            bgClass = 'bg-danger text-white';
            icon = 'bi-exclamation-octagon-fill';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-warning text-dark';
            icon = 'bi-exclamation-triangle-fill';
          } else if (toast.type === 'info') {
            bgClass = 'bg-primary text-white';
            icon = 'bi-info-circle-fill';
          }

          return (
            <div
              key={toast.id}
              className={`toast show align-items-center ${bgClass} border-0 shadow-lg`}
              role="alert"
              style={{ minWidth: '300px', borderRadius: '10px' }}
            >
              <div className="d-flex p-2">
                <div className="toast-body d-flex align-items-center gap-2">
                  <i className={`bi ${icon} fs-5`}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
                </div>
                <button
                  type="button"
                  className={`btn-close ${toast.type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto`}
                  onClick={() => removeToast(toast.id)}
                ></button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
