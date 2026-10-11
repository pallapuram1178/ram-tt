const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all tickets with filters, pagination, and role scoping
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      search,
      slaStatus,
      scope, // 'all', 'assigned-to-me', 'created-by-me'
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Role-based visibility scoping
    if (req.user.role === 'Employee') {
      // Employees only see their own tickets
      query.createdBy = req.user._id;
    } else if (scope === 'created-by-me') {
      query.createdBy = req.user._id;
    } else if (scope === 'assigned-to-me') {
      query.assignedTo = req.user._id;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Assignee filter (for admins/managers)
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    // SLA status filter
    if (slaStatus && slaStatus !== 'all') {
      query.slaStatus = slaStatus;
    }

    // Search filter (ticket ID, title, description)
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('createdBy', 'name email department phone avatar')
        .populate('assignedTo', 'name email role specialization avatar')
        .populate('assetId', 'assetTag name category model')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Ticket.countDocuments(query),
    ]);

    // Recalculate SLA status in real time for open tickets
    tickets.forEach((ticket) => {
      ticket.checkAndUpdateSLA();
    });

    res.json({
      success: true,
      count: tickets.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket by ID or ticketId
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let ticket;
    if (id.startsWith('TICK-')) {
      ticket = await Ticket.findOne({ ticketId: id });
    } else {
      ticket = await Ticket.findById(id);
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role-based authorization check
    if (
      req.user.role === 'Employee' &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this ticket.',
      });
    }

    ticket.checkAndUpdateSLA();
    await ticket.save();

    await ticket.populate('createdBy', 'name email department phone avatar');
    await ticket.populate('assignedTo', 'name email role department specialization avatar');
    await ticket.populate('assetId', 'assetTag name category model serialNumber warrantyExpiry status');
    await ticket.populate('comments.user', 'name email role avatar');
    await ticket.populate('activityLog.performedBy', 'name email role');

    // Filter out internal comments for regular employees
    let comments = ticket.comments;
    if (req.user.role === 'Employee') {
      comments = comments.filter((c) => !c.isInternal);
    }

    const ticketObj = ticket.toObject();
    ticketObj.comments = comments;

    res.json({
      success: true,
      data: ticketObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority = 'Medium',
      assetId,
      source = 'Portal',
      aiTroubleshootingAttempted = false,
      aiSummary = '',
      tags = [],
    } = req.body;

    // Determine SLA deadline based on priority
    const hoursMap = { Urgent: 4, High: 12, Medium: 24, Low: 48 };
    const slaHours = hoursMap[priority] || 24;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const validAssetId =
      assetId && mongoose.Types.ObjectId.isValid(assetId) ? assetId : null;

    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id,
      assetId: validAssetId,
      source,
      slaDeadline,
      slaStatus: 'Within SLA',
      aiTroubleshootingAttempted,
      aiSummary,
      tags,
      activityLog: [
        {
          action: 'Ticket Created',
          performedBy: req.user._id,
          details: `Ticket submitted via ${source} with priority ${priority}`,
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
          message: `Employee ${req.user.name} raised "${ticket.title}" (${ticket.priority}). Review and assign a technician.`,
          type: 'TICKET_CREATED',
          link: `/tickets/${ticket._id}`,
        });
      }

      // Notify Creator (Employee)
      await Notification.create({
        recipient: req.user._id,
        title: `Ticket ${ticket.ticketId} Submitted`,
        message: `Your ticket "${ticket.title}" has been sent to IT Management for review and technician dispatch.`,
        type: 'TICKET_CREATED',
        link: `/tickets/${ticket._id}`,
      });
    } catch (notifErr) {
      console.warn('Could not create notification:', notifErr.message);
    }

    await ticket.populate('createdBy', 'name email department phone');
    await ticket.populate('assetId', 'assetTag name category');

    res.status(201).json({
      success: true,
      message: 'Ticket created and routed to IT Management for technician assignment.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket details
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only creators (if open) or IT staff can edit ticket details
    if (
      req.user.role === 'Employee' &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this ticket.' });
    }

    const { title, description, category, priority, assetId } = req.body;

    let changes = [];
    if (title && title !== ticket.title) {
      changes.push(`Title changed from "${ticket.title}" to "${title}"`);
      ticket.title = title;
    }
    if (description && description !== ticket.description) {
      changes.push('Description updated');
      ticket.description = description;
    }
    if (category && category !== ticket.category) {
      changes.push(`Category changed from ${ticket.category} to ${category}`);
      ticket.category = category;
    }
    if (priority && priority !== ticket.priority) {
      changes.push(`Priority changed from ${ticket.priority} to ${priority}`);
      ticket.priority = priority;

      // Adjust SLA if priority changes
      const hoursMap = { Urgent: 4, High: 12, Medium: 24, Low: 48 };
      const hours = hoursMap[priority] || 24;
      ticket.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
    }
    if (assetId !== undefined) {
      ticket.assetId = assetId || null;
      changes.push('Associated asset updated');
    }

    if (changes.length > 0) {
      ticket.activityLog.push({
        action: 'Ticket Details Updated',
        performedBy: req.user._id,
        details: changes.join('; '),
        timestamp: new Date(),
      });
    }

    await ticket.save();

    await ticket.populate('createdBy', 'name email department phone');
    await ticket.populate('assignedTo', 'name email role');
    await ticket.populate('assetId', 'assetTag name category');

    res.json({
      success: true,
      message: 'Ticket updated successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ticket to technician (by IT Manager or Admin)
// @route   PUT /api/tickets/:id/assign
// @access  Private (Admin, IT Manager, Technician)
exports.assignTicket = async (req, res, next) => {
  try {
    const { technicianId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    let technicianName = 'Unassigned';
    if (technicianId) {
      const tech = await User.findById(technicianId);
      if (!tech) {
        return res.status(404).json({ success: false, message: 'Technician not found' });
      }
      ticket.assignedTo = tech._id;
      technicianName = tech.name;

      // Update status to In Progress if currently Open
      if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }

      // 1. Notify Assigned Technician
      await Notification.create({
        recipient: tech._id,
        title: `🚨 Ticket Assigned: ${ticket.ticketId}`,
        message: `${req.user.name} (${req.user.role}) assigned ticket "${ticket.title}" (${ticket.priority}) to you.`,
        type: 'TICKET_ASSIGNED',
        link: `/tickets/${ticket._id}`,
      });

      // 2. Notify Ticket Creator (Employee) that manager has assigned a technician
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: ticket.createdBy,
          title: `Technician Dispatched for ${ticket.ticketId}`,
          message: `IT Manager ${req.user.name} assigned technician ${technicianName} to work on your issue.`,
          type: 'TICKET_ASSIGNED',
          link: `/tickets/${ticket._id}`,
        });
      }
    } else {
      ticket.assignedTo = null;
    }

    ticket.activityLog.push({
      action: 'Technician Assigned by IT Management',
      performedBy: req.user._id,
      details: `Assigned to ${technicianName} by ${req.user.name} (${req.user.role})`,
      timestamp: new Date(),
    });

    await ticket.save();
    await ticket.populate('assignedTo', 'name email role specialization');

    res.json({
      success: true,
      message: `Ticket ${ticket.ticketId} successfully assigned to ${technicianName}`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status (e.g., In Progress, Resolved, Closed, Reopened)
// @route   PUT /api/tickets/:id/status
// @access  Private
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role restrictions on status changes
    if (req.user.role === 'Employee') {
      if (status !== 'Closed' && status !== 'Reopened') {
        return res.status(403).json({
          success: false,
          message: 'Employees can only close or reopen their own tickets.',
        });
      }
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    }

    const previousStatus = ticket.status;
    ticket.status = status;

    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
      if (resolutionNotes) {
        ticket.resolutionNotes = resolutionNotes;
      }
    } else if (status === 'Closed') {
      ticket.closedAt = new Date();
    } else if (status === 'Reopened') {
      ticket.resolvedAt = null;
      ticket.closedAt = null;
    }

    ticket.checkAndUpdateSLA();

    ticket.activityLog.push({
      action: 'Status Changed',
      performedBy: req.user._id,
      details: `Status transitioned from ${previousStatus} to ${status}${
        resolutionNotes ? `. Resolution: ${resolutionNotes}` : ''
      }`,
      timestamp: new Date(),
    });

    await ticket.save();

    // Notify ticket requester
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.createdBy,
        title: `Ticket ${ticket.ticketId} Status: ${status}`,
        message: `Your ticket "${ticket.title}" has been updated to ${status}.`,
        type: 'TICKET_UPDATED',
        link: `/tickets/${ticket._id}`,
      });
    }

    res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { message, isInternal = false, attachments = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment message is required.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only IT staff can post internal notes
    const actualIsInternal = req.user.role === 'Employee' ? false : isInternal;

    ticket.comments.push({
      user: req.user._id,
      message,
      isInternal: actualIsInternal,
      attachments,
      createdAt: new Date(),
    });

    ticket.activityLog.push({
      action: actualIsInternal ? 'Internal Note Added' : 'Public Comment Added',
      performedBy: req.user._id,
      details: `Comment posted: "${message.length > 50 ? message.substring(0, 47) + '...' : message}"`,
      timestamp: new Date(),
    });

    await ticket.save();
    await ticket.populate('comments.user', 'name email role avatar');

    // Notify assigned technician or requester
    if (!actualIsInternal) {
      const recipientId =
        req.user.role === 'Employee' ? ticket.assignedTo : ticket.createdBy;

      if (recipientId && recipientId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: recipientId,
          title: `New Comment on ${ticket.ticketId}`,
          message: `${req.user.name} commented on "${ticket.title}"`,
          type: 'COMMENT_ADDED',
          link: `/tickets/${ticket._id}`,
        });
      }
    }

    res.json({
      success: true,
      message: 'Comment added successfully.',
      data: ticket.comments,
    });
  } catch (error) {
    next(error);
  }
};
