import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AIChatWidget = ({ isOpen, onClose, onToggle }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **ServiceDesk AI**, your IT Assistant.\n\nDescribe your hardware, software, VPN, or network problem, and I'll search our internal Knowledge Base to help you fix it immediately!`,
      followUpQuestions: [
        'VPN connection fails to authenticate',
        'Outlook is disconnected and not syncing',
        'Laptop battery is draining very fast',
        'Request Docker Desktop license',
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
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
          text: 'I encountered an issue connecting to the AI diagnostic service. Please try again or create a support ticket directly from the portal.',
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
        showToast(`Ticket ${res.data.data.ticketId} created successfully!`, 'success');
        setShowConfirmTicketModal(false);

        // Add confirmation message to chat
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `✅ **Ticket ${res.data.data.ticketId} Raised Successfully!**\n\n- **Title:** ${res.data.data.title}\n- **Priority:** ${res.data.data.priority}\n- **Category:** ${res.data.data.category}\n- **Status:** Open\n\nOur IT support team has been notified and will resolve this within our SLA guarantee.`,
            followUpQuestions: ['View my ticket', 'Ask another question'],
            canCreateTicket: false,
            timestamp: new Date(),
          },
        ]);

        // Option to navigate to ticket
        setTimeout(() => {
          navigate(`/tickets/${res.data.data._id}`);
          onClose();
        }, 1200);
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
          <h6 key={idx} className="fw-bold mt-2 mb-1 text-primary">
            {line.replace('### ', '')}
          </h6>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="p-2 my-2 bg-light border-start border-3 border-info rounded small text-muted">
            {line.replace('> ', '')}
          </div>
        );
      }
      if (line.match(/^\d+\.\s+/)) {
        return (
          <div key={idx} className="d-flex gap-2 mb-1 small">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1" style={{ height: 'fit-content' }}>
              {line.match(/^\d+/)[0]}
            </span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <div key={idx} className="ms-2 mb-1 small text-secondary">
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
          className="mb-1"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]/g, '<span class="badge bg-secondary-subtle text-dark">$1</span>'),
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="floating-ai-btn"
          onClick={onToggle}
          title="Open AI Helpdesk Assistant"
        >
          <span className="ai-pulse-dot"></span>
          <i className="bi bi-robot fs-5"></i>
          <span>AI Helpdesk</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary p-2 d-flex align-items-center justify-content-center text-white"
                style={{ width: '34px', height: '34px' }}
              >
                <i className="bi bi-robot"></i>
              </div>
              <div>
                <div className="fw-bold text-white small">ServiceDesk AI Assistant</div>
                <div className="d-flex align-items-center gap-1 text-light" style={{ fontSize: '0.7rem' }}>
                  <span className="ai-pulse-dot" style={{ width: '7px', height: '7px' }}></span>
                  <span>RAG Knowledge Base Connected</span>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-sm btn-link text-white text-decoration-none p-1"
                onClick={onClose}
                title="Minimize chat"
              >
                <i className="bi bi-dash-lg fs-5"></i>
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="ai-chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                  >
                    <i className="bi bi-robot"></i>
                  </div>
                )}

                <div className="ai-message-bubble">
                  {/* Category / Priority Tag Banner */}
                  {msg.classification && (
                    <div className="d-flex gap-1 mb-2 pb-1 border-bottom">
                      <span className="badge bg-light text-primary border" style={{ fontSize: '0.7rem' }}>
                        <i className="bi bi-tag me-1"></i>
                        {msg.classification.category}
                      </span>
                      <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                        <i className="bi bi-lightning me-1"></i>
                        {msg.classification.priority} Priority
                      </span>
                    </div>
                  )}

                  {/* Formatted Text */}
                  {renderFormattedMarkdown(msg.text)}

                  {/* KB Sources Cited */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-top">
                      <small className="text-muted fw-semibold d-block mb-1" style={{ fontSize: '0.72rem' }}>
                        📚 Knowledge Base References:
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="badge bg-light text-dark border small"
                            style={{ fontSize: '0.7rem', cursor: 'pointer' }}
                            onClick={() => navigate(`/kb/${src.articleId}`)}
                          >
                            <i className="bi bi-book me-1 text-primary"></i>
                            {src.articleId}: {src.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offer Ticket Creation CTA */}
                  {msg.canCreateTicket && msg.ticketDraft && (
                    <div className="mt-3 p-2 bg-primary-subtle border border-primary-subtle rounded-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small fw-bold text-primary">
                          <i className="bi bi-headset me-1"></i> Still need technician help?
                        </span>
                      </div>
                      <p className="small text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                        I can package this diagnosis and raise an official ticket for our IT team.
                      </p>
                      <button
                        className="btn btn-primary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                        onClick={() => handleOpenTicketModal(msg.ticketDraft)}
                      >
                        <i className="bi bi-ticket-perforated"></i> Create Support Ticket
                      </button>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-1">
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
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message assistant">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '28px', height: '28px' }}
                >
                  <i className="bi bi-robot"></i>
                </div>
                <div className="ai-message-bubble">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span>Consulting Knowledge Base & formulating solutions...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
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
                className="form-control form-control-sm rounded-pill px-3"
                placeholder="Describe your IT issue (e.g., VPN dropped, Outlook error)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '34px', height: '34px' }}
                disabled={!inputMessage.trim() || loading}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Creating Ticket */}
      {showConfirmTicketModal && pendingTicketDraft && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-ticket-detailed me-2"></i>
                  Confirm Support Ticket Creation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmTicketModal(false)}
                ></button>
              </div>

              <div className="modal-body p-3">
                <div className="alert alert-info py-2 px-3 small mb-3">
                  <i className="bi bi-info-circle-fill me-1"></i>
                  Please review the ticket parameters generated from your AI conversation before submitting to the IT queue.
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Ticket Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pendingTicketDraft.title}
                    onChange={(e) =>
                      setPendingTicketDraft({ ...pendingTicketDraft, title: e.target.value })
                    }
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted">Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={pendingTicketDraft.category}
                      onChange={(e) =>
                        setPendingTicketDraft({ ...pendingTicketDraft, category: e.target.value })
                      }
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
                      className="form-select form-select-sm"
                      value={pendingTicketDraft.priority}
                      onChange={(e) =>
                        setPendingTicketDraft({ ...pendingTicketDraft, priority: e.target.value })
                      }
                    >
                      <option value="Low">Low (48h SLA)</option>
                      <option value="Medium">Medium (24h SLA)</option>
                      <option value="High">High (12h SLA)</option>
                      <option value="Urgent">Urgent (4h SLA)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Diagnostic Details & Description</label>
                  <textarea
                    className="form-control small"
                    rows="4"
                    value={pendingTicketDraft.description}
                    onChange={(e) =>
                      setPendingTicketDraft({ ...pendingTicketDraft, description: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer bg-light p-2 px-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowConfirmTicketModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1 shadow-sm"
                  onClick={handleConfirmCreateTicket}
                  disabled={submittingTicket}
                >
                  {submittingTicket ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i> Confirm & Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
