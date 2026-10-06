import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Calendar, Users, CheckCircle, Clock, AlertCircle, Bell, ArrowRight, ExternalLink, PlusCircle, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, notificationsRes] = await Promise.all([
          api.get('/events'),
          api.get('/notifications').catch(() => ({ data: [] }))
        ]);
        
        const allEvents = eventsRes.data;
        setNotifications(notificationsRes.data || []);
        
        if (user?.role === 'admin') {
          setStats({
            totalEvents: allEvents.length,
            pendingEvents: allEvents.filter((e: any) => e.status === 'pending').length,
            approvedEvents: allEvents.filter((e: any) => e.status === 'approved').length,
            completedEvents: allEvents.filter((e: any) => new Date(e.date) < new Date(new Date().setHours(0,0,0,0))).length,
          });
          setRecentEvents(allEvents.slice(0, 20));
          setEvents(allEvents.slice(0, 20));
        } else if (user?.role === 'organizer') {
          const myEvents = allEvents.filter((e: any) => String(e.organizer_id) === String(user?.id));
          setStats({
            totalEvents: myEvents.length,
            approvedEvents: myEvents.filter((e: any) => e.status === 'approved').length,
            pendingEvents: myEvents.filter((e: any) => e.status === 'pending').length,
            completedEvents: myEvents.filter((e: any) => new Date(e.date) < new Date(new Date().setHours(0,0,0,0))).length,
          });
          setRecentEvents(myEvents.slice(0, 20));
          setEvents(allEvents.slice(0, 20)); // Show all events to organizers too
        } else {
          const regRes = await api.get('/registrations/my');
          setStats({
            registeredEvents: regRes.data.length,
            attendedEvents: regRes.data.filter((r: any) => r.attendance_status === 'present').length,
            completedEvents: regRes.data.filter((r: any) => new Date(r.event_date) < new Date(new Date().setHours(0,0,0,0))).length,
          });
          
          setRecentEvents(regRes.data.slice(0, 20));
          setEvents(allEvents.slice(0, 20));
        }
      } catch (error) {
        // Silently fail or handle gracefully to remove console clutter
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitoring activity for <span className="text-emerald-600 font-bold">@{user?.name}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-105">
           <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg shadow-slate-200">
              <Calendar className="w-5 h-5" />
           </div>
           <div className="pr-6">
              <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">System Priority</div>
              <div className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
           </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {user?.role === 'student' ? (
          <>
            <StatCard title="Total Registrations" value={stats?.registeredEvents || 0} icon={<Calendar className="w-6 h-6" />} color="bg-slate-900" />
            <StatCard title="Verified Attendance" value={stats?.attendedEvents || 0} icon={<CheckCircle className="w-6 h-6" />} color="bg-emerald-600" />
            <StatCard title="Completed Events" value={stats?.completedEvents || 0} icon={<Clock className="w-6 h-6" />} color="bg-blue-500" />
          </>
        ) : (
          <>
            <StatCard title="Global Assets" value={stats?.totalEvents || 0} icon={<Calendar className="w-6 h-6" />} color="bg-slate-900" />
            <StatCard title="Live Nodes" value={stats?.approvedEvents || 0} icon={<CheckCircle className="w-6 h-6" />} color="bg-emerald-600" />
            <StatCard title="Completed Audits" value={stats?.completedEvents || 0} icon={<FileText className="w-6 h-6" />} color="bg-blue-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-12">
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-3 text-center md:text-left">
                     <h2 className="text-3xl font-black tracking-tight">Deploy New Protocol</h2>
                     <p className="text-slate-400 font-medium max-w-sm leading-relaxed text-sm">Initiate your next symposium, technical workshop, or cultural exchange through the central hub.</p>
                  </div>
                  <Link 
                    to="/create-event"
                    className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center space-x-3 shrink-0 shadow-xl shadow-emerald-900/40"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Initiate Now</span>
                  </Link>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
            </div>
          )}

          {events.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Discover New Events</h2>
                <Link to="/" className="text-indigo-600 text-sm font-bold hover:underline flex items-center">
                  Explore More <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event: any) => (
                  <Link 
                    key={event.id} 
                    to={`/event/${event.id}`}
                    className="group bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col space-y-4"
                  >
                    <div className="relative h-32 rounded-2xl overflow-hidden">
                      <img 
                        src={event.poster_url || `https://picsum.photos/seed/${event.id}/400/300`} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          event.event_type === 'Paid' ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
                        }`}>
                          {event.event_type === 'Paid' ? `₹${event.fee}` : 'FREE'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600">{event.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.role === 'student' ? 'My Registrations' : 'Recent Events'}
              </h2>
              <Link to={user?.role === 'student' ? '/my-registrations' : '/'} className="text-indigo-600 text-sm font-bold hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentEvents.length > 0 ? (
                recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{event.title}</h4>
                      <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        new Date(event.date || event.event_date) < new Date(new Date().setHours(0,0,0,0)) ? 'bg-red-100 text-red-700' :
                        event.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        event.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {new Date(event.date || event.event_date) < new Date(new Date().setHours(0,0,0,0)) ? 'COMPLETED' : (event.status || 'Registered')}
                      </span>
                    </div>
                    <div className="ml-4 flex items-center space-x-3">
                      <Link to={`/event/${event.event_id || event.id}`} className="text-gray-400 hover:text-indigo-600">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No recent activity to show.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      notif.is_read ? 'bg-gray-50 border-gray-100' : 'bg-indigo-50 border-indigo-100 shadow-sm'
                    }`}
                  >
                    <p className={`text-sm ${notif.is_read ? 'text-gray-600' : 'text-indigo-900 font-bold'}`}>
                      {notif.message}
                    </p>
                    <p className={`text-[10px] mt-2 uppercase tracking-widest font-bold ${notif.is_read ? 'text-gray-400' : 'text-indigo-400'}`}>
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No notifications yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

const StatCard = ({ title, value, icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.05)] border border-slate-50 flex items-center space-x-6 transition-all border-b-4 border-b-slate-100"
  >
    <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center shadow-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <p className="text-4xl font-black text-slate-900 tracking-tighter mt-1">{value}</p>
    </div>
  </motion.div>
);

export default Dashboard;
