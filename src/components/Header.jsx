import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, BarChart, History, Users, LogOut, BarChart3, CreditCard } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/scan', icon: BarChart, label: 'Scan Barcode', roles: ['student', 'lecturer'] },
    { path: '/generate', icon: CreditCard, label: 'Generate Barcode', roles: ['lecturer', 'admin'] },
    { path: '/history', icon: History, label: 'History' },
    { path: '/students', icon: Users, label: 'Students', roles: ['lecturer', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user.role)
  );

  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">UZ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Smart and effective attendance</h1>
                <p className="text-xs text-gray-600">University of Zambia</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-800 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-800 to-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden py-4 border-t border-gray-200">
          <div className="flex justify-around">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-blue-800 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;