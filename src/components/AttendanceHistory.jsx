import React, { useState } from 'react';
import { Calendar, Search, Filter, Download, TrendingUp, Clock, MapPin } from 'lucide-react';
import { createObjectURL, revokeObjectURL } from '../utils/browserCompat';

const AttendanceHistory = ({ user, attendanceRecords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  const userRecords = user.role === 'student'
    ? attendanceRecords.filter(record => record.studentId === user.studentId)
    : attendanceRecords;

  const courses = Array.from(new Set(userRecords.map(record => record.courseCode))).sort();

  const filteredRecords = userRecords.filter(record => {
    const matchesSearch = record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || record.courseCode === filterCourse;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const exportData = () => {
    const csvContent = [
      ['Date', 'Course Code', 'Course Name', 'Student Name', 'Status', 'Time'].join(','),
      ...filteredRecords.map(record => [
        new Date(record.timestamp).toLocaleDateString(),
        record.courseCode,
        record.courseName,
        record.studentName,
        record.status,
        new Date(record.timestamp).toLocaleTimeString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    revokeObjectURL(url);
  };

  const getAttendanceStats = () => {
    const total = userRecords.length;
    const present = userRecords.filter(r => r.status === 'present').length;
    const late = userRecords.filter(r => r.status === 'late').length;
    const absent = userRecords.filter(r => r.status === 'absent').length;
    
    return {
      total,
      present,
      late,
      absent,
      rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Attendance History</h1>
              <p className="text-gray-600">
                {user.role === 'student' ? 'Your attendance records' : 'All student attendance records'}
              </p>
            </div>
          </div>
          
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Classes</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Present</p>
                <p className="text-2xl font-bold text-green-800">{stats.present}</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Late</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.late}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Absent</p>
                <p className="text-2xl font-bold text-red-800">{stats.absent}</p>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✗</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-800">{stats.rate}%</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                stats.rate >= 80 ? 'bg-green-500' : stats.rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <span className="text-white text-sm font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course name, code, or student name..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>

            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Date & Time</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Course</th>
                {user.role !== 'student' && (
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Student</th>
                )}
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                {user.role !== 'student' && (
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Scanned By</th>
                )}
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record.id} className={`border-b border-gray-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition-colors`}>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-800">{record.courseName}</p>
                      <p className="text-sm text-blue-600 font-medium">{record.courseCode}</p>
                    </div>
                  </td>
                  {user.role !== 'student' && (
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-800">{record.studentName}</p>
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  {user.role !== 'student' && (
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600">Lecturer/Tutor</p>
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-1" />
                      <span>
                        {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No attendance records found</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || filterStatus !== 'all' || filterCourse !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start marking attendance to see records here'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;