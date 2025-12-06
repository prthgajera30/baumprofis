import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useInvoices } from '../../hooks/useInvoices'
import { format } from 'date-fns'
import { Search, Filter, FileText, MoreVertical, Eye, Download, Edit } from 'lucide-react'

export const InvoiceHistory = () => {
  const { user } = useAuth()
  const {
    invoices,
    loading,
    hasMore,
    filters,
    stats,
    loadInvoices,
    loadMoreInvoices,
    updateFilters,
    resetFilters,
    setSelectedInvoice
  } = useInvoices()

  console.log('Current user in InvoiceHistory:', user)
  console.log('Current user uid:', user?.uid)
  console.log('Number of invoices found:', invoices.length)

  const [showFilters, setShowFilters] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'finalized': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf'
      case 'finalized': return 'Finalisiert'
      case 'paid': return 'Bezahlt'
      default: return status
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    // Could navigate to invoice detail view
    console.log('View invoice:', invoiceId)
  }

  const handleEditInvoice = (invoiceId: string) => {
    // Could navigate to invoice editor
    console.log('Edit invoice:', invoiceId)
  }

  const handleDownloadPDF = (invoiceId: string) => {
    // Could regenerate PDF for existing invoice
    console.log('Download PDF for invoice:', invoiceId)
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm('Möchten Sie diese Rechnung wirklich als bezahlt markieren?')) return

    try {
      // Here you would update the invoice status to 'paid' in Firestore
      console.log('Marking invoice as paid:', invoiceId)
      // TODO: Implement actual update to Firestore
      alert('Funktionalität wird implementiert')
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Fehler beim Markieren als bezahlt')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rechnungsübersicht</h1>
        <p className="text-gray-600">Verwalten und durchsuchen Sie Ihre gespeicherten Rechnungen</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt Rechnungen</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
          <div className="text-sm text-gray-600">Entwürfe</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{stats.finalized}</div>
          <div className="text-sm text-gray-600">Finalisiert</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{stats.totalRevenue.toFixed(2)} €</div>
          <div className="text-sm text-gray-600">Gesamtumsatz</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Suchen und Filtern</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Filter size={16} />
            {showFilters ? 'Filter ausblenden' : 'Filter anzeigen'}
          </button>
        </div>

        {/* Quick Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechnungsnummer</label>
            <input
              type="text"
              value={filters.invoiceNumber}
              onChange={(e) => updateFilters({ invoiceNumber: e.target.value })}
              placeholder="z.B. 04138"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
            <input
              type="text"
              value={filters.customerName}
              onChange={(e) => updateFilters({ customerName: e.target.value })}
              placeholder="Kundenname"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Status</option>
              <option value="draft">Entwurf</option>
              <option value="finalized">Finalisiert</option>
              <option value="paid">Bezahlt</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Von Datum</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bis Datum</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilters({ dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={loadInvoices}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Search size={16} />
            Suchen
          </button>
          <button
            onClick={resetFilters}
            className="btn btn-ghost"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="loading"></div>
            <p className="text-gray-600 mt-2">Rechnungen werden geladen...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Keine Rechnungen gefunden.</p>
            {Object.values(filters).some(v => v) && (
              <button
                onClick={resetFilters}
                className="mt-2 text-blue-600 hover:underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rechnung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.object}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {invoice.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(invoice.createdAt), 'dd.MM.yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.totalAmount.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleViewInvoice(invoice.id!)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ansehen"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice.id!)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Bearbeiten"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice.id!)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="PDF herunterladen"
                        >
                          <Download size={16} />
                        </button>
                        {invoice.status === 'finalized' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id!)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Als bezahlt markieren"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center p-4 border-t">
            <button
              onClick={loadMoreInvoices}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Mehr laden...
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
