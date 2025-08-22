
export interface Task {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
}

export interface AppliedTask extends Task {
  appliedAt?: string; // Optional: if backend provides this
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}
