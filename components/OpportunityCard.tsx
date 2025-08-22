
import React from 'react';
import { OpportunityItem } from '../types';
import { useUser, getConversationId } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface OpportunityCardProps {
  opportunity: OpportunityItem;
  onDetailsClick: (opportunity: OpportunityItem) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onDetailsClick }) => {
  const { title, categoryLabel, description, tags, offeredBy, icon, offeredById } = opportunity;
  const { currentUser, addMessage } = useUser();
  const navigate = useNavigate();

  const getFallbackIcon = (type: string) => {
    switch(type.toLowerCase()){
        case 'job': return '💻';
        case 'gig': return '💼';
        case 'volunteer': return '💖';
        case 'freelance': return '✍️';
        case 'mentorship': return '🧑‍🏫';
        case 'learning': return '📚';
        case 'support': return '🤝';
        case 'barter': return '🎨';
        case 'collaboration': return '🧑‍💻';
        default: return '🌟';
    }
  }
  const displayIcon = icon || getFallbackIcon(opportunity.type);

  const handleContact = () => {
    if (!currentUser) {
      alert("Please log in to contact users."); // Or redirect to profile creation
      return;
    }
    if (currentUser.id === offeredById) {
      alert("You cannot contact yourself.");
      return;
    }

    const conversationId = getConversationId(currentUser.id, offeredById);
    const initialMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId,
      senderId: currentUser.id,
      recipientId: offeredById,
      originalText: `Hi ${offeredBy}, I'm interested in your marketplace post: "${title}".`,
      timestamp: new Date(),
    };
    addMessage(initialMessage);
    navigate(`/chat?withUser=${offeredById}`);
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl flex flex-col h-full border border-slate-700 hover:border-sky-500/70 transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-5 border-b border-slate-700">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-semibold text-sky-400">{title}</h3>
        </div>
        <p className="text-xs font-semibold uppercase text-teal-400 tracking-wider">
          {displayIcon && <span className="mr-1.5">{displayIcon}</span>}
          {categoryLabel}
        </p>
      </div>

      <div className="p-5 flex-grow">
        <p className="text-slate-300 text-sm mb-4 h-20 overflow-y-auto custom-scrollbar leading-relaxed">
          {description}
        </p>
        
        {tags && tags.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 mb-1.5">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 4).map(tag => (
                <span key={tag} className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-700">
        <p className="text-xs text-slate-500 mb-4">
          Offered by: <span className="font-medium text-slate-400">{offeredBy}</span>
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onDetailsClick(opportunity)}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Details
          </button>
          <button
            onClick={handleContact}
            disabled={!currentUser || currentUser.id === offeredById}
            className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 px-4 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
