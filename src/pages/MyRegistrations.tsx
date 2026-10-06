import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Ticket, Calendar, MapPin, QrCode, ExternalLink, ArrowRight, Clock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const passRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const downloadPass = async (reg: any) => {
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a6' // Compact ticket size
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      // Background & Border
      pdf.setFillColor(248, 250, 252); // light slate
      pdf.rect(0, 0, width, height, 'F');
      
      pdf.setDrawColor(226, 232, 240); // border color
      pdf.setLineWidth(0.5);
      pdf.rect(5, 5, width - 10, height - 10, 'D');

      // Header Branding
      pdf.setTextColor(79, 70, 229); // Indigo 600
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('CampusEvent Pro', width / 2, 15, { align: 'center' });
      
      pdf.setDrawColor(79, 70, 229);
      pdf.line(width / 2 - 15, 17, width / 2 + 15, 17);

      // Event Title
      pdf.setTextColor(15, 23, 42); // slate 900
      pdf.setFontSize(16);
      const titleLines = pdf.splitTextToSize(reg.title.toUpperCase(), width - 20);
      pdf.text(titleLines, width / 2, 30, { align: 'center' });

      // Student Section
      pdf.setTextColor(100, 116, 139); // slate 500
      pdf.setFontSize(8);
      pdf.text('ADMIT ONE', width / 2, 45, { align: 'center' });
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(12);
      pdf.text(reg.student_name, width / 2, 50, { align: 'center' });

      // Event Details Box
      pdf.setFillColor(255, 255, 255);
      pdf.rect(10, 58, width - 20, 30, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.rect(10, 58, width - 20, 30, 'D');
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('DATE:', 15, 66);
      pdf.text('TIME:', 15, 74);
      pdf.text('VENUE:', 15, 82);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(reg.date, 35, 66);
      pdf.text(reg.time, 35, 74);
      const venueLines = pdf.splitTextToSize(reg.venue, width - 50);
      pdf.text(venueLines, 35, 82);

      // QR Code
      if (reg.qr_code) {
        // Center QR code at the bottom
        pdf.addImage(reg.qr_code, 'PNG', (width - 30) / 2, 95, 30, 30);
      }

      // Footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('SCAN AT ENTRY POINT', width / 2, 132, { align: 'center' });
      pdf.setFont('courier', 'normal');
      pdf.text(`ID: ${String(reg.id).padStart(8, '0')}`, width / 2, 136, { align: 'center' });

      pdf.save(`Ticket_${reg.title.replace(/\s+/g, '_')}.pdf`);
      toast.success('Professional PDF generated successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF pass.');
    }
  };

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await api.get('/registrations/my');
        setRegistrations(res.data);
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Event Passes</h1>
          <p className="text-gray-500">Your registered events and entry passes.</p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            <Ticket className="w-5 h-5" />
            <span>{registrations.length} Registered</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {registrations.length > 0 ? (
          registrations.map((reg, index) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              ref={el => passRefs.current[reg.id] = el}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row relative"
            >
              <div className="md:w-64 h-48 md:h-auto overflow-hidden shrink-0">
                <img 
                  src={reg.poster_url ? reg.poster_url : `https://picsum.photos/seed/${reg.event_id}/800/600`} 
                  alt={reg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{reg.title}</h3>
                      <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-widest">{reg.student_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      reg.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {reg.attendance_status === 'present' ? 'Attended' : 'Upcoming'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>{new Date(reg.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>{reg.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm col-span-2">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                      <span className="truncate">{reg.venue}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Paid</p>
                       <p className="font-bold text-indigo-600">₹{reg.total_paid || 0}</p>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accommodation</p>
                       <p className="font-bold text-gray-700">{reg.wants_accommodation ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                  <Link 
                    to={`/event/${reg.event_id}`}
                    className="flex items-center space-x-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Details</span>
                  </Link>

                  <button 
                    onClick={() => downloadPass(reg)}
                    className="flex items-center space-x-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Pass</span>
                  </button>
                </div>
              </div>

              <div className="md:w-48 bg-gray-50 p-8 flex flex-col items-center justify-center border-l border-gray-100 space-y-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                  <img src={reg.qr_code} alt="QR Code" className="w-32 h-32" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scan at Entry</p>
                  <p className="text-[8px] font-mono text-gray-300 mt-1 uppercase">ID: {String(reg.id).padStart(6, '0')}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Ticket className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">No registered events</h3>
              <p className="text-gray-500">You haven't registered for any events yet. Start exploring!</p>
            </div>
            <Link 
              to="/"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <span>Browse Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;
