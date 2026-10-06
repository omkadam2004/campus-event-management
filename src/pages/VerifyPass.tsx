import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { User, Mail, Calendar, MapPin, CheckCircle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

const VerifyPass = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        'scanner-container',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          try {
            let data;
            if (decodedText.includes('VERIFY_DATA:')) {
              const jsonPart = decodedText.split('VERIFY_DATA:')[1];
              data = JSON.parse(jsonPart);
            } else {
              // Fallback for old QR codes
              data = JSON.parse(decodedText);
            }
            setScanResult(data);
            setIsScanning(false);
            if (scanner) scanner.clear();
            toast.success('Pass scanned successfully!');
          } catch (err) {
            console.error('QR Parse Error:', err);
            setError('Invalid QR code format. Please scan a valid CampusEvent Pro ticket.');
          }
        },
        (errorMessage) => {
          // Generally benign scanning errors
          // console.warn(errorMessage);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Error clearing scanner", e));
      }
    };
  }, [isScanning]);

  const handleReset = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Entry Verification</h2>
        <p className="text-gray-500 mt-2">Scan student QR code to verify attendance</p>
      </div>

      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden"
          >
            <div id="scanner-container" className="rounded-2xl overflow-hidden bg-gray-50 aspect-square"></div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Success Header */}
            <div className="bg-emerald-500 p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,white_0%,transparent_70%)]" />
              </div>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
              <h3 className="text-2xl font-black">VALID ENTRY</h3>
              <p className="text-emerald-50 opacity-90 text-sm mt-1">Verified via CampusEvent Pro Network</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Student Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Student Name</p>
                  <p className="text-lg font-black text-gray-900 leading-tight">{scanResult?.studentName}</p>
                </div>
              </div>

              {/* Event Info */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Registered Event</p>
                    <p className="font-bold text-gray-900">{scanResult?.eventName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email Address</p>
                    <p className="font-bold text-gray-900">{scanResult?.studentEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Student ID</p>
                    <p className="font-mono text-gray-600 text-xs">{scanResult?.studentId}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 italic text-[10px] text-gray-400 text-center">
                Registration Timestamp: {new Date(scanResult?.timestamp).toLocaleString()}
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
              >
                <RefreshCw className="w-5 h-5" />
                <span>SCAN ANOTHER PASS</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyPass;
