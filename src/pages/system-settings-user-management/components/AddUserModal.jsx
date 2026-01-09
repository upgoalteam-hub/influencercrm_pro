import React, { useState, useEffect } from 'react';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';
import { createUser } from '../../../services/userManagementService';

const AddUserModal = ({ roles, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    roleId: '',
    isActive: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log roles when component mounts or roles change
  useEffect(() => {
    console.log('AddUserModal - Roles received:', roles);
    console.log('AddUserModal - Roles type:', typeof roles);
    console.log('AddUserModal - Is array:', Array.isArray(roles));
    console.log('AddUserModal - Roles length:', roles?.length);
    if (roles && Array.isArray(roles) && roles.length > 0) {
      console.log('AddUserModal - First role sample:', roles[0]);
      console.log('AddUserModal - Role keys:', Object.keys(roles[0]));
    } else if (roles && !Array.isArray(roles)) {
      console.error('AddUserModal - Roles is not an array!', roles);
    }
  }, [roles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!formData?.email || !formData?.fullName || !formData?.password || !formData?.roleId) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData?.password?.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await createUser(formData);
      if (error) throw error;

      onUserAdded(data);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData?.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData?.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="roleId"
              value={formData?.roleId || ''}
              onChange={(e) => {
                console.log('Role selected:', e.target.value);
                handleChange(e);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              required
              disabled={!roles || !Array.isArray(roles) || roles.length === 0}
            >
              <option value="">
                {!roles ? 'Loading roles...' : 
                 !Array.isArray(roles) ? 'Error loading roles' :
                 roles.length === 0 ? 'No roles available' :
                 'Select a role'}
              </option>
              {roles && Array.isArray(roles) && roles.length > 0 ? (
                roles.map(role => {
                  const roleId = role?.id || role?.roleId;
                  const displayName = role?.displayName || role?.display_name || role?.roleName || role?.role_name || 'Unknown Role';
                  if (!roleId) {
                    console.warn('Role missing ID:', role);
                    return null;
                  }
                  return (
                    <option key={roleId} value={roleId}>
                      {displayName}
                    </option>
                  );
                }).filter(Boolean)
              ) : null}
            </select>
            {roles && Array.isArray(roles) && roles.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-1">⚠️ No roles available</p>
                <p className="text-xs text-yellow-700">
                  The user_roles table appears to be empty. Please ensure the database migration has been run and roles have been seeded.
                </p>
              </div>
            )}
            {roles === null && (
              <p className="text-xs text-red-500 mt-1">Failed to load roles. Please check the console for errors.</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData?.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Active user
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;