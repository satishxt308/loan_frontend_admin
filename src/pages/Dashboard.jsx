import React from 'react';
import { Users, Leaf, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'S-D Card Holders', value: '5000+', icon: CreditCard, color: 'amber', change: '+12%' },
    { title: 'Organic Farms', value: '1000+', icon: Leaf, color: 'green', change: '+8%' },
    { title: 'Total Farmers', value: '2500+', icon: Users, color: 'blue', change: '+15%' },
    { title: 'Projects Completed', value: '45+', icon: TrendingUp, color: 'purple', change: '+5%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-6 rounded-2xl border border-amber-500/20">
        <h1 className="text-3xl font-bold text-amber-400">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Transforming Agriculture · Empowering Farmers
        </p>
        <p className="text-sm text-gray-500 mt-2">
          PSWB Business Private Limited - Pioneering organic agriculture development
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-green-400 text-xs mt-2">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 rounded-full bg-${stat.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {['Organic Farming Initiative', 'Government Scheme Facilitation', 'Farmer Training Program'].map((project, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-300">{project}</span>
                <span className="text-xs text-green-400">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors">
              Add Student
            </button>
            <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors">
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;