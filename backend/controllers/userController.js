import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
// In updateUser function
export const updateUser = async (req, res) => {
  try {
    const { username, email, fullName, role, isActive, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    // Only update password if provided
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-active
// @access  Private/Admin
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      _id: user._id,
      isActive: user.isActive,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

