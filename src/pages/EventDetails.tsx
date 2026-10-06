import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, User, Clock, Tag, CheckCircle, AlertCircle, ArrowLeft, Share2, QrCode, Banknote, Bed, CreditCard, Bell, X } from 'lucide-react';
import { motion } from 'motion/react';
import { gemini } from '../services/gemini';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [wantsAccommodation, setWantsAccommodation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
        
        if (user && res.data.registrations) {
          const registered = res.data.registrations.some((r: any) => String(r.student_id) === String(user.id));
          setIsRegistered(registered);
        }
      } catch (error) {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user, navigate]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register');
      navigate('/login');
      return;
    }

    if (event.event_type === 'Paid' && !showPaymentModal) {
      setShowPaymentModal(true);
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/registrations/${id}`, { wantsAccommodation });
      toast.success('Successfully registered!');
      setIsRegistered(true);
      setShowPaymentModal(false);
      // Refresh event data to update participant count
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleMarkAttendance = async (regId: number, status: string) => {
    try {
      await api.patch(`/registrations/${regId}/attendance`, { status });
      toast.success(`Attendance marked as ${status}`);
      // Refresh event data
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const handleCancelEvent = async () => {
    setCancelling(true);
    try {
      await api.post(`/events/${id}/cancel`);
      toast.success('Event cancelled successfully');
      // Refresh event data
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel event');
    } finally {
      setCancelling(false);
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      await api.post(`/events/${id}/reminder`);
      toast.success('Reminders sent to all registered students!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reminders');
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!event) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const isFull = event.registrations?.length >= event.max_participants;
  const isAdminOrOrganizer = user?.role === 'admin' || String(user?.id) === String(event.organizer_id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 font-bold transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Image and Info */}
        <div className="lg:col-span-2 space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-50"
          >
            <div className="relative h-96 md:h-[30rem]">
              <img 
                src={event.poster_url ? event.poster_url : `https://picsum.photos/seed/${event.id}/1200/800`} 
                alt={event.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {event.category}
                  </span>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    event.status === 'approved' ? 'bg-emerald-500' : 
                    event.status === 'cancelled' ? 'bg-rose-600' :
                    'bg-amber-500'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{event.title}</h1>
              </div>
            </div>

            <div className="p-10 space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Timeline" value={formatDate(event.date)} />
                <InfoItem icon={<Clock className="w-5 h-5" />} label="Schedule" value={event.time} />
                <InfoItem icon={<MapPin className="w-5 h-5" />} label="Location" value={event.venue} />
                <InfoItem icon={<Users className="w-5 h-5" />} label="Node Capacity" value={`${event.registrations?.length || 0} / ${event.max_participants}`} />
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Technical Abstract</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{event.description}</p>
                </div>
              </div>

              <div className="flex items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mr-5 shadow-xl">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Authority</p>
                  <p className="text-lg font-black text-slate-900">{event.organizer_name}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Organizer Section: Registrations List */}
          {isAdminOrOrganizer && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-50"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Asset Audit</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{event.registrations?.length || 0} ACTIVE REGISTRATIONS</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-50">
                      <th className="pb-4 font-bold">Student</th>
                      <th className="pb-4 font-bold">Date</th>
                      <th className="pb-4 font-bold">Attendance</th>
                      <th className="pb-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {event.registrations?.map((reg: any) => (
                      <tr key={reg.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-gray-900">{reg.student_name}</div>
                          <div className="text-xs text-gray-500">{reg.student_email}</div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {new Date(reg.registration_date).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            reg.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {reg.attendance_status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleMarkAttendance(reg.id, 'present')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark Present"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleMarkAttendance(reg.id, 'absent')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Mark Absent"
                            >
                              <AlertCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24"
          >
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Registration Status</p>
                {isFull && !isRegistered ? (
                  <div className="flex items-center justify-center text-red-500 font-bold">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>Event Full</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-green-500 font-bold">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Registrations Open</span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center space-y-2">
                <p className="text-4xl font-black text-indigo-600">{event.max_participants - (event.registrations?.length || 0)}</p>
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Spots Remaining</p>
              </div>

              {user?.role === 'student' && (
                <div className="space-y-4">
                  {isRegistered ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 flex items-center justify-center font-bold">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        You're Registered!
                      </div>
                      <button 
                        onClick={() => navigate('/my-registrations')}
                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                      >
                        <QrCode className="w-5 h-5" />
                        <span>View My Pass</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {event.accommodation_required === 1 && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                              checked={wantsAccommodation}
                              onChange={(e) => setWantsAccommodation(e.target.checked)}
                            />
                            <span className="text-sm font-bold text-gray-700">Need Accommodation?</span>
                          </label>
                          <p className="text-xs text-blue-600 ml-8 font-medium">Extra ₹{event.accommodation_cost} will be added to your fee.</p>
                        </div>
                      )}

                      {(event.event_type === 'Paid' || wantsAccommodation) && (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Registration Fee</span>
                            <span>₹{event.fee || 0}</span>
                          </div>
                          {wantsAccommodation && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Accommodation</span>
                              <span>₹{event.accommodation_cost || 0}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-200 font-black text-gray-900">
                            <span>Total Amount</span>
                            <span>₹{(event.fee || 0) + (wantsAccommodation ? event.accommodation_cost : 0)}</span>
                          </div>
                        </div>
                      )}

                      {showPaymentModal ? (
                         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                              <p className="text-sm font-bold text-amber-700 mb-2">Simulated Payment Gateway</p>
                              <p className="text-xs text-amber-600">Clicking below will simulate a successful transaction for ₹{(event.fee || 0) + (wantsAccommodation ? event.accommodation_cost : 0)}.</p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleRegister}
                                disabled={registering}
                                className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center"
                              >
                                {registering ? (
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                  'Confirm & Pay'
                                )}
                              </button>
                            </div>
                         </div>
                      ) : (
                        <button 
                          onClick={handleRegister}
                          disabled={registering || isFull || event.status === 'cancelled'}
                          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {registering ? 'Processing...' : isFull ? 'Event Full' : event.status === 'cancelled' ? 'Event Cancelled' : event.event_type === 'Paid' ? 'Proceed to Payment' : 'Register Now'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isAdminOrOrganizer && (
                <div className="space-y-4">
                  {event.status !== 'cancelled' && (
                    <button 
                      onClick={handleCancelEvent}
                      disabled={cancelling}
                      className="w-full bg-red-50 text-red-600 border border-red-100 font-bold py-4 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {cancelling ? (
                        <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <span>Cancel Event</span>
                      )}
                    </button>
                  )}
                  {event.status === 'approved' && (
                    <button 
                      onClick={handleSendReminder}
                      disabled={sendingReminder || (event.registrations?.length || 0) === 0}
                      className="w-full bg-amber-50 text-amber-700 border border-amber-100 font-bold py-4 rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {sendingReminder ? (
                        <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-700 rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          <span>Send Event Reminder</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {!user && (
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Login to Register
                </button>
              )}

              <div className="pt-4 flex items-center justify-center space-x-4 border-t border-gray-50">
                <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Tag className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: any) => (
  <div className="space-y-1">
    <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest">
      <span className="mr-1.5 text-indigo-500">{icon}</span>
      {label}
    </div>
    <p className="font-bold text-gray-900 truncate">{value}</p>
  </div>
);

export default EventDetails;
