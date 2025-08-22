import React from 'react';
import { Task } from '../types';
import { MOCK_TASKS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-300 border-green-500';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-500';
    }
  };

  const getTaskIcon = (type: Task['type']) => {
    switch(type) {
      case 'gig': return '💼';
      case 'help-request': return '🤝';
      case 'medical-camp': return '⚕️';
      default: return '📌';
    }
  }

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-5 hover:shadow-teal-500/20 transition-all duration-300 border border-slate-700 hover:border-teal-600 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-teal-400 flex items-center">
          <span className="text-2xl mr-2">{getTaskIcon(task.type)}</span>
          {task.title}
        </h3>
        {task.xpPoints && task.xpPoints > 0 && (
          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {task.xpPoints} XP
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-4 h-16 overflow-y-auto custom-scrollbar">{task.description}</p>
      <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-700">
        <span>Posted by: <span className="font-medium text-slate-400">{task.postedBy}</span></span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

const AchievementBadge: React.FC<{ icon: string; label: string; color: string; locked?: boolean }> = ({ icon, label, color, locked }) => (
  <div className={`p-4 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-2 w-36 h-36 transition-all duration-300 ${locked ? 'bg-slate-700 opacity-60 cursor-not-allowed' : `${color} hover:shadow-xl hover:scale-105`}`}>
    <span className="text-4xl">{icon}</span>
    <span className={`font-semibold text-sm text-center ${locked ? 'text-slate-400' : 'text-white'}`}>{label}</span>
    {locked && <span className="text-xs text-slate-500">(Locked)</span>}
  </div>
);


const DashboardPage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const appliedTasks = MOCK_TASKS.filter(task => task.status === 'in-progress' || task.status === 'open').slice(0,3);
  const completedGigs = MOCK_TASKS.filter(task => task.status === 'completed');
  const totalXp = completedGigs.reduce((sum, task) => sum + (task.xpPoints || 0), 0);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  
  return (
    <div className="space-y-10 animate-fadeIn">
      <section className="bg-slate-800 shadow-xl rounded-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-teal-400 mb-2">Welcome back, {userName}!</h1>
        <p className="text-slate-400 mb-6">Here's an overview of your activities and achievements.</p>
        <div className="bg-gradient-to-r from-purple-600 to-teal-500 p-6 rounded-lg flex items-center space-x-6 shadow-lg">
          <span className="text-6xl">🏆</span>
          <div>
            <p className="text-3xl font-bold text-white">{totalXp} XP Earned</p>
            <p className="text-purple-100">Keep up the great work and unlock new achievements!</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">Active Tasks & Applications</h2>
        {appliedTasks.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {appliedTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="bg-slate-800 p-6 rounded-lg text-center text-slate-400 shadow-md">
            No active tasks or applications yet. Explore the map to find opportunities!
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">Completed Gigs & Contributions</h2>
        {completedGigs.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedGigs.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="bg-slate-800 p-6 rounded-lg text-center text-slate-400 shadow-md">
            No completed gigs yet. Finish some tasks to see them here!
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-teal-500 mb-5 border-b-2 border-slate-700 pb-3">Achievements</h2>
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          <AchievementBadge icon="🌟" label="Rising Star" color="bg-yellow-500" locked={totalXp < 50} />
          <AchievementBadge icon="🤝" label="Community Helper" color="bg-green-500" locked={completedGigs.length < 1} />
          <AchievementBadge icon="💡" label="Initiator" color="bg-indigo-500" locked={MOCK_TASKS.filter(t => t.postedBy === userName).length < 1} />
          <AchievementBadge icon="🗺️" label="Seasoned Explorer" color="bg-sky-500" locked={true} />
        </div>
        <p className="text-slate-500 mt-4 text-sm text-center md:text-left">More achievements coming soon as you engage with the platform!</p>
      </section>
    </div>
  );
};

export default DashboardPage;
