import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';
import { getAllUsers, deleteUser, toggleUserStatus, getAllRoles } from '../../../services/userManagementService';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import toast from 'react-hot-toast';

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResult, rolesResult] = await Promise.all([
        getAllUsers(),
        getAllRoles()
      ]);

      if (usersResult?.error) {
        console.error('Error fetching users:', usersResult.error);
        toast?.error('Failed to load users: ' + (usersResult.error?.message || 'Unknown error'));
      } else {
        setUsers(usersResult?.data || []);
      }

      if (rolesResult?.error) {
        console.error('Error fetching roles:', rolesResult.error);
        toast?.error('Failed to load roles: ' + (rolesResult.error?.message || 'Unknown error'));
        setRoles([]);
      } else {
        console.log('Roles loaded successfully:', rolesResult?.data);
        setRoles(rolesResult?.data || []);
        if (!rolesResult?.data || rolesResult?.data?.length === 0) {
          console.warn('No roles found in database. Please check if user_roles table has data.');
          toast?.error('No roles available. Please ensure roles are seeded in the database.');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast?.error('Failed to load data: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const { data, error } = await toggleUserStatus(userId, !currentStatus);
      if (error) throw error;

      setUsers(prev => prev?.map(u => u?.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast?.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast?.error(error?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await deleteUser(userId);
      if (error) throw error;

      setUsers(prev => prev?.filter(u => u?.id !== userId));
      toast?.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast?.error(error?.message || 'Failed to delete user');
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev?.map(u => u?.id === updatedUser?.id ? updatedUser : u));
    setEditingUser(null);
    toast?.success('User updated successfully');
  };

  const handleUserAdded = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    setShowAddModal(false);
    toast?.success('User added successfully');
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = selectedRole === 'all' || user?.userRoles?.roleName === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-700',
      admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      user: 'bg-green-100 text-green-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    return colors?.[roleName] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e?.target?.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles?.map(role => (
              <option key={role?.id} value={role?.roleName}>
                {role?.displayName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>
      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers?.map((user) => (
                <tr key={user?.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {user?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.fullName}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.userRoles?.roleName)}`}>
                      {user?.userRoles?.displayName || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user?.id, user?.isActive)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user?.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' :'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user?.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user?.lastLogin 
                      ? new Date(user.lastLogin)?.toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user?.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          roles={roles}
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          roles={roles}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default UserManagementPanel;