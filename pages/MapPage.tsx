
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MOCK_TASKS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, OTHER_USERS_ON_MAP } from '../constants';
import { Task } from '../types'; // UserProfile type not used directly in this component anymore
import { useUser } from '../contexts/UserContext';

// Custom User Icon
const createUserIcon = (avatarUrl: string, isCurrentUser: boolean = false) => {
  return L.divIcon({
    html: `<img src="${avatarUrl}" style="width: ${isCurrentUser ? '36px' : '30px'}; height: ${isCurrentUser ? '36px' : '30px'}; border-radius: 50%; border: 2px solid ${isCurrentUser ? '#cc24dd' : '#2dd4bf'}; box-shadow: 0 0 10px ${isCurrentUser ? '#cc24dd' : '#2dd4bf'};" alt="user avatar" />`,
    className: 'leaflet-custom-user-icon',
    iconSize: isCurrentUser ? [36,36] : [30, 30],
    iconAnchor: isCurrentUser ? [18,18] : [15, 15],
  });
};

// Custom Task Icon
const createTaskIcon = (taskType: Task['type']) => {
  let iconHtml = '📌';
  let bgColor = 'bg-slate-500'; // Tailwind class, actual color extracted below
  switch(taskType) {
    case 'gig': 
      iconHtml = '💼'; 
      bgColor = 'bg-blue-500';
      break;
    case 'help-request': 
      iconHtml = '🤝';
      bgColor = 'bg-green-500';
      break;
    case 'medical-camp': 
      iconHtml = '⚕️';
      bgColor = 'bg-red-600';
      break;
  }
  // Extract hex or actual color for inline style - this is a bit hacky, ideally use actual color values
  const colorMap: { [key: string]: string } = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-red-600': '#dc2626',
    'bg-slate-500': '#64748b'
  };
  const actualBgColor = colorMap[bgColor] || '#64748b';

  return L.divIcon({
    html: `<div style="font-size: 16px; background-color: ${actualBgColor}; padding: 6px; border-radius: 50%; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${iconHtml}</div>`,
    className: 'leaflet-custom-task-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // point of the pin
  });
};


const MapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { currentUser } = useUser();

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false // Disable default zoom, can add custom one if needed
      }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { // Using a dark theme tile layer
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);


      MOCK_TASKS.forEach(task => {
        const marker = L.marker(task.location, { icon: createTaskIcon(task.type) })
          .addTo(mapRef.current!)
          .bindPopup(`<div class="map-popup"><b>${task.title}</b><br>${task.description.substring(0,100)}...<br><span class="type">Type: ${task.type}</span></div>`);
      });

      OTHER_USERS_ON_MAP.forEach(user => {
         L.marker(user.location, { icon: createUserIcon(user.avatarUrl) })
          .addTo(mapRef.current!)
          .bindPopup(`<div class="map-popup"><b>${user.name}</b><br><span class="skills">${user.skills.join(', ')}</span></div>`);
      });
      
      if (currentUser) {
        L.marker(currentUser.location, { icon: createUserIcon(currentUser.avatarUrl, true), zIndexOffset: 1000 })
        .addTo(mapRef.current!)
        .bindPopup(`<div class="map-popup current-user-popup"><b>${currentUser.name} (You)</b><br>Your current location</div>`)
        .openPopup();
        mapRef.current.setView(currentUser.location, DEFAULT_MAP_ZOOM + 2);
      }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    // Adjust height based on viewport, accounting for potential footer and padding.
    // The sidebar is fixed, so main content area height is what matters.
    <div className="h-[calc(100vh-theme(spacing.20)-theme(spacing.10)-52px)] w-full rounded-xl shadow-2xl overflow-hidden border-2 border-slate-700 animate-fadeIn relative">
      <div ref={mapContainerRef} className="leaflet-container" />
      <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-sm p-2.5 rounded-lg text-xs text-slate-300 z-[1000] shadow-lg">
         Map data &copy; OpenStreetMap & CARTO
      </div>
       <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg text-sm text-slate-200 z-[1000] shadow-xl text-center">
        {currentUser && <p className="font-semibold text-teal-400">Your 2D avatar is on the map!</p>}
        <p className="text-xs text-slate-400">Future: 3D avatar walking simulation with Three.js.</p>
      </div>
    </div>
  );
};

export default MapPage;
