import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Wallet,
  FileSpreadsheet,
  CreditCard,
  FolderCheck,
  FolderX,
  ClipboardList,
  UserCheck,
  Image as ImageIcon,
  School,
  Building,
  Video
} from 'lucide-react';

const Sidebar = ({ sidebarOpen }) => {
  const [openMenus, setOpenMenus] = useState({
    student: false,
    employee: false
  });

  const toggleMenu = (menu) => {
    if (!sidebarOpen) return;
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Student submenu items
  const studentSubmenu = [
    { path: '/students/list', name: 'Student List', icon: Users },
    { path: '/students/documents', name: 'Student Documents', icon: FileText },
    { path: '/students/loan-data', name: 'Loan Data', icon: CreditCard },
    { path: '/students/continue-loan', name: 'Continue Loan', icon: FolderCheck },
    { path: '/students/closed-loan', name: 'Closed Loan', icon: FolderX },
    { path: '/students/scheme-data', name: 'Scheme Data', icon: ClipboardList },
    { path: '/students/continue-scheme', name: 'Continue Scheme', icon: FolderCheck },
    { path: '/students/closed-scheme', name: 'Closed Scheme', icon: FolderX },
    { path: '/students/guardians', name: 'Guardians Data', icon: UserCheck }
  ];
 
  // Employee submenu items
  const employeeSubmenu = [
    { path: '/employees/list', name: 'Employee List', icon: Briefcase },
    { path: '/employees/documents', name: 'Employee Documents', icon: FileSpreadsheet },
   { path: '/employees/wallet-requests', name: 'Wallet Request', icon: Wallet }
  ];

  const mainMenuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
     { path: '/videos', name: 'Videos', icon: Video },
      { path: '/banners', name: 'Banners', icon: ImageIcon },
    { path: '/support-policy', name: 'Support & Policy', icon: HelpCircle },
    { path: '/payment-settings', name: 'Payment Setup', icon: CreditCard },
  ];
 
  const renderMenuItem = (item, index) => (
    <NavLink
      key={index}
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-amber-500/20 text-amber-400 border-r-2 border-amber-400'
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-amber-400'
        } ${!sidebarOpen && 'justify-center'}`
      }
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {sidebarOpen && <span>{item.name}</span>}
    </NavLink>
  );

  const renderSubmenu = (title, icon, items, menuKey) => {
    const isOpen = openMenus[menuKey];
    
    return (
      <div className="space-y-1">
        {/* Parent Menu Item */}
        <button
          onClick={() => toggleMenu(menuKey)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 hover:text-amber-400 ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {icon}
            {sidebarOpen && <span>{title}</span>}
          </div>
          {sidebarOpen && (
            <span className="ml-auto">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
        </button>

        {/* Submenu Items */}
        {sidebarOpen && isOpen && (
          <div className="ml-6 space-y-1 border-l border-gray-700 pl-3">
            {items.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-amber-400'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-800/50 backdrop-blur-md border-r border-gray-700 transition-all duration-300 z-40 overflow-y-auto ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="flex flex-col h-full py-4">
        <nav className="flex-1 px-3 space-y-1">
          {/* Main Menu Items */}
          {mainMenuItems.map((item, idx) => renderMenuItem(item, idx))}

          {/* Student Section with Submenu */}
          {renderSubmenu(
            'Student',
            <GraduationCap className="w-5 h-5 shrink-0" />,
            studentSubmenu,
            'student'
          )}

          {/* Employee Section with Submenu */}
          {renderSubmenu(
            'Employee',
            <Building className="w-5 h-5 shrink-0" />,
            employeeSubmenu,
            'employee'
          )}

          {/* Settings Menu */}
          {renderMenuItem({ path: '/settings', name: 'Settings', icon: Settings }, 'settings')}
        </nav>
        
        <div className={`px-3 pt-4 border-t border-gray-700 ${!sidebarOpen && 'text-center'}`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">PS</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-xs text-gray-400">PSWB Business</p>
                <p className="text-xs text-amber-500">v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;