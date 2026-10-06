import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Calendar, MapPin, Users, Search, Filter, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { io } from 'socket.io-client';

const Home = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed'>('Upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        // Silently fail or handled by error boundary
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Socket.io for real-time updates
    const socket = io();
    socket.on('event_published', () => {
      fetchEvents();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isCompleted = eventDate < today;
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'Upcoming') matchesStatus = !isCompleted;
    if (statusFilter === 'Completed') matchesStatus = isCompleted;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-[2.5rem] overflow-hidden min-h-[600px] flex items-center shadow-[0_32px_64px_-12px_rgba(15,23,42,0.2)] group">
        {/* Background Image with optimized quality */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000" 
            alt="Campus Architecture"
            className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-8 md:px-20 py-16 space-y-10">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)]"></span>
              <span>GIT Official Event Portal</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-white font-display"
            >
              Ignite Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Potential.</span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-lg md:text-2xl max-w-2xl leading-relaxed font-light"
          >
            Experience the pinnacle of campus life at <span className="text-white font-semibold">Gogte Institute of Technology</span>. From deep-tech workshops to vibrant cultural expressions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-5"
          >
            <button 
              onClick={() => {
                const element = document.getElementById('events-grid');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/40 flex items-center space-x-3"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link 
              to="/dashboard"
              className="bg-white/5 backdrop-blur-lg border border-white/10 text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center space-x-3"
            >
              <span>Student Access</span>
            </Link>
          </motion.div>
        </div>

        {/* Professional Metrics Glass Card */}
        <div className="absolute bottom-12 right-12 hidden xl:block">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] space-y-6 w-80 shadow-2xl"
           >
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Institutional Reach</span>
                 <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-400" />
                 </div>
              </div>
              <div className="space-y-1">
                 <div className="flex items-end space-x-2">
                    <span className="text-4xl font-black text-white tracking-tighter">4,850+</span>
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider pb-2">Active</span>
                 </div>
                 <p className="text-white/40 text-xs leading-relaxed">Students and faculty participating in excellence.</p>
              </div>
              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-white font-bold">120+</div>
                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Events Yearly</div>
                 </div>
                 <div>
                    <div className="text-white font-bold">24/7</div>
                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Portal Support</div>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Modern Filter Rail */}
      <div id="events-grid" className="sticky top-24 z-40 bg-white/70 backdrop-blur-2xl border border-slate-200/60 p-5 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['Upcoming', 'Completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === status 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="text-gray-400 w-5 h-5 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={event.poster_url ? event.poster_url : `https://picsum.photos/seed/${event.id}/800/600`} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  {new Date(event.date) < new Date(new Date().setHours(0,0,0,0)) && (
                    <span className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
                      <CheckCircle className="w-3.5 h-3.5" />
                      COMPLETED
                    </span>
                  )}
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {event.category}
                  </span>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    event.event_type === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {event.event_type === 'Paid' ? `₹${event.fee}` : 'FREE'}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-grow flex flex-col">
                <div className="mb-6 space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                  <div className="flex items-center text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4 mr-3 text-emerald-500" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {event.time}</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4 mr-3 text-emerald-500" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <Users className="w-4 h-4 mr-3 text-emerald-500" />
                    <span>{event.max_participants} Capacity</span>
                  </div>
                </div>

                <div className="pt-8">
                  <Link 
                    to={`/event/${event.id}`}
                    className="w-full flex items-center justify-center space-x-3 bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-slate-200"
                  >
                    <span>Analyze Event</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No events found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
