const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Chat with AI Helpdesk Assistant (with RAG & intent classification)
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const userContext = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      department: req.user.department,
      role: req.user.role,
    };

    const aiResult = await aiService.processChat(message, conversationHistory, userContext);

    res.json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create ticket directly from AI chat after employee confirmation
// @route   POST /api/ai/create-ticket
// @access  Private
exports.createTicketFromChat = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category = 'Software',
      priority = 'Medium',
      assetId = null,
      aiSummary = '',
      tags = [],
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required to create a ticket.',
      });
    }

    const validAssetId =
      assetId && mongoose.Types.ObjectId.isValid(assetId) ? assetId : null;

    // Determine SLA deadline based on priority
    const hoursMap = { Urgent: 4, High: 12, Medium: 24, Low: 48 };
    const slaHours = hoursMap[priority] || 24;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id,
      assetId: validAssetId,
      source: 'AI Chatbot',
      slaDeadline,
      slaStatus: 'Within SLA',
      aiTroubleshootingAttempted: true,
      aiSummary: aiSummary || 'Created automatically following AI Helpdesk troubleshooting session.',
      tags: [...tags, 'AI-Assisted', 'Chatbot-Escalation'],
      activityLog: [
        {
          action: 'Ticket Created via AI Chatbot',
          performedBy: req.user._id,
          details: `Issue escalated from AI Helpdesk Assistant session. Priority: ${priority}`,
          timestamp: new Date(),
        },
      ],
    });

    await ticket.save();

    // Notify IT Managers & Admins for Dispatch
    try {
      const itManagers = await User.find({ role: { $in: ['IT Manager', 'Admin'] } });
      for (const mgr of itManagers) {
        await Notification.create({
          recipient: mgr._id,
          title: `📋 Action Required: Assign ${ticket.ticketId}`,
          message: `AI escalated issue from ${req.user.name}: "${ticket.title}" (${ticket.priority}). Please assign a technician.`,
          type: 'TICKET_CREATED',
          link: `/tickets/${ticket._id}`,
        });
      }

      // Notify Employee
      await Notification.create({
        recipient: req.user._id,
        title: `AI Escalated Ticket ${ticket.ticketId} Created`,
        message: `Your ticket has been placed in the IT Management dispatch queue for technician assignment.`,
        type: 'TICKET_CREATED',
        link: `/tickets/${ticket._id}`,
      });
    } catch (err) {
      console.warn('Notification error:', err.message);
    }

    await ticket.populate('createdBy', 'name email department phone');

    res.status(201).json({
      success: true,
      message: 'Support ticket successfully raised and sent to IT Management queue.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
