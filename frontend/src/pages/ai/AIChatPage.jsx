import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AIChatPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **ServiceDesk Pro AI**, your 24/7 intelligent IT helpdesk partner.\n\nDescribe any hardware fault, software glitch, corporate VPN issue, Outlook sync error, or network breakdown in plain English.\n\nI will retrieve solutions from our company's approved Knowledge Base, walk you through step-by-step troubleshooting, and if needed, automatically create a support ticket with all diagnostic details for our IT technicians.`,
      followUpQuestions: [
        'My VPN is failing to connect with certificate error',
        'Outlook is disconnected and keeps prompting for password',
        'Laptop battery discharges in under 2 hours',
        'Windows Blue Screen of Death (BSOD) after update',
        'Request commercial software license for Docker Desktop',
      ],
      canCreateTicket: false,
      ticketDraft: null,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showConfirmTicketModal, setShowConfirmTicketModal] = useState(false);
  const [pendingTicketDraft, setPendingTicketDraft] = useState(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsgObj = {
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.post('/ai/chat', {
        message: text,
        conversationHistory: historyPayload,
      });

      if (res.data.success) {
        const aiData = res.data.data;
        const assistantMsgObj = {
          sender: 'assistant',
          text: aiData.reply,
          classification: aiData.classification,
          sources: aiData.sources || [],
          followUpQuestions: aiData.followUpQuestions || [],
          canCreateTicket: aiData.canCreateTicket,
          ticketDraft: aiData.ticketDraft,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsgObj]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I encountered an error connecting to the AI diagnostic service. Please try again or create a ticket directly.',
          followUpQuestions: [],
          canCreateTicket: true,
          ticketDraft: {
            title: text,
            description: `Issue reported: ${text}`,
            category: 'Software',
            priority: 'Medium',
          },
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicketModal = (draft) => {
    setPendingTicketDraft(draft);
    setShowConfirmTicketModal(true);
  };

  const handleConfirmCreateTicket = async () => {
    if (!pendingTicketDraft) return;
    setSubmittingTicket(true);

    try {
      const res = await api.post('/ai/create-ticket', pendingTicketDraft);
      if (res.data.success) {
        showToast(`Support Ticket ${res.data.data.ticketId} Created!`, 'success');
        setShowConfirmTicketModal(false);

        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `✅ **Support Ticket Created: [${res.data.data.ticketId} - ${res.data.data.title}]**\n\n- **Status:** Open\n- **Category:** ${res.data.data.category}\n- **Priority:** ${res.data.data.priority}\n- **Assigned SLA:** Within guaranteed SLA timeframe\n\nOur IT support technicians have received your request and will contact you shortly.`,
            followUpQuestions: ['View my ticket', 'Ask another IT question'],
            canCreateTicket: false,
            timestamp: new Date(),
          },
        ]);

        setTimeout(() => {
          navigate(`/tickets/${res.data.data._id}`);
        }, 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create ticket', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const renderFormattedMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h5 key={idx} className="fw-bold mt-3 mb-2 text-primary">
            {line.replace('### ', '')}
          </h5>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="p-3 my-2 bg-light border-start border-4 border-info rounded-3 text-secondary small">
            {line.replace('> ', '')}
          </div>
        );
      }
      if (line.match(/^\d+\.\s+/)) {
        return (
          <div key={idx} className="d-flex gap-3 mb-2">
            <span className="badge bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
              {line.match(/^\d+/)[0]}
            </span>
            <div className="text-dark small" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <div key={idx} className="ms-3 mb-1 small text-secondary">
            • <span dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="py-1"></div>;
      }
      return (
        <p
          key={idx}
          className="mb-2 text-dark"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]/g, '<span class="badge bg-secondary-subtle text-dark">$1</span>'),
          }}
        />
      );
    });
  };

  return (
    <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold mb-0">AI Helpdesk Assistant</h3>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">RAG Powered</span>
          </div>
          <p className="text-muted small mb-0">
            Intelligent troubleshooting with real-time Knowledge Base retrieval and automated ticket escalation
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/kb" className="btn btn-outline-secondary btn-sm fw-semibold">
            <i className="bi bi-book me-1"></i> Browse Knowledge Base
          </Link>
          <Link to="/tickets/create" className="btn btn-outline-primary btn-sm fw-semibold">
            <i className="bi bi-plus-circle me-1"></i> Manual Ticket
          </Link>
        </div>
      </div>

      {/* Main Full-Screen Chat Card */}
      <div className="card-custom flex-grow-1 d-flex flex-column overflow-hidden shadow-sm" style={{ height: '70vh' }}>
        {/* Messages Body */}
        <div className="card-custom-body p-4 flex-grow-1 overflow-y-auto d-flex flex-column gap-3 bg-light">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex gap-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                  style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}
                >
                  <i className="bi bi-robot"></i>
                </div>
              )}

              <div
                className={`p-3 p-md-4 rounded-4 shadow-sm ${
                  msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark border'
                }`}
                style={{ maxWidth: '82%', width: 'fit-content' }}
              >
                {/* Classification Chips */}
                {msg.classification && msg.sender === 'assistant' && (
                  <div className="d-flex gap-2 mb-3 pb-2 border-bottom">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      <i className="bi bi-tag-fill me-1"></i> {msg.classification.category}
                    </span>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                      <i className="bi bi-lightning-charge-fill me-1"></i> {msg.classification.priority} Priority
                    </span>
                  </div>
                )}

                {/* Formatted Content */}
                {renderFormattedMarkdown(msg.text)}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="fw-bold small text-muted mb-2">
                      <i className="bi bi-journal-text me-1"></i> Knowledge Base Sources:
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <Link
                          key={i}
                          to={`/kb/${src.articleId}`}
                          className="badge bg-light text-dark border p-2 text-decoration-none small"
                        >
                          <i className="bi bi-link-45deg me-1 text-primary"></i>
                          {src.articleId}: {src.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escalation Button */}
                {msg.canCreateTicket && msg.ticketDraft && (
                  <div className="mt-3 p-3 bg-primary-subtle border border-primary-subtle rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold small text-primary">
                        <i className="bi bi-headset me-1"></i> Still need technician assistance?
                      </span>
                    </div>
                    <p className="small text-muted mb-3">
                      I can convert this diagnostic analysis into a formal IT support ticket for our technician queue.
                    </p>
                    <button
                      className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-2 shadow-sm"
                      onClick={() => handleOpenTicketModal(msg.ticketDraft)}
                    >
                      <i className="bi bi-ticket-detailed-fill"></i> Create Support Ticket from Diagnosis
                    </button>
                  </div>
                )}

                {/* Suggestion Chips */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-3 pt-2 border-top">
                    <div className="text-muted small fw-semibold mb-2">Suggested Actions & Queries:</div>
                    <div className="d-flex flex-wrap gap-1">
                      {msg.followUpQuestions.map((q, qIndex) => (
                        <button
                          key={qIndex}
                          className="chip-btn"
                          onClick={() => {
                            if (q.toLowerCase().includes('create') && q.toLowerCase().includes('ticket') && msg.ticketDraft) {
                              handleOpenTicketModal(msg.ticketDraft);
                            } else {
                              handleSendMessage(q);
                            }
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="d-flex gap-3">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '38px', height: '38px' }}
              >
                <i className="bi bi-robot"></i>
              </div>
              <div className="p-3 bg-white border rounded-4 shadow-sm">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <span>Searching internal knowledge base & generating troubleshooting steps...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-top">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="d-flex gap-2"
          >
            <input
              type="text"
              className="form-control form-control-lg rounded-pill px-4 fs-6"
              placeholder="Describe your IT issue (e.g., VPN drops, battery draining, Outlook sync loop)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '50px', height: '50px' }}
              disabled={!inputMessage.trim() || loading}
            >
              <i className="bi bi-send-fill fs-5"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmTicketModal && pendingTicketDraft && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-ticket-detailed me-2"></i> Confirm Ticket Creation
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmTicketModal(false)}></button>
              </div>
              <div className="modal-body p-3">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pendingTicketDraft.title}
                    onChange={(e) => setPendingTicketDraft({ ...pendingTicketDraft, title: e.target.value })}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted">Category</label>
                    <select
                      className="form-select"
                      value={pendingTicketDraft.category}
                      onChange={(e) => setPendingTicketDraft({ ...pendingTicketDraft, category: e.target.value })}
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Network">Network</option>
                      <option value="Access & Security">Access & Security</option>
                      <option value="Email & Communication">Email & Communication</option>
                      <option value="Cloud Services">Cloud Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted">Priority</label>
                    <select
                      className="form-select"
                      value={pendingTicketDraft.priority}
                      onChange={(e) => setPendingTicketDraft({ ...pendingTicketDraft, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Issue & Diagnostic Details</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={pendingTicketDraft.description}
                    onChange={(e) => setPendingTicketDraft({ ...pendingTicketDraft, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer bg-light p-2 px-3">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowConfirmTicketModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm fw-semibold"
                  onClick={handleConfirmCreateTicket}
                  disabled={submittingTicket}
                >
                  {submittingTicket ? 'Submitting...' : 'Confirm & Create Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatPage;
