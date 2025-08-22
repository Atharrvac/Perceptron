
import React from 'react';
import { OpportunityItem, UserProfile, EducationEntry } from '../types';
import { useUser } from '../contexts/UserContext';
import AvatarDisplay from './AvatarDisplay';

interface OpportunityDetailsModalProps {
  opportunity: OpportunityItem;
  onClose: () => void;
}

const defaultAvatar = 'https://api.dicebear.com/7.x/initials/svg?seed=UnknownUser&backgroundColor=64748b,718096&radius=50';

const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({ opportunity, onClose }) => {
  const { getUserById } = useUser();
  const offererProfile = getUserById(opportunity.offeredById);

  if (!opportunity) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className="bg-slate-800 text-slate-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-sky-400">{opportunity.title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-700"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
          {/* Opportunity Details */}
          <section>
            <p className="text-xs font-semibold uppercase text-teal-400 tracking-wider mb-1">
              {opportunity.icon && <span className="mr-1.5">{opportunity.icon}</span>}
              {opportunity.categoryLabel}
            </p>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-1.5">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map(tag => (
                    <span key={tag} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Offerer Profile Section */}
          <section className="border-t border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-teal-500 mb-4">Offered By: {offererProfile?.name || opportunity.offeredBy}</h3>
            {offererProfile ? (
              <div className="space-y-4 bg-slate-700/30 p-5 rounded-lg border border-slate-600">
                <div className="flex items-center space-x-4">
                  <AvatarDisplay src={offererProfile.avatarUrl || defaultAvatar} alt={offererProfile.name} size="medium" />
                  <div>
                    <h4 className="text-lg font-semibold text-sky-300">{offererProfile.name}</h4>
                    {/* Location can be added if relevant */}
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{offererProfile.bio}</p>
                
                {offererProfile.skills && offererProfile.skills.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-slate-400 mb-1">Skills:</h5>
                    <div className="flex flex-wrap gap-2">
                      {offererProfile.skills.map(skill => (
                        <span key={skill} className="bg-teal-600/70 text-white px-2.5 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {offererProfile.education && offererProfile.education.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-semibold text-slate-400 mb-2">Education:</h5>
                    <div className="space-y-2">
                    {offererProfile.education.map((edu: EducationEntry) => (
                      <div key={edu.id} className="text-xs p-2 bg-slate-600/50 rounded">
                        <p className="font-medium text-slate-200">{edu.institution}</p>
                        <p className="text-slate-300">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-slate-400">{edu.startYear} - {edu.endYear}</p>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
                
                {/* 3D Twin Placeholder */}
                <div className="mt-4 border-t border-slate-600 pt-4">
                    <h5 className="text-sm font-semibold text-slate-400 mb-2">3D Twin (Placeholder)</h5>
                    <div className="p-3 bg-slate-600/50 rounded text-center">
                        <p className="text-xs text-slate-300">View {offererProfile.name}'s 3D avatar here soon!</p>
                         <div className="w-20 h-20 bg-slate-500 rounded-full mx-auto mt-2 flex items-center justify-center shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </div>
                    </div>
                </div>

              </div>
            ) : (
              <p className="text-slate-400">Detailed offerer profile not available.</p>
            )}
          </section>
        </div>
        
        {/* Modal Footer (Optional Actions) */}
        {/* <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-5 rounded-md transition-colors"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OpportunityDetailsModal;
