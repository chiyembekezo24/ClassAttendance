import React from 'react';
import { Users, BookOpen, Calendar, TrendingUp, Clock, MapPin } from 'lucide-react';
import { User, AttendanceRecord, Course } from '../App';

interface DashboardProps {
  user: User;
  attendanceRecords: AttendanceRecord[];
  courses: Course[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, attendanceRecords, courses }) => {
  const userAttendanceRecords = user.role === 'student' 
    ? attendanceRecords.filter(record => record.studentId === user.studentId)
    : attendanceRecords;

  const totalClasses = user.role === 'student' ? courses.length * 10 : 50; // Mock total classes
  const attendedClasses = userAttendanceRecords.length;
  const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  const todayAttendance = userAttendanceRecords.filter(record => {
    const today = new Date();
    const recordDate = new Date(record.timestamp);
    return recordDate.toDateString() === today.toDateString();
  });

  const stats = [
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      subtitle: `${attendedClasses}/${totalClasses} classes`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Today\'s Classes',
      value: todayAttendance.length.toString(),
      subtitle: 'Classes attended today',
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Courses',
      value: courses.length.toString(),
      subtitle: user.role === 'student' ? 'Enrolled courses' : 'Teaching courses',
      icon: BookOpen,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Students',
      value: user.role === 'student' ? '1' : '150',
      subtitle: user.role === 'student' ? 'You' : 'Total students',
      icon: Users,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 font-medium">{stat.title}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-600" size={24} />
            Recent Attendance
          </h2>
          <div className="space-y-3">
            {userAttendanceRecords.slice(-5).reverse().map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{record.courseName}</p>
                  <p className="text-sm text-gray-600">{record.courseCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    record.status === 'present' 
                      ? 'bg-green-100 text-green-800'
                      : record.status === 'late'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
            {userAttendanceRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No attendance records yet</p>
                <p className="text-sm">Start scanning QR codes to track attendance</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={24} />
            {user.role === 'student' ? 'My Courses' : 'Teaching Schedule'}
          </h2>
          {user.role === 'lecturer' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                💡 Tip: Use the "Scan Student ID" feature to take attendance by scanning student ID cards
              </p>
            </div>
          )}
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{course.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{course.code}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-600">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;