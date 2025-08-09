import React, { useState } from 'react';
import { Users, Search, UserPlus, Edit2, Trash2, BookOpen, TrendingUp } from 'lucide-react';

const StudentManagement = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock student data
  const [students] = useState([
    {
      id: '1',
      name: 'Chiyembekezo Daka',
      email: '2021532666@student.unza.zm',
      studentId: '2021532666',
      program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)',
      year: 3,
      status: 'active',
      attendanceRate: 92,
      totalClasses: 45,
      attendedClasses: 41
    },
    {
      id: '2',
      name: 'Mary Banda',
      email: 'mary.banda@student.unza.zm',
      studentId: '2021001235',
      program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)',
      year: 2,
      status: 'active',
      attendanceRate: 88,
      totalClasses: 42,
      attendedClasses: 37
    },
    {
      id: '3',
      name: 'David Phiri',
      email: 'david.phiri@student.unza.zm',
      studentId: '2020001100',
      program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)',
      year: 4,
      status: 'active',
      attendanceRate: 76,
      totalClasses: 50,
      attendedClasses: 38
    },
    {
      id: '4',
      name: 'Grace Mulenga',
      email: 'grace.mulenga@student.unza.zm',
      studentId: '2022001300',
      program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)',
      year: 1,
      status: 'active',
      attendanceRate: 95,
      totalClasses: 38,
      attendedClasses: 36
    },
    {
      id: '5',
      name: 'Peter Sakala',
      email: 'peter.sakala@student.unza.zm',
      studentId: '2019001000',
      program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)',
      year: 4,
      status: 'inactive',
      attendanceRate: 45,
      totalClasses: 55,
      attendedClasses: 25
    }
  ]);

  const programs = Array.from(new Set(students.map(student => student.program))).sort();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.includes(searchTerm);
    
    const matchesProgram = filterProgram === 'all' || student.program === filterProgram;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const getStatsForProgram = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const averageAttendance = students.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents;
    const highPerformers = students.filter(s => s.attendanceRate >= 80).length;

    return {
      total: totalStudents,
      active: activeStudents,
      average: Math.round(averageAttendance),
      highPerformers
    };
  };

  const stats = getStatsForProgram();

  if (user.role === 'student') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Student management is only available for lecturers/tutors and administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
              <p className="text-gray-600">Manage student enrollment and track attendance</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Students</p>
                <p className="text-2xl font-bold text-green-800">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Attendance</p>
                <p className="text-2xl font-bold text-purple-800">{stats.average}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">High Performers</p>
                <p className="text-2xl font-bold text-orange-800">{stats.highPerformers}</p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">⭐</span>
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
                placeholder="Search by name, email, or student ID..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Student ID</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Program</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Year</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Attendance</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className={`border-b border-gray-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition-colors`}>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {student.studentId}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <BookOpen size={16} className="text-blue-500 mr-2" />
                      <span className="text-sm font-medium">{student.program}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">Year {student.year}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                        student.attendanceRate >= 80
                          ? 'bg-green-100 text-green-800'
                          : student.attendanceRate >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.attendanceRate}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {student.attendedClasses}/{student.totalClasses} classes
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No students found</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || filterProgram !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add some students to get started'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;