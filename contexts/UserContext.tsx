
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { MOCK_USER, OTHER_USERS_ON_MAP, AI_USER_ID } from '../constants';

interface UserContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  allMessages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setAllMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>; // Added this
  knownUsers: UserProfile[];
  getUserById: (id: string) => UserProfile | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to generate a consistent conversation ID
export const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('-');
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USER);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  
  const knownUsers = [MOCK_USER, ...OTHER_USERS_ON_MAP].filter(user => user !== null) as UserProfile[];

  const getUserById = (id: string): UserProfile | undefined => {
    return knownUsers.find(user => user.id === id);
  };

  const addMessage = (message: ChatMessage) => {
    setAllMessages(prevMessages => [...prevMessages, message]);
  };

  // Initialize with some mock messages
  useEffect(() => {
    if (currentUser) {
      const initialMessages: ChatMessage[] = [
        {
          id: 'greeting-' + Date.now(),
          conversationId: getConversationId(currentUser.id, AI_USER_ID),
          senderId: AI_USER_ID,
          recipientId: currentUser.id,
          originalText: "Hello! I'm your multilingual assistant. How can I help you today? I can also translate your messages to other users!",
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        },
        // Example message from another user to current user for testing
        {
          id: 'mockmsg-' + Date.now(),
          conversationId: getConversationId(currentUser.id, 'user002'), // Bella Ciao
          senderId: 'user002',
          recipientId: currentUser.id,
          originalText: "Hi Alex! Saw your profile, cool stuff!",
          timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        }
      ];
      setAllMessages(initialMessages);
    }
  }, [currentUser?.id]);


  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, allMessages, addMessage, setAllMessages, knownUsers, getUserById }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
