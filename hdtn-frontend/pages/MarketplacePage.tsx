
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { fetchTasks, applyForTask } from '../services/api';
import { Task } from '../types';
import { USER_ID } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface MarketplacePageProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ showToast }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showToast(err instanceof Error ? err.message : 'Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = async (taskId: string, taskTitle: string) => {
    try {
      const result = await applyForTask(USER_ID, taskId);
      if (result.success) {
        showToast(`Successfully applied to: ${taskTitle}`, 'success');
      } else {
        showToast(result.message || `Failed to apply to: ${taskTitle}`, 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Error applying to: ${taskTitle}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Opportunities Marketplace</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Opportunities Marketplace</h1>
        <p className="text-red-400">Error loading tasks: {error}</p>
      </div>
    );
  }

  const defaultCenter: LatLngExpression = [51.505, -0.09]; // Default map center

  return (
    <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full flex flex-col">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Opportunities Marketplace</h1>
      <p className="text-slate-300 mb-4">Find micro-tasks, gigs, and collaborations. Click on a map pin to learn more and apply.</p>
      <div className="flex-grow rounded-md overflow-hidden" style={{ minHeight: '400px' }}>
        <MapContainer center={tasks.length > 0 ? [tasks[0].lat, tasks[0].lng] : defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {tasks.map(task => (
            <Marker key={task.id} position={[task.lat, task.lng]}>
              <Popup>
                <div className="p-2 bg-slate-700 text-slate-100 rounded-md">
                  <h3 className="font-bold text-lg text-cyan-400 mb-1">{task.title}</h3>
                  <p className="text-sm mb-2">{task.description}</p>
                  <button
                    onClick={() => handleApply(task.id, task.title)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MarketplacePage;
