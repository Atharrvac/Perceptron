import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, Language, GroundingChunk, UserProfile } from '../types';
import { AVAILABLE_LANGUAGES, AI_USER_ID } from '../constants';
import { translateText, getResponseWithGoogleSearch, getChatResponse, aiService } from '../services/aiService';
import { useUser, getConversationId } from '../contexts/UserContext';
import AvatarDisplay from '../components/AvatarDisplay';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ChatBubble: React.FC<{ message: ChatMessage; currentUser: UserProfile; getAvatar: (id: string) => string; }> = ({ message, currentUser, getAvatar }) => {
  const isCurrentUserMessage = message.senderId === currentUser.id;
  const senderAvatar = getAvatar(message.senderId);

  return (
    <div className={`flex items-end mb-5 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUserMessage && (
        <AvatarDisplay src={senderAvatar} alt="Sender Avatar" size="small" className="mr-2.5 mb-0.5 border-teal-500/50" />
      )}
      <div
        className={`max-w-md lg:max-w-lg p-3.5 rounded-xl shadow-lg ${
          isCurrentUserMessage
            ? 'bg-teal-600 text-white rounded-br-sm'
            : 'bg-slate-700 text-slate-100 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.originalText}</p>
        {message.translatedText && message.targetLanguage && message.recipientId === currentUser.id && (
          <p className={`text-xs mt-2 pt-2 border-t opacity-80 ${isCurrentUserMessage ? 'border-teal-400' : 'border-slate-600'}`}>
            <em>({message.targetLanguage}): {message.translatedText}</em>
          </p>
        )}
        {message.senderId === AI_USER_ID && message.sources && message.sources.length > 0 && (
          <div className={`mt-2.5 pt-2.5 border-t ${isCurrentUserMessage ? 'border-teal-400' : 'border-slate-600'} border-opacity-50`}>
            <p className="text-xs font-semibold mb-1.5 text-teal-300">Sources:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              {message.sources.map((source: GroundingChunk, index: number) => (
                source.web && (
                  <li key={index}>
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-teal-400 hover:text-teal-200 transition-colors">
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>
      {isCurrentUserMessage && (
         <AvatarDisplay src={senderAvatar} alt="My Avatar" size="small" className="ml-2.5 mb-0.5 border-purple-500/50" />
      )}
    </div>
  );
};

const ConversationList: React.FC<{
  conversations: { id: string; name: string; avatar: string; lastMessage?: string }[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}> = ({ conversations, activeConversationId, onSelectConversation }) => {
  return (
    <div className="w-full md:w-72 bg-slate-800 border-r border-slate-700 flex flex-col custom-scrollbar overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-teal-400">Conversations</h2>
      </div>
      <div className="flex-grow">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-slate-700/70 transition-colors
                        ${activeConversationId === conv.id ? 'bg-sky-600/30 border-l-4 border-sky-500' : ''}`}
          >
            <AvatarDisplay src={conv.avatar} alt={conv.name} size="small" className="border-slate-600" />
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${activeConversationId === conv.id ? 'text-sky-300' : 'text-slate-200'}`}>{conv.name}</p>
              {conv.lastMessage && <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const ChatPage: React.FC = () => {
  const { currentUser, allMessages, addMessage, knownUsers, getUserById, setAllMessages } = useUser(); // Added setAllMessages
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<Language>(Language.ENGLISH); // Target language for translating RECEIVED messages
  const [isLoading, setIsLoading] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const withUserId = searchParams.get('withUser');
    if (withUserId && currentUser) {
      const convId = getConversationId(currentUser.id, withUserId);
      setActiveConversationId(convId);
      // Optional: Clear the query param after use
      navigate('/chat', { replace: true });
    } else if (currentUser) {
      // Default to AI conversation if no specific user chat is initiated
      setActiveConversationId(getConversationId(currentUser.id, AI_USER_ID));
    }
  }, [searchParams, currentUser, navigate]);


  const getAvatar = (userId: string) => {
    if (userId === AI_USER_ID) return `https://api.dicebear.com/7.x/bottts/svg?seed=GeminiAI&backgroundColor=2dd4bf,0d9488&radius=8`;
    const user = getUserById(userId);
    return user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userId}&backgroundColor=475569,64748b&radius=50`;
  };

  const conversations = useMemo(() => {
    if (!currentUser) return [];
    const convMap = new Map<string, { partnerId: string; lastMessage?: ChatMessage }>();

    allMessages.forEach(msg => {
      if (msg.conversationId.includes(currentUser.id)) {
        const partnerId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
        // Corrected timestamp comparison:
        if (!convMap.has(partnerId) || (convMap.get(partnerId)!.lastMessage?.timestamp.getTime() ?? 0) < msg.timestamp.getTime()) {
          convMap.set(partnerId, { partnerId, lastMessage: msg });
        }
      }
    });
    
    // Ensure AI conversation is always present
    if (!convMap.has(AI_USER_ID)) {
         const aiConvId = getConversationId(currentUser.id, AI_USER_ID);
         const aiLastMessage = allMessages.filter(m => m.conversationId === aiConvId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
         convMap.set(AI_USER_ID, { partnerId: AI_USER_ID, lastMessage: aiLastMessage });
    }


    return Array.from(convMap.values())
      .map(({ partnerId, lastMessage }) => {
        const partnerProfile = partnerId === AI_USER_ID ? { id: AI_USER_ID, name: 'AI Assistant' } : getUserById(partnerId);
        return {
          id: getConversationId(currentUser.id, partnerId),
          name: partnerProfile?.name || 'Unknown User',
          avatar: getAvatar(partnerId),
          lastMessage: lastMessage?.originalText,
        };
      })
      .sort((a, b) => { // Sort by last message time, AI first if no messages
        const msgA = allMessages.filter(m => m.conversationId === a.id).sort((x,y) => y.timestamp.getTime() - x.timestamp.getTime())[0];
        const msgB = allMessages.filter(m => m.conversationId === b.id).sort((x,y) => y.timestamp.getTime() - x.timestamp.getTime())[0];
        if (!msgA && a.id.includes(AI_USER_ID)) return -1; // AI first
        if (!msgB && b.id.includes(AI_USER_ID)) return 1;
        return (msgB?.timestamp.getTime() ?? 0) - (msgA?.timestamp.getTime() ?? 0);
      });
  }, [allMessages, currentUser, getUserById]);

  const currentChatMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return allMessages.filter(msg => msg.conversationId === activeConversationId).sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [allMessages, activeConversationId]);

  const activePartnerId = useMemo(() => {
    if (!activeConversationId || !currentUser) return null;
    return activeConversationId.replace(currentUser.id, '').replace('-', '');
  }, [activeConversationId, currentUser]);


  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [currentChatMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser || !activePartnerId) return;
    setIsLoading(true);

    const convId = activeConversationId!;
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      conversationId: convId,
      senderId: currentUser.id,
      recipientId: activePartnerId,
      originalText: inputText,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    const currentInput = inputText;
    setInputText('');

    try {
      if (activePartnerId === AI_USER_ID) { // Interacting with AI
        let aiResponseText: string;
        let sources: GroundingChunk[] = [];

        if (useGoogleSearch) {
          const searchResult = await getResponseWithGoogleSearch(currentInput);
          aiResponseText = searchResult.text;
          sources = searchResult.sources;
        } else {
          // Use basic chat response without Google Search
          aiResponseText = await getChatResponse(currentInput);
        }

        // If we get an error, show provider status
        if (aiResponseText.startsWith('Error:')) {
          const status = aiService.getActiveProvider();
          const providers = aiService.getAvailableProviders();
          console.log(`AI Service Status - Active: ${status}, Available: ${providers.join(', ')}`);
        }
        
        const aiMessage: ChatMessage = {
          id: 'ai-' + Date.now(),
          conversationId: convId,
          senderId: AI_USER_ID,
          recipientId: currentUser.id,
          originalText: aiResponseText || "Sorry, I couldn't generate a response.",
          timestamp: new Date(),
          sources: sources.length > 0 ? sources : undefined,
        };
        addMessage(aiMessage);

      } else { // Sending message to another user, no AI response needed here, just store it.
         // Message already added via addMessage(userMessage)
         // Future: could implement read receipts or push notifications here.
      }
    } catch (error) {
      console.error("Error in chat:", error);
      if (activePartnerId === AI_USER_ID) {
        const errorMessage: ChatMessage = {
          id: 'err-' + Date.now(),
          conversationId: convId,
          senderId: AI_USER_ID,
          recipientId: currentUser.id,
          originalText: "Sorry, I encountered an error with the AI. Please check API key or try again.",
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Translate incoming messages if needed
  useEffect(() => {
    if (!currentUser || targetLanguage === Language.ENGLISH) return;

    currentChatMessages.forEach(async (msg) => {
      if (msg.recipientId === currentUser.id && msg.senderId !== AI_USER_ID && !msg.translatedText && msg.targetLanguage !== targetLanguage) {
        // Only translate if it's for me, from another user, not yet translated for this target language
        const translated = await translateText(msg.originalText, targetLanguage);
        if (translated && translated !== msg.originalText) {
           const updatedMsg = { ...msg, translatedText: translated, targetLanguage: targetLanguage };
           setAllMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m)); // Now uses setAllMessages
        }
      } else if (msg.recipientId === currentUser.id && msg.senderId === AI_USER_ID && msg.targetLanguage !== targetLanguage) {
        // Translate AI messages too
         const translated = await translateText(msg.originalText, targetLanguage);
         if (translated && translated !== msg.originalText) {
           const updatedMsg = { ...msg, translatedText: translated, targetLanguage: targetLanguage };
           setAllMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m)); // Now uses setAllMessages
         }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatMessages, targetLanguage, currentUser, setAllMessages]); // Added setAllMessages to dependency array

  if (!currentUser) {
    return <div className="text-center p-8 text-slate-400">Loading chat... Please ensure you are logged in.</div>;
  }

  const activePartnerProfile = activePartnerId === AI_USER_ID ? { name: 'AI Assistant' } : getUserById(activePartnerId || '');

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20)-theme(spacing.10)-52px)] bg-slate-850 shadow-2xl rounded-xl animate-fadeIn overflow-hidden border border-slate-700">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
      />
      <div className="flex flex-col flex-1 bg-slate-800">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-teal-400">{activePartnerProfile?.name || 'Chat'}</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-2 text-sm">
              <div className="flex items-center">
                <label htmlFor="targetLanguage" className="text-slate-300 mr-2">Translate incoming to:</label>
                <select
                  id="targetLanguage"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as Language)}
                  className="bg-slate-700 text-slate-200 border border-slate-600 rounded-md py-1.5 px-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  disabled={isLoading}
                >
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              {activePartnerId === AI_USER_ID && (
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-teal-300 transition-colors">
                <input
                  type="checkbox"
                  checked={useGoogleSearch}
                  onChange={(e) => setUseGoogleSearch(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-teal-500 bg-slate-600 border-slate-500 rounded focus:ring-teal-500 focus:ring-offset-slate-800"
                  disabled={isLoading}
                />
                <span>Use Google Search (AI Only)</span>
              </label>
              )}
          </div>
        </div>

        <div className="flex-grow p-4 md:p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {currentChatMessages.map(msg => (
            <ChatBubble key={msg.id} message={msg} currentUser={currentUser} getAvatar={getAvatar} />
          ))}
          <div ref={messagesEndRef} />
          {currentChatMessages.length === 0 && (
            <div className="text-center text-slate-500 pt-10">No messages in this conversation yet. Say hello!</div>
          )}
        </div>

        {isLoading && activePartnerId === AI_USER_ID && (
          <div className="px-4 pb-1 text-xs text-center text-teal-400/80">
            AI is thinking...
          </div>
        )}

        <div className="p-4 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder={activePartnerId ? `Message ${activePartnerProfile?.name || '...'}` : "Select a conversation"}
              className="flex-grow bg-slate-700 text-slate-100 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-400 transition-colors"
              disabled={isLoading || !activePartnerId}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim() || !activePartnerId}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 transform active:scale-95"
              aria-label="Send message"
            >
              {isLoading && activePartnerId === AI_USER_ID ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
