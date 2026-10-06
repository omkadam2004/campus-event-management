import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Type, FileText, Image as ImageIcon, ArrowRight, Clock, Tag, CreditCard, Banknote, Bed } from 'lucide-react';
import { motion } from 'motion/react';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'Technical',
    max_participants: 50,
    event_type: 'Free',
    fee: 0,
    accommodation_required: false,
    accommodation_cost: 0,
  });
  const [poster, setPoster] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    if (poster) {
      data.append('poster', poster);
    }

    try {
      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Event published successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Event</h1>
        <p className="text-gray-500">Fill in the details to propose a new campus event.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8"
      >
        {/* General Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Event Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Code Rush 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Technical</option>
                  <option>Cultural</option>
                  <option>Sports</option>
                  <option>Workshop</option>
                  <option>Seminar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Capacity Header */}
        <div className="pt-4 border-t border-gray-100">
           <h3 className="text-lg font-black text-gray-900 flex items-center mb-4">
             <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
             Pricing & Capacity Details
           </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Event Type</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white font-bold"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as 'Free' | 'Paid', fee: e.target.value === 'Free' ? 0 : formData.fee })}
                >
                  <option value="Free">Free to Attend</option>
                  <option value="Paid">Paid Event</option>
                </select>
              </div>
            </div>

            {formData.event_type === 'Paid' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-bold text-gray-700 ml-1">Registration Fee (₹)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-200 bg-green-50/10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-black text-green-700"
                    placeholder="e.g. 500"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Max Participants</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Accommodation Options</label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white font-bold"
                  value={formData.accommodation_required ? 'Yes' : 'No'}
                  onChange={(e) => setFormData({ ...formData, accommodation_required: e.target.value === 'Yes', accommodation_cost: e.target.value === 'No' ? 0 : formData.accommodation_cost })}
                >
                  <option value="No">No Accommodation</option>
                  <option value="Yes">Accommodation Available</option>
                </select>
              </div>
            </div>

            {formData.accommodation_required && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-bold text-gray-700 ml-1">Accommodation Cost per Day (₹)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    placeholder="e.g. 200"
                    value={formData.accommodation_cost}
                    onChange={(e) => setFormData({ ...formData, accommodation_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Price Summary Preview */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pricing Summary Preview</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                 <p className="text-xs text-gray-500">Base Registration</p>
                 <p className="text-xl font-black text-gray-900">₹{formData.fee}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-xs text-gray-500">Accommodation Add-on</p>
                 <p className="text-xl font-black text-gray-900">₹{formData.accommodation_cost}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-xs text-gray-500">Max Total per Student</p>
                 <p className="text-xl font-black text-indigo-600">₹{formData.fee + formData.accommodation_cost}</p>
              </div>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Venue</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Main Auditorium, Block A"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
            <textarea
              required
              rows={4}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Describe what the event is about..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Event Poster</label>
          <div className="relative">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 font-bold">
                    {poster ? poster.name : 'Click to upload event poster'}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 800x400px)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setPoster(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Publish Event Now</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateEvent;
