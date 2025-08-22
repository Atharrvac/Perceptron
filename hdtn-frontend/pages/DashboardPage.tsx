
import React, { useState, useEffect } from 'react';
import { fetchAppliedTasks } from '../services/api';
import { AppliedTask } from '../types';
import { USER_ID } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const [appliedTasks, setAppliedTasks] = useState<AppliedTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppliedTasks = async () => {
      try {
        setLoading(true);
        const tasks = await fetchAppliedTasks(USER_ID);
        setAppliedTasks(tasks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadAppliedTasks();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">My Dashboard</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
     return (
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">My Dashboard</h1>
        <p className="text-red-400">Error loading applied tasks: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">My Dashboard</h1>
      <h2 className="text-2xl font-semibold text-slate-300 mb-4">Active Applications</h2>
      {appliedTasks.length === 0 ? (
        <p className="text-slate-400">You haven't applied to any tasks yet. Visit the Marketplace to find opportunities!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedTasks.map(task => (
            <div key={task.id} className="bg-slate-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">{task.title}</h3>
              <p className="text-slate-300 text-sm mb-3">{task.description}</p>
              <div className="text-xs text-slate-400">Status: Applied</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
