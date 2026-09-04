// src/components/admin/SupportTab.jsx
import { useState, useEffect } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import ActionButton from './ActionButton';
import { getCsrfToken } from '../../lib/csrf';

export default function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = `/.netlify/functions/admin-support-tickets?page=${page}&limit=20`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Failed to fetch tickets:', data.error);
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  const updateTicketStatus = async (ticketId, newStatus) => {
    const key = `status-${ticketId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/.netlify/functions/admin-support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchTickets();
      } else {
        alert(data.error || 'Failed to update status.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      closed: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${map[status] || map.open}`}
      >
        {status}
      </span>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm text-zinc-400 font-medium">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-zinc-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchTickets()}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-xl transition-all"
        >
          Refresh
        </button>
        <span className="text-xs text-zinc-500">
          {total} ticket{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 border border-zinc-800 rounded-xl">
          No support tickets found.
        </div>
      ) : (
        <Table
          headers={['ID', 'User', 'Email', 'Subject', 'Status', 'Actions']}
          rows={tickets.map((ticket) => ({
            cells: [
              <span className="font-mono text-xs text-zinc-400">#{ticket.id}</span>,
              <span className="text-sm font-medium text-white">
                {ticket.user_type} ({ticket.user_id})
              </span>,
              <span className="text-sm text-zinc-300">{ticket.email}</span>,
              <span className="text-sm text-white">{ticket.subject}</span>,
              getStatusBadge(ticket.status),
              <div className="flex flex-wrap gap-1">
                {ticket.status === 'open' && (
                  <ActionButton
                    onClick={() => updateTicketStatus(ticket.id, 'in-progress')}
                    label="In Progress"
                    color="blue"
                    disabled={actionLoading[`status-${ticket.id}`]}
                  />
                )}
                {(ticket.status === 'open' || ticket.status === 'in-progress') && (
                  <ActionButton
                    onClick={() => updateTicketStatus(ticket.id, 'closed')}
                    label="Close"
                    color="green"
                    disabled={actionLoading[`status-${ticket.id}`]}
                  />
                )}
                {ticket.status === 'closed' && (
                  <ActionButton
                    onClick={() => updateTicketStatus(ticket.id, 'open')}
                    label="Reopen"
                    color="yellow"
                    disabled={actionLoading[`status-${ticket.id}`]}
                  />
                )}
                <button
                  onClick={() => {
                    const fullMessage = `From: ${ticket.email}\n\n${ticket.message}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(fullMessage);
                      alert('Message copied to clipboard.');
                    } else {
                      prompt('Copy this message:', fullMessage);
                    }
                  }}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                >
                  Copy
                </button>
              </div>,
            ],
          }))}
        />
      )}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}