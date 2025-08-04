import React, { useState } from 'react';
import QRCode from 'qrcode-generator';
import { QrCode, Download, User, CreditCard, AlertCircle } from 'lucide-react';
import { User as UserType } from '../App';
import { createObjectURL, revokeObjectURL } from '../utils/browserCompat';

interface GenerateQRProps {
  user: UserType;
}

const GenerateQR: React.FC<GenerateQRProps> = ({ user }) => {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [program, setProgram] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const programs = [
    'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)'
  ];

  const generateStudentIDQR = () => {
    if (!studentId || !studentName || !program) return;

    const studentData = {
      studentId: studentId.trim(),
      name: studentName.trim(),
      program: program,
      university: 'University of Zambia',
      issueDate: new Date().toISOString(),
      type: 'student_id'
    };

    const qr = QRCode(0, 'M');
    qr.addData(JSON.stringify(studentData));
    qr.make();

    setQrCodeData(qr.createDataURL(8, 4));
  };

  const downloadQR = () => {
    if (!qrCodeData) return;

    try {
      const link = document.createElement('a');
      link.href = qrCodeData;
      link.download = `student-id-qr-${studentId}.png`;
      
      // For better browser compatibility
      if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        link.dispatchEvent(event);
      } else {
        link.click();
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new window
      window.open(qrCodeData, '_blank');
    }
  };

  const clearForm = () => {
    setStudentId('');
    setStudentName('');
    setProgram('');
    setQrCodeData(null);
  };

  if (user.role === 'student') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Student ID QR code generation is only available for lecturers/tutors and administrators.</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">For Students:</p>
            <p className="text-blue-700 text-sm mt-1">Your student ID card already contains a QR code. Contact the registrar's office if you need a replacement.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Generate Student ID QR Code</h1>
            <p className="text-gray-600">Create QR codes for student identification cards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID Number
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., 2021001234"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g., Chiyembekezo Daka"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Program of Study
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              >
                <option value="">Select Program</option>
                {programs.map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={generateStudentIDQR}
                disabled={!studentId || !studentName || !program}
                className="flex-1 bg-gradient-to-r from-blue-800 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCode size={20} />
                <span>Generate QR Code</span>
              </button>
              
              <button
                onClick={clearForm}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Clear
              </button>
            </div>

            {qrCodeData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-800">QR Code Generated</h4>
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-green-700 text-sm mb-3">
                  Student ID QR code has been generated successfully. This QR code contains the student's identification information.
                </p>
                <button
                  onClick={downloadQR}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download QR Code</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            {qrCodeData ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
                <div className="flex items-center justify-center mb-4">
                  <img
                    src={qrCodeData}
                    alt="Student ID QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center">
                  <div className="bg-blue-800 text-white px-4 py-2 rounded-lg mb-3">
                    <p className="font-bold text-lg">UNZA</p>
                    <p className="text-xs">University of Zambia</p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg">{studentName}</p>
                  <p className="text-blue-600 font-semibold">{studentId}</p>
                  <p className="text-sm text-gray-600 mt-1">{program}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Student ID Card</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-16 text-center">
                <CreditCard className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Enter student details and generate QR code</p>
                <p className="text-sm text-gray-400 mt-2">QR code will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">Student ID QR Code Information:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">QR Code Contains:</h4>
            <ul className="space-y-1">
              <li>• Student ID Number</li>
              <li>• Full Name</li>
              <li>• Program of Study</li>
              <li>• University Information</li>
              <li>• Issue Date</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Usage Instructions:</h4>
            <ul className="space-y-1">
              <li>• Print QR code on student ID cards</li>
              <li>• Lecturers/tutors scan these codes for attendance</li>
              <li>• Each QR code is unique to the student</li>
              <li>• Secure and tamper-resistant format</li>
              <li>• Works with any QR code scanner</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Security Notice</h4>
            <p className="text-yellow-700 text-sm">
              Student ID QR codes contain sensitive information. Ensure proper security measures are in place when printing and distributing student ID cards. Only authorized personnel should have access to this QR code generation system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQR;