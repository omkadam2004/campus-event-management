import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, ArrowRight, LayoutDashboard, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const AdminPanel = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/events/${id}/status`, { status });
      toast.success(`Event ${status} successfully!`);
      // Refresh events
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      toast.error('Failed to update event status');
    }
  };

  const pendingEvents = events.filter(e => e.status === 'pending');
  const approvedEvents = events.filter(e => e.status === 'approved');

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Control Panel</h1>
          <p className="text-gray-500">Manage all campus events and approvals.</p>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-amber-600 font-bold bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5" />
            <span>{pendingEvents.length} Pending</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            <CheckCircle className="w-5 h-5" />
            <span>{approvedEvents.length} Approved</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {pendingEvents.length > 0 ? (
            pendingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                    <img 
                      src={event.poster_url ? event.poster_url : `https://picsum.photos/seed/${event.id}/200/200`} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{event.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> By {event.organizer_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <Link 
                    to={`/event/${event.id}`}
                    className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="View Details"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleStatusUpdate(event.id, 'approved')}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center space-x-2 bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(event.id, 'rejected')}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center space-x-2 bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
              <p>No pending event proposals at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* All Events Table */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="w-6 h-6 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-900">All Events History</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest font-black">
                  <th className="px-8 py-5">Event</th>
                  <th className="px-8 py-5">Organizer</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => (
                  <tr key={event.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900">{event.title}</div>
                      <div className="text-xs text-gray-500">{event.category}</div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-600">{event.organizer_name}</td>
                    <td className="px-8 py-5 text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        event.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        event.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link to={`/event/${event.id}`} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center justify-end">
                        Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
