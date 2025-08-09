import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ScanAttendance from './components/ScanAttendance';
import GenerateBarcode from './components/GenerateBarcode';
import AttendanceHistory from './components/AttendanceHistory';
import StudentManagement from './components/StudentManagement';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courses] = useState([
    {
      id: '1',
      code: 'ICT4010',
      name: 'Project Management',
      lecturer: 'Dr. Phiri',
      location: 'ICT Lab 1',
      schedule: 'Mon, Wed 10:00 AM',
      coordinates: { latitude: -15.3875, longitude: 28.3228 }
    },
    {
      id: '2',
      code: 'ICT1110',
      name: 'Introduction to Computing',
      lecturer: 'Dr. Phiri',
      location: 'Computer Lab 2',
      schedule: 'Tue, Thu 8:00 AM',
      coordinates: { latitude: -15.3876, longitude: 28.3229 }
    },
    {
      id: '3',
      code: 'ICT3020',
      name: 'Database Systems',
      lecturer: 'Dr. Phiri',
      location: 'ICT Lab 3',
      schedule: 'Wed, Fri 2:00 PM',
      coordinates: { latitude: -15.3877, longitude: 28.3230 }
    }
  ]);

  const addAttendanceRecord = (record) => {
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    setAttendanceRecords(prev => [...prev, newRecord]);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header user={user} onLogout={() => setUser(null)} />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  user={user} 
                  attendanceRecords={attendanceRecords}
                  courses={courses}
                />
              } 
            />
            <Route 
              path="/scan" 
              element={
                <ScanAttendance 
                  user={user}
                  courses={courses}
                  onAttendanceMarked={addAttendanceRecord}
                />
              } 
            />
            <Route 
              path="/generate" 
              element={<GenerateBarcode user={user} courses={courses} />} 
            />
            <Route 
              path="/history" 
              element={
                <AttendanceHistory 
                  user={user}
                  attendanceRecords={attendanceRecords}
                />
              } 
            />
            <Route 
              path="/students" 
              element={<StudentManagement user={user} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;