
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="p-6 bg-slate-800 rounded-lg shadow-xl h-full flex flex-col justify-center items-center">
      <h1 className="text-5xl font-bold text-cyan-400 mb-6">Welcome to HDTN Connect</h1>
      <p className="text-xl text-slate-300 mb-8 max-w-2xl text-center">
        Your portal to discover opportunities, connect with peers, and showcase your digital twin.
        Navigate using the sidebar to explore the Marketplace, update your Profile, or check your Dashboard.
      </p>
      <img src="https://picsum.photos/800/400?random=1" alt="Inspirational Tech" className="rounded-lg shadow-md" />
    </div>
  );
};

export default HomePage;
