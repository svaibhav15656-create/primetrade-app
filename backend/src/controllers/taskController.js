const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const query = {};

    // If simple user, only show their tasks
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    // Filtering
    const { status, priority, page = 1, limit = 10 } = req.query;

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const limitNum = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * limitNum;

    const tasks = await Task.find(query).skip(skip).limit(limitNum).sort('-createdAt');
    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check auth
    if (req.user.role !== 'admin' && task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Invalid ID or Server Error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    const newTask = await Task.create({
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      userId: req.user._id,
      userName: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Invalid ID or Server Error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Invalid ID or Server Error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    
    // Using aggregation for performance
    const statsResult = await Task.aggregate([
      {
        $group: {
          _id: null,
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);

    const stats = statsResult[0] || {
      pending: 0, inProgress: 0, completed: 0,
      low: 0, medium: 0, high: 0
    };

    res.status(200).json({ 
      success: true, 
      data: {
        total,
        byStatus: {
          pending: stats.pending,
          'in-progress': stats.inProgress,
          completed: stats.completed
        },
        byPriority: {
          low: stats.low,
          medium: stats.medium,
          high: stats.high
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
