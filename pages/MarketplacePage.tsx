
import React, { useState } from 'react';
import { MARKETPLACE_OPPORTUNITIES, OPPORTUNITY_FILTER_CATEGORIES } from '../constants';
import { OpportunityItem, OpportunityType } from '../types';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityDetailsModal from '../components/OpportunityDetailsModal'; // New Modal

const MarketplacePage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<OpportunityType>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null);

  const filteredOpportunities = activeFilter === 'all'
    ? MARKETPLACE_OPPORTUNITIES
    : MARKETPLACE_OPPORTUNITIES.filter(op => op.type === activeFilter);

  const handleOpenDetailsModal = (opportunity: OpportunityItem) => {
    setSelectedOpportunity(opportunity);
  };

  const handleCloseDetailsModal = () => {
    setSelectedOpportunity(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 h-full flex flex-col">
      <div className="px-1">
        <h1 className="text-4xl font-bold text-sky-400">Opportunities Marketplace</h1>
        <p className="text-slate-400 mt-1 text-lg">Find micro-tasks, gigs, learning, collaborations, and support.</p>
      </div>

      <div className="py-3 px-1">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="text-slate-300 font-medium mr-2">Filter by type:</span>
          {OPPORTUNITY_FILTER_CATEGORIES.map(category => (
            <button
              key={category.type}
              onClick={() => setActiveFilter(category.type)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                          ${activeFilter === category.type
                            ? 'bg-sky-500 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-sky-300'
                          }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 flex-grow overflow-y-auto custom-scrollbar pr-2">
          {filteredOpportunities.map(opportunity => (
            <OpportunityCard 
              key={opportunity.id} 
              opportunity={opportunity} 
              onDetailsClick={handleOpenDetailsModal}
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-500 text-xl">No opportunities found for "{activeFilter}". Try a different filter!</p>
        </div>
      )}

      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
};

export default MarketplacePage;
