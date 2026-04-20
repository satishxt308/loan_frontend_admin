import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-gray-800/90 backdrop-blur-md border-b border-gray-700">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <img 
              src="/src/assets/logo.png" 
              alt="PSWB Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/32?text=PSWB';
              }}
            />
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold text-xl">PSWB</span>
              <span className="text-gray-400 hidden sm:inline">Admin Panel</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
         
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-400">admin@pswb.com</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400 hover:text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;