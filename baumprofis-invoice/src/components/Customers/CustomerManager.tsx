import { useState } from 'react'
import { useCustomers } from '../../hooks/useCustomers'
import type { Customer } from '../../hooks/useCustomers'

interface CustomerFormData {
  name: string
  email: string
  phone: string
  address: string
}

export const CustomerManager = () => {
  const {
    customers,
    loading,
    searchTerm,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers()

  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    })
    setEditingCustomer(null)
    setShowForm(false)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id!, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
        alert('Customer updated successfully!')
      } else {
        await createCustomer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
        alert('Customer created successfully!')
      }
      resetForm()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (!customer.id) return

    if (window.confirm(`Are you sure you want to delete "${customer.name}"? This action cannot be undone.`)) {
      try {
        await deleteCustomer(customer.id)
        alert('Customer deleted successfully!')
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Error deleting customer. Please try again.')
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
        <p className="text-gray-600">Search, add, and manage your customers</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search customers by name, email, or address..."
              value={searchTerm}
              onChange={(e) => searchCustomers(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* Customer Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Add Customer')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          Customers ({customers.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="loading"></div>
            <p className="text-gray-600 mt-2">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No customers found.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Your First Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Contact</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Address</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Created</th>
                  <th className="border border-gray-200 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="font-medium">{customer.name}</div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="text-sm">
                        {customer.email && (
                          <div className="text-gray-700">{customer.email}</div>
                        )}
                        {customer.phone && (
                          <div className="text-gray-600">{customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {customer.address}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="text-sm text-gray-600">
                        {new Date(customer.createdAt).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
