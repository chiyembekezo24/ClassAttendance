import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, MapPin, CheckCircle, XCircle, AlertCircle, BookOpen, Clock, Users } from 'lucide-react';
import { User, Course, AttendanceRecord } from '../App';
import { getLocation, createObjectURL, revokeObjectURL, checkBrowserSupport } from '../utils/browserCompat';

interface ScanAttendanceProps {
  user: User;
  courses: Course[];
  onAttendanceMarked: (record: Omit<AttendanceRecord, 'id'>) => void;
}

const ScanAttendance: React.FC<ScanAttendanceProps> = ({ user, courses, onAttendanceMarked }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error' | 'location-error'>('idle');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [attendanceSession, setAttendanceSession] = useState<{courseId: string, startTime: Date} | null>(null);
  const [scannedStudents, setScannedStudents] = useState<string[]>([]);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'qr-scanner';
  const [courseAttendanceRecords, setCourseAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [browserSupport, setBrowserSupport] = useState(checkBrowserSupport());

  // Mock student database - in production this would come from a backend
  const studentDatabase = [
    { studentId: '2021532666', name: 'Chiyembekezo Daka', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2021001235', name: 'Mary Banda', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2020001100', name: 'David Phiri', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2022001300', name: 'Grace Mulenga', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2019001000', name: 'Peter Sakala', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2021001236', name: 'Sarah Tembo', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2021001237', name: 'James Mwale', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
    { studentId: '2020001101', name: 'Ruth Chanda', program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)' },
  ];

  useEffect(() => {
    // Check browser compatibility
    const support = checkBrowserSupport();
    setBrowserSupport(support);
    
    if (!support.supported) {
      console.warn('Some browser features are not supported:', support.unsupported);
    }

    // Get user's current location
    if (support.features.geolocation) {
      getLocation()
        .then((position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError(null);
        })
        .catch((error) => {
          setLocationError('Location access denied. Please enable location services.');
          console.error('Location error:', error);
        });
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const generateCourseCSV = (courseId: string, records: AttendanceRecord[]) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || records.length === 0) return;

    const csvContent = [
      ['Date', 'Time', 'Course Code', 'Course Name', 'Student ID', 'Student Name', 'Status', 'Location', 'Scanned By'].join(','),
      ...records.map(record => [
        new Date(record.timestamp).toLocaleDateString(),
        new Date(record.timestamp).toLocaleTimeString(),
        record.courseCode,
        record.courseName,
        record.studentId,
        record.studentName,
        record.status,
        `"${record.location.latitude.toFixed(6)}, ${record.location.longitude.toFixed(6)}"`,
        'Lecturer/Tutor'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sessionDate = new Date().toISOString().split('T')[0];
    const sessionTime = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    link.download = `${course.code}-attendance-${sessionDate}-${sessionTime}.csv`;
    link.click();
    revokeObjectURL(url);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const startAttendanceSession = () => {
    if (!selectedCourse || !location) return;
    
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;

    setAttendanceSession({
      courseId: selectedCourse,
      startTime: new Date()
    });
    setScannedStudents([]);
    setCourseAttendanceRecords([]);
    setScanStatus('idle');
    setScanResult(null);
  };

  const startScanning = async () => {
    if (!location || !attendanceSession) {
      setScanStatus('location-error');
      return;
    }

    // Set scanning state first to render the HTML element
    setIsScanning(true);
    setScanStatus('idle');

    // Wait for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const html5QrCode = new Html5Qrcode(scannerElementId);
      html5QrcodeRef.current = html5QrCode;

      // Try different camera configurations for better browser support
      const cameraConfigs = [
        { facingMode: 'environment' },
        { facingMode: 'user' },
        { facingMode: { exact: 'environment' } },
        undefined // Let browser choose
      ];

      let started = false;
      for (const config of cameraConfigs) {
        try {
          await html5QrCode.start(
            config || { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            (error) => {
              // Handle scan errors silently - this fires frequently during normal operation
              console.log('Scan error:', error);
            }
          );
          started = true;
          break;
        } catch (configError) {
          console.log('Camera config failed:', config, configError);
          continue;
        }
      }

      if (!started) {
        throw new Error('Unable to start camera with any configuration');
      }

    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      setIsScanning(false);
      setScanStatus('error');
      setScanResult('Camera access failed. Please check permissions and try again.');
    }
  };

  const stopScanning = async () => {
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
        setIsScanning(false);
      } catch (error) {
        console.error('Failed to stop QR scanner:', error);
      }
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    if (!location || !attendanceSession) {
      setScanStatus('location-error');
      return;
    }

    try {
      // Parse student ID QR code - assuming format: {"studentId": "2021001234", "name": "John Mwanza"}
      let studentData;
      try {
        studentData = JSON.parse(decodedText);
      } catch {
        // If not JSON, assume it's just the student ID
        studentData = { studentId: decodedText };
      }

      const { studentId } = studentData;
      
      // Find student in database
      const student = studentDatabase.find(s => s.studentId === studentId);
      if (!student) {
        setScanStatus('error');
        setScanResult('Student ID not found in database');
        return;
      }

      // Check if student already scanned
      if (scannedStudents.includes(studentId)) {
        setScanStatus('error');
        setScanResult(`${student.name} has already been marked present`);
        return;
      }

      // Find the course
      const course = courses.find(c => c.id === attendanceSession.courseId);
      if (!course) {
        setScanStatus('error');
        setScanResult('Course not found');
        return;
      }

      // Check location proximity (within 100 meters)
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        course.coordinates.latitude,
        course.coordinates.longitude
      );

      if (distance > 100) {
        setScanStatus('error');
        setScanResult(`Must be within 100m of ${course.location} to mark attendance`);
        return;
      }

      // Determine attendance status based on time elapsed since session start
      const now = new Date();
      const sessionDuration = (now.getTime() - attendanceSession.startTime.getTime()) / (1000 * 60); // in minutes
      let status: 'present' | 'late' = 'present';
      
      if (sessionDuration > 15) { // More than 15 minutes after session started
        status = 'late';
      }

      // Mark attendance
      onAttendanceMarked({
        studentId: student.studentId,
        studentName: student.name,
        courseCode: course.code,
        courseName: course.name,
        timestamp: now,
        location,
        status,
        scannedBy: user.id // Lecturer/tutor who scanned the student ID
      });

      // Create attendance record for CSV generation
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        studentId: student.studentId,
        studentName: student.name,
        courseCode: course.code,
        courseName: course.name,
        timestamp: now,
        location,
        status,
        scannedBy: user.id
      };

      // Add to scanned students list
      setScannedStudents(prev => [...prev, studentId]);
      setCourseAttendanceRecords(prev => [...prev, newRecord]);

      setScanStatus('success');
      setScanResult(`✓ ${student.name} (${student.studentId}) - ${status.toUpperCase()}`);

      // Auto-clear success message after 2 seconds
      setTimeout(() => {
        setScanResult(null);
        setScanStatus('idle');
      }, 2000);

    } catch (error) {
      setScanStatus('error');
      setScanResult('Invalid student ID QR code');
    }
  };

  const endAttendanceSession = () => {
    // Generate CSV file for this course session
    if (attendanceSession && courseAttendanceRecords.length > 0) {
      generateCourseCSV(attendanceSession.courseId, courseAttendanceRecords);
    }
    
    setAttendanceSession(null);
    setScannedStudents([]);
    setCourseAttendanceRecords([]);
    stopScanning();
    setScanResult(null);
    setScanStatus('idle');
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanStatus('idle');
  };

  const downloadCurrentSessionCSV = () => {
    if (attendanceSession && courseAttendanceRecords.length > 0) {
      generateCourseCSV(attendanceSession.courseId, courseAttendanceRecords);
    }
  };

  if (user.role === 'student') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Student ID scanning is only available for lecturers/tutors and administrators.</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">For Students:</p>
            <p className="text-blue-700 text-sm mt-1">Present your student ID card to your lecturer/tutor for attendance marking.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <QrCode className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Scan Student ID Cards</h1>
            <p className="text-gray-600">Scan student ID QR codes to mark attendance</p>
          </div>
        </div>

        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Location Required</h4>
                <p className="text-red-700 text-sm mt-1">{locationError}</p>
              </div>
            </div>
          </div>
        )}

        {!browserSupport.supported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Browser Compatibility Warning</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Your browser may not support all features. Missing: {browserSupport.unsupported.join(', ')}
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  For best experience, please use a modern browser like Chrome, Firefox, Safari, or Edge.
                </p>
              </div>
            </div>
          </div>
        )}

        {location && !attendanceSession && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-green-800">Location Detected</h4>
                  <p className="text-green-700 text-sm">Ready to start attendance session</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Course for Attendance
              </label>
              <div className="space-y-2">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCourse === course.id
                        ? 'border-blue-800 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="course"
                      value={course.id}
                      checked={selectedCourse === course.id}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{course.name}</h3>
                          <p className="text-sm text-blue-600 font-medium">{course.code}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {course.schedule}
                        </span>
                        <span className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {course.location}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={startAttendanceSession}
              disabled={!selectedCourse || !location}
              className="w-full bg-gradient-to-r from-blue-800 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users size={20} />
              <span>Start Attendance Session</span>
            </button>
          </div>
        )}

        {attendanceSession && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Attendance Session Active</h4>
                    <p className="text-blue-700 text-sm">
                      {courses.find(c => c.id === attendanceSession.courseId)?.name} - 
                      Started at {attendanceSession.startTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-800">{scannedStudents.length}</p>
                  <p className="text-xs text-blue-600">students scanned</p>
                </div>
              </div>
            </div>

            {!isScanning && (
              <button
                onClick={startScanning}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Camera size={24} />
                <span>Start Scanning Student IDs</span>
              </button>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div
                  id={scannerElementId}
                  className="w-full rounded-lg overflow-hidden shadow-lg"
                />
                <button
                  onClick={stopScanning}
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200"
                >
                  Stop Scanning
                </button>
              </div>
            )}

            {scanResult && (
              <div className={`p-4 rounded-lg border ${
                scanStatus === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {scanStatus === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      scanStatus === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {scanResult}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={endAttendanceSession}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200"
              >
                End Session
              </button>
              {courseAttendanceRecords.length > 0 && (
                <button
                  onClick={downloadCurrentSessionCSV}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>📄</span>
                  <span>Download CSV</span>
                </button>
              )}
              {!isScanning && (
                <button
                  onClick={startScanning}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Camera size={16} />
                  <span>Continue Scanning</span>
                </button>
              )}
            </div>

            {scannedStudents.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Students Scanned ({scannedStudents.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scannedStudents.map((studentId) => {
                    const student = studentDatabase.find(s => s.studentId === studentId);
                    return (
                      <div key={studentId} className="flex items-center space-x-2 text-sm">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="font-medium">{student?.name}</span>
                        <span className="text-gray-500">({studentId})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">Instructions for Lecturers/Tutors:</h3>
        <ol className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
            Select the course for which you want to take attendance
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
            Click "Start Attendance Session\" to begin
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
            Ask students to present their student ID cards one by one
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
            Scan each student's ID QR code with your device camera
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">5</span>
            Students arriving after 15 minutes will be marked as \"Late\"
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">6</span>
            Click "End Session\" when finished - CSV file will be automatically downloaded
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">7</span>
            Use "Download CSV\" button to get attendance data during the session
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ScanAttendance;