import React, { useState } from 'react';
import { User, Mail, Lock, LogIn } from 'lucide-react';
import { User as UserType } from '../App';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'lecturer'>('student');

  // Mock users for demo purposes
  const mockUsers: UserType[] = [
    {
      id: '1',
      name: 'Chiyembekezo Daka',
      email: '2021532666@student.unza.zm',
      role: 'student',
      studentId: '2021532666',
      program: 'BACHELOR OF INFORMATION AND COMMUNICATION TECHNOLOGIES WITH EDUCATION (B.ICTs.Ed)'
    },
    {
      id: '2',
      name: 'Dr. Phiri',
      email: 'dr.phiri@unza.zm',
      role: 'lecturer'
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@unza.zm',
      role: 'admin'
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple demo login - in production, this would authenticate against a backend
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      onLogin(user);
    } else {
      // Create a demo user based on selected type
      const demoUser: UserType = {
        id: Date.now().toString(),
        name: userType === 'student' ? 'Demo Student' : 'Demo Lecturer',
        email,
        role: userType,
        ...(userType === 'student' && {
          studentId: '2021532666',
          program: 'Demo Program'
        })
      };
      onLogin(demoUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-800 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">UZ</span>
            </div>
            <p className="text-gray-600 mt-2">Smart and effective attendance</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User Type</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setUserType('student')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                      userType === 'student'
                        ? 'border-blue-800 bg-blue-50 text-blue-800'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('lecturer')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                      userType === 'lecturer'
                        ? 'border-blue-800 bg-blue-50 text-blue-800'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Lecturer/Tutor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:outline-none transition-colors"
                    placeholder="Enter your UNZA email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-800 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-900 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Demo Accounts:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>Student: 2021532666@student.unza.zm</p>
              <p>Lecturer: dr.phiri@unza.zm</p>
              <p>Admin: admin@unza.zm</p>
              <p className="text-xs text-blue-600 mt-2">Use any password for demo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;