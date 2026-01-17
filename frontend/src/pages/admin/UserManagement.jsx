import { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Form, Input, Select } from 'antd';
import { userService } from '../../services/userService';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ visible: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditModal({ visible: true, user });
  };

  const handleDelete = async (userId) => {
    try {
      await userService.deleteUser(userId);
      message.success('User deleted');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

const handleSave = async (values) => {
  try {
    const payload = { ...values };
    // Remove password if editing and empty
    if (editModal.user && !values.password) {
      delete payload.password;
    }
    if (editModal.user._id) {
      await userService.updateUser(editModal.user._id, payload);
      message.success('User updated');
    } else {
      await userService.createUser(payload);
      message.success('User created');
    }
    setEditModal({ visible: false, user: null });
    fetchUsers();
  } catch (error) {
    message.error('Failed to save user');
  }
};

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (isActive ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => handleEdit(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editModal.user ? 'Edit User' : 'Create User'}
        open={editModal.visible}
        onCancel={() => setEditModal({ visible: false, user: null })}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={editModal.user || {}}
          onFinish={handleSave}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
  name="password"
  label="Password"
  rules={[
    { required: !editModal.user, message: 'Password is required for new users' },
    { min: 6, message: 'Password must be at least 6 characters' },
  ]}
>
  <Input.Password placeholder={editModal.user ? 'Leave blank to keep current' : ''} />
</Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="data_entry">Data Entry</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Select defaultValue={true}>
              <Select.Option value={true}>Yes</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}