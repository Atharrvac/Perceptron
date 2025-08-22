
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data stores
const tasks = [
  { id: '1', title: 'Community Garden Helper', lat: 51.505, lng: -0.09, description: 'Help plant new flowers in the community garden. Looking for volunteers for a weekend event.' },
  { id: '2', title: 'Tech Meetup Volunteer', lat: 51.515, lng: -0.10, description: 'Assist with registration and setup for a local tech meetup. Evening availability preferred.' },
  { id: '3', title: 'Library Book Organizer', lat: 51.500, lng: -0.12, description: 'Organize and shelve books at the public library. Flexible hours during weekdays.' },
  { id: '4', title: 'Local Park Cleanup Crew', lat: 51.520, lng: -0.08, description: 'Join us for a park cleanup initiative this Saturday morning. Equipment provided.' },
  { id: '5', title: 'Frontend Feedback Session', lat: 51.495, lng: -0.11, description: 'Provide feedback on a new web application prototype. 1-hour remote session.' }
];

let applications = []; // Stores { userId, taskId, appliedAt }

// --- Routes ---

// GET /tasks - returns static array of tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST /apply - accepts { userId, taskId }, stores in memory, and returns success
app.post('/apply', (req, res) => {
  const { userId, taskId } = req.body;

  if (!userId || !taskId) {
    return res.status(400).json({ success: false, message: 'User ID and Task ID are required.' });
  }

  const taskExists = tasks.some(task => task.id === taskId);
  if (!taskExists) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const alreadyApplied = applications.some(app => app.userId === userId && app.taskId === taskId);
  if (alreadyApplied) {
    return res.status(409).json({ success: false, message: 'You have already applied for this task.' });
  }

  const newApplication = {
    userId,
    taskId,
    appliedAt: new Date().toISOString()
  };
  applications.push(newApplication);

  console.log(`User ${userId} applied for task ${taskId}`);
  res.status(201).json({ success: true, message: 'Successfully applied for the task.' });
});

// GET /applications/:userId - returns all tasks applied by this user
app.get('/applications/:userId', (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  const userApplications = applications.filter(app => app.userId === userId);
  
  const populatedApplications = userApplications.map(app => {
    const taskDetails = tasks.find(task => task.id === app.taskId);
    return taskDetails ? { ...taskDetails, appliedAt: app.appliedAt } : null;
  }).filter(Boolean); // Filter out nulls if a task was somehow deleted or ID mismatch

  res.json(populatedApplications);
});

app.listen(PORT, () => {
  console.log(`HDTN Backend server running on http://localhost:${PORT}`);
});
