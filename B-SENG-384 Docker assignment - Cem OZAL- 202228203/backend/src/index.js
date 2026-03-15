const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status:    'OK',
    message:   'LexiAI Portfolio Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Mock database data for the assignment
app.get('/api/posts', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'MLOps Automation Pipeline',
      domain: 'DevOps',
      expertise_needed: 'Docker, Jenkins, Python',
      status: 'completed',
      city: 'Ankara'
    },
    {
      id: 2,
      title: 'AI Portfolio Website',
      domain: 'Web Development',
      expertise_needed: 'React, Express, Docker',
      status: 'active',
      city: 'Istanbul'
    }
  ]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
