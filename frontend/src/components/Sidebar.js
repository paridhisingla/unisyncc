import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, BookOpen, Bell, User, Calendar, 
  ClipboardList, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, LayoutDashboard, GraduationCap,
  DollarSign, Library, Building, Bus, MessageSquare, 
  FileText, UserCheck, Clock, Award
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, userRole, onLogout }) => {
  const getMenuItems = () => {
    const commonItems = [
      { icon: Home, label: 'Dashboard', path: `/${userRole}` },
      { icon: User, label: 'Profile', path: `/${userRole}/profile` }
    ];

    switch (userRole) {
      case 'Admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/admin' },
          { 
            icon: Users, 
            label: 'User Management', 
            path: '/admin/users',
            submenu: [
              { icon: Users, label: 'Students', path: '/admin/students' },
              { icon: GraduationCap, label: 'Teachers', path: '/admin/teachers' },
              { icon: UserCheck, label: 'Staff', path: '/admin/staff' }
            ]
          },
          { icon: Clock, label: 'Attendance', path: '/admin/attendance' },
          { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
          { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
          { icon: Award, label: 'Exams & Results', path: '/admin/exams' },
          { icon: DollarSign, label: 'Fee & Finance', path: '/admin/finance' },
          { icon: Library, label: 'Library', path: '/admin/library' },
          { icon: Building, label: 'Hostel', path: '/admin/hostel' },
          { icon: Bus, label: 'Transport', path: '/admin/transport' },
          { icon: Bell, label: 'Events & Notices', path: '/admin/events' },
          { icon: MessageSquare, label: 'Complaints', path: '/admin/complaints' },
          { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
          { icon: FileText, label: 'Reports', path: '/admin/reports' },
          { icon: Settings, label: 'Settings', path: '/admin/settings' }
        ];
      case 'teacher':
        return [
          ...commonItems,
          { icon: ClipboardList, label: 'Attendance', path: '/teacher/attendance' },
          { icon: BookOpen, label: 'My Courses', path: '/teacher/courses' },
          { icon: Bell, label: 'Notices', path: '/teacher/notices' }
        ];
      case 'student':
        return [
          ...commonItems,
          { icon: Calendar, label: 'Timetable', path: '/student/timetable' },
          { icon: Bell, label: 'Notices', path: '/student/notices' },
          { icon: BarChart3, label: 'Progress', path: '/student/progress' }
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          {!isCollapsed && <span>CampusMS</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
