import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar, MapPin, Users, User, Clock, Building, Trophy, FileImage, Download, X, Trash2 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { gemini } from '../services/gemini';
import toast from 'react-hot-toast';

const ReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [photos, setPhotos] = useState<{ id: string; data: string; file: File }[]>([]);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    organizerName: '',
    department: '',
    participantsCount: '',
    chiefGuest: '',
    description: '',
    highlights: '',
    outcome: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          data: reader.result as string,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const cleanText = (text: any): string => {
    if (text === null || text === undefined) return "";
    // 1. Convert to string and strip characters that are strictly illegal in XML 1.0
    // We strictly limit to printable ASCII (0x20-0x7E) plus Tab, LF, and CR.
    // This is the safest way to prevent Word "XML parsing error" caused by invisible control characters.
    return String(text).replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
  };

  const handleCreatePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct raw data compilation
      const desc = cleanText(formData.description);
      const highlights = cleanText(formData.highlights);
      const outcome = cleanText(formData.outcome);

      const rawNarrative = `EVENT DESCRIPTION\n${desc}\n\nKEY HIGHLIGHTS\n${highlights}\n\nOUTCOME OF EVENT\n${outcome}`;
      
      setNarrative(rawNarrative);
      setShowPreview(true);
      toast.success("Preview Generated!");
    } catch (err) {
      console.error("Preview generation failed", err);
      toast.error("Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    setLoading(true);
    try {
      const sanitizedNarrative = cleanText(narrative);

      // Prepare Image Runs
      const imageRuns: Paragraph[] = [];
      if (photos.length > 0) {
        imageRuns.push(new Paragraph({
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: "EVENT GALLERY", bold: true })]
        }));

        for (const photo of photos) {
          try {
            const arrayBuffer = await photo.file.arrayBuffer();
            imageRuns.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 100 },
              children: [
                new ImageRun({
                  data: arrayBuffer,
                  transformation: {
                    width: 400,
                    height: 260,
                  },
                } as any),
              ],
            }));
            imageRuns.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [new TextRun({ text: `Image: ${photo.file.name.substring(0, 30)}`, size: 16, italics: true })]
            }));
          } catch (imgErr) {
            console.error("Failed to add image to doc", imgErr);
          }
        }
      }

      const doc = new Document({
        title: "Event Report",
        creator: "CampusEvent Pro",
        sections: [{
          children: [
            // HEADING
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: cleanText(formData.eventName).toUpperCase(),
                  bold: true,
                  size: 32
                })
              ]
            }),
            
            // DETAILS SECTION
            new Paragraph({ spacing: { before: 200 } }),
            new Paragraph({ children: [new TextRun({ text: "EVENT DETAILS", bold: true, underline: {} })] }),
            new Paragraph({ 
              children: [
                new TextRun({ text: `DATE: ${cleanText(formData.eventDate)}`, bold: true }), 
                new TextRun({ text: "  |  ", bold: true }),
                new TextRun({ text: `TIME: ${cleanText(formData.eventTime)}`, bold: true })
              ] 
            }),
            new Paragraph({ children: [new TextRun({ text: `VENUE: ${cleanText(formData.venue)}`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `ORGANIZER: ${cleanText(formData.organizerName)} (${cleanText(formData.department)})` })] }),
            new Paragraph({ children: [new TextRun({ text: `CHIEF GUEST: ${cleanText(formData.chiefGuest)}` })] }),
            new Paragraph({ children: [new TextRun({ text: `PARTICIPANTS: ${cleanText(formData.participantsCount)}` })] }),
            
            new Paragraph({ spacing: { before: 400 } }),

            // NARRATIVE CONTENT
            ...sanitizedNarrative.split('\n').map(line => {
              const cleanedLine = line.trim();
              if (!cleanedLine) return new Paragraph({ spacing: { after: 100 } });
              
              const isHeading = /^[A-Z\s]{5,}$/.test(cleanedLine);
              return new Paragraph({
                spacing: { before: isHeading ? 200 : 0, after: 120 },
                children: [
                  new TextRun({
                    text: cleanedLine,
                    size: isHeading ? 24 : 22,
                    bold: isHeading
                  })
                ]
              });
            }),

            // GALLERY
            ...imageRuns,

            // FOOTER
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 600 },
              children: [
                new TextRun({ text: "--------------------------------------------------", size: 16 }),
                new TextRun({ text: "REPORT GENERATED VIA CAMPUSEVENT PRO", break: 1, italics: true, size: 16 }),
                new TextRun({ text: `GENERATION DATE: ${new Date().toLocaleDateString()}`, break: 1, size: 16 })
              ]
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Event_Report_${Date.now()}.docx`);
      toast.success("Document downloaded!");
    } catch (error) {
      console.error("Download failure", error);
      toast.error("Failed to generate Word file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center space-x-4 mb-2">
          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl shadow-slate-200">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Event Report Generator</h1>
            <p className="text-slate-500 font-medium">Create professional documentation in seconds</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-100">
          <form onSubmit={handleCreatePreview} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Event Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <FileText className="w-3 h-3" /> Event Name *
                </label>
                <input
                  required
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g. Annual Tech Symposium"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <MapPin className="w-3 h-3" /> Venue *
                </label>
                <input
                  required
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Grand Auditorium, Main Block"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <Calendar className="w-3 h-3" /> Event Date *
                </label>
                <input
                  required
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <Clock className="w-3 h-3" /> Event Time *
                </label>
                <input
                  required
                  type="text"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleChange}
                  placeholder="e.g. 10:00 AM - 4:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Organizer Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <User className="w-3 h-3" /> Organizer Name *
                </label>
                <input
                  required
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  placeholder="e.g. Prof. Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <Building className="w-3 h-3" /> Department / Organization *
                </label>
                <input
                  required
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Participants Count */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <Users className="w-3 h-3" /> Number of Participants *
                </label>
                <input
                  required
                  type="text"
                  name="participantsCount"
                  value={formData.participantsCount}
                  onChange={handleChange}
                  placeholder="e.g. 250+"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Chief Guest */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                  <Trophy className="w-3 h-3" /> Chief Guest Name
                </label>
                <input
                  type="text"
                  name="chiefGuest"
                  value={formData.chiefGuest}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Satya Nadella (Hon.)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Event Description *</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed overview of the event proceedings..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[150px] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Key Highlights</label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                placeholder="Mention 3-4 key attractions or major successes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[100px] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Outcome */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Outcome of Event</label>
              <textarea
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
                placeholder="What were the learnings or deliverables?"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[100px] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Event Photos (Gallery)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={photo.data} alt="Event" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all">
                  <FileImage className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400">ADD PHOTO</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center space-x-3 transition-all ${
                loading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-2xl shadow-slate-200'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                  <span>Drafting Preview...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Generate Preview & Audit</span>
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Report Final Review</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">AI-Powered Documentation Draft</p>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="text-center pb-6 border-b border-slate-50">
                  <h2 className="text-2xl font-black text-slate-900 uppercase">{formData.eventName}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</div>
                    <div className="font-bold text-slate-700">{formData.eventDate} @ {formData.eventTime}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Venue</div>
                    <div className="font-bold text-slate-700">{formData.venue}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Generated Narrative</label>
                  <div className="text-slate-600 space-y-4 leading-relaxed font-medium">
                    {narrative.split('\n').map((line, i) => (
                      <p key={i} className={/^[A-Z\s]{5,}$/.test(line.trim()) ? "font-black text-slate-900 pt-2 border-t border-slate-50 first:border-0" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Gallery Preview ({photos.length})</label>
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map(photo => (
                        <div key={photo.id} className="aspect-video rounded-xl overflow-hidden border border-slate-100">
                          <img src={photo.data} alt="Gallery" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
              <button 
                onClick={() => setShowPreview(false)}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
              >
                Back to Editor
              </button>
              <button 
                onClick={downloadReport}
                className="flex-[2] py-4 px-6 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase text-[10px] tracking-widest"
              >
                <Download className="w-5 h-5" />
                <span>Confirm & Download (.docx)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
