const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const KnowledgeBase = require('../models/KnowledgeBase');
const User = require('../models/User');

// @desc    Get dashboard metrics tailored to the requesting user's role
// @route   GET /api/dashboard/metrics
// @access  Private
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    // Refresh SLA statuses for active tickets
    const activeTickets = await Ticket.find({ status: { $in: ['Open', 'In Progress', 'Pending', 'Reopened'] } });
    for (const t of activeTickets) {
      t.checkAndUpdateSLA();
      await t.save();
    }

    if (role === 'Admin' || role === 'IT Manager') {
      // 1. Overall ticket counts
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        breachedSla,
        atRiskSla,
        urgentTickets,
        unassignedCount,
      ] = await Promise.all([
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: 'Open' }),
        Ticket.countDocuments({ status: 'In Progress' }),
        Ticket.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ slaStatus: 'Breached', status: { $nin: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ slaStatus: 'At Risk', status: { $nin: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ priority: 'Urgent', status: { $nin: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ assignedTo: null, status: { $nin: ['Resolved', 'Closed'] } }),
      ]);

      // 2. Unassigned tickets pending manager assignment
      const unassignedTickets = await Ticket.find({ assignedTo: null, status: { $nin: ['Resolved', 'Closed'] } })
        .populate('createdBy', 'name email department')
        .sort({ priority: -1, createdAt: -1 })
        .limit(6);

      // 3. Category distribution
      const categoryDistribution = await Ticket.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // 4. Priority distribution
      const priorityDistribution = await Ticket.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]);

      // 5. Technician workload
      const technicians = await User.find({ role: { $in: ['Technician', 'IT Manager'] } }).select('name email specialization department');
      const techWorkload = await Promise.all(
        technicians.map(async (tech) => {
          const activeCount = await Ticket.countDocuments({
            assignedTo: tech._id,
            status: { $in: ['In Progress', 'Pending', 'Reopened'] },
          });
          const resolvedCount = await Ticket.countDocuments({
            assignedTo: tech._id,
            status: { $in: ['Resolved', 'Closed'] },
          });
          return {
            id: tech._id,
            name: tech.name,
            specialization: tech.specialization,
            activeTickets: activeCount,
            resolvedTickets: resolvedCount,
          };
        })
      );

      // 6. Asset overview
      const [
        totalAssets,
        inUseAssets,
        inStorageAssets,
        underRepairAssets,
        expiringWarranties,
      ] = await Promise.all([
        Asset.countDocuments(),
        Asset.countDocuments({ status: 'In Use' }),
        Asset.countDocuments({ status: 'In Storage' }),
        Asset.countDocuments({ status: 'Under Repair' }),
        Asset.countDocuments({
          warrantyExpiry: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      // 7. Recent Tickets
      const recentTickets = await Ticket.find()
        .populate('createdBy', 'name email department')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(6);

      return res.json({
        success: true,
        role,
        metrics: {
          tickets: {
            total: totalTickets,
            open: openTickets,
            inProgress: inProgressTickets,
            resolved: resolvedTickets,
            breachedSla,
            atRiskSla,
            urgent: urgentTickets,
            unassignedCount,
            slaComplianceRate: totalTickets > 0
              ? Math.round(((totalTickets - breachedSla) / totalTickets) * 100)
              : 100,
          },
          unassignedTickets,
          categoryDistribution,
          priorityDistribution,
          techWorkload,
          assets: {
            total: totalAssets,
            inUse: inUseAssets,
            inStorage: inStorageAssets,
            underRepair: underRepairAssets,
            expiringWarranties,
          },
          recentTickets,
        },
      });
    }

    if (role === 'Technician') {
      const [
        assignedToMe,
        inProgressMe,
        resolvedMe,
        urgentMe,
        unassignedQueue,
        atRiskMe,
      ] = await Promise.all([
        Ticket.countDocuments({ assignedTo: userId, status: { $nin: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ assignedTo: userId, status: 'In Progress' }),
        Ticket.countDocuments({ assignedTo: userId, status: { $in: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ assignedTo: userId, priority: 'Urgent', status: { $nin: ['Resolved', 'Closed'] } }),
        Ticket.countDocuments({ assignedTo: null, status: 'Open' }),
        Ticket.countDocuments({ assignedTo: userId, slaStatus: { $in: ['At Risk', 'Breached'] }, status: { $nin: ['Resolved', 'Closed'] } }),
      ]);

      const myActiveTickets = await Ticket.find({
        assignedTo: userId,
        status: { $nin: ['Resolved', 'Closed'] },
      })
        .populate('createdBy', 'name department')
        .sort({ slaDeadline: 1 })
        .limit(6);

      const unassignedTickets = await Ticket.find({ assignedTo: null, status: 'Open' })
        .populate('createdBy', 'name department')
        .sort({ priority: -1, createdAt: -1 })
        .limit(6);

      return res.json({
        success: true,
        role,
        metrics: {
          assignedToMe,
          inProgressMe,
          resolvedMe,
          urgentMe,
          unassignedQueue,
          atRiskMe,
          myActiveTickets,
          unassignedTickets,
        },
      });
    }

    if (role === 'Asset Manager') {
      const [
        totalAssets,
        inUse,
        inStorage,
        underRepair,
        retired,
        expiringSoon,
      ] = await Promise.all([
        Asset.countDocuments(),
        Asset.countDocuments({ status: 'In Use' }),
        Asset.countDocuments({ status: 'In Storage' }),
        Asset.countDocuments({ status: 'Under Repair' }),
        Asset.countDocuments({ status: 'Retired' }),
        Asset.countDocuments({
          warrantyExpiry: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      const categoryBreakdown = await Asset.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalCost: { $sum: '$purchaseCost' } } },
      ]);

      const totalInventoryValue = await Asset.aggregate([
        { $group: { _id: null, total: { $sum: '$purchaseCost' } } },
      ]);

      const recentAssets = await Asset.find()
        .populate('assignedTo', 'name email department')
        .sort({ createdAt: -1 })
        .limit(6);

      const upcomingWarrantyAssets = await Asset.find({
        warrantyExpiry: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      })
        .populate('assignedTo', 'name department')
        .sort({ warrantyExpiry: 1 })
        .limit(6);

      return res.json({
        success: true,
        role,
        metrics: {
          totalAssets,
          inUse,
          inStorage,
          underRepair,
          retired,
          expiringSoon,
          totalInventoryValue: totalInventoryValue[0]?.total || 0,
          categoryBreakdown,
          recentAssets,
          upcomingWarrantyAssets,
        },
      });
    }

    // Default: Employee View
    const [
      myTotalTickets,
      myOpenTickets,
      myResolvedTickets,
      myAssignedAssetsCount,
    ] = await Promise.all([
      Ticket.countDocuments({ createdBy: userId }),
      Ticket.countDocuments({ createdBy: userId, status: { $in: ['Open', 'In Progress', 'Pending', 'Reopened'] } }),
      Ticket.countDocuments({ createdBy: userId, status: { $in: ['Resolved', 'Closed'] } }),
      Asset.countDocuments({ assignedTo: userId }),
    ]);

    const myTickets = await Ticket.find({ createdBy: userId })
      .populate('assignedTo', 'name specialization avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const myAssets = await Asset.find({ assignedTo: userId })
      .sort({ purchaseDate: -1 });

    const recommendedArticles = await KnowledgeBase.find({ status: 'Approved' })
      .sort({ helpfulVotes: -1 })
      .limit(4)
      .select('articleId title category problemSummary helpfulVotes');

    return res.json({
      success: true,
      role,
      metrics: {
        myTotalTickets,
        myOpenTickets,
        myResolvedTickets,
        myAssignedAssetsCount,
        myTickets,
        myAssets,
        recommendedArticles,
      },
    });
  } catch (error) {
    next(error);
  }
};
