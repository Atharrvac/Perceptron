
import { API_BASE_URL } from '../constants';
import { Task, AppliedTask } from '../types';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export const applyForTask = async (userId: string, taskId: string): Promise<{success: boolean, message: string}> => {
  const response = await fetch(`${API_BASE_URL}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, taskId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to apply for task' }));
    throw new Error(errorData.message || 'Failed to apply for task');
  }
  return response.json();
};

export const fetchAppliedTasks = async (userId: string): Promise<AppliedTask[]> => {
  const response = await fetch(`${API_BASE_URL}/applications/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch applied tasks');
  }
  return response.json();
};
