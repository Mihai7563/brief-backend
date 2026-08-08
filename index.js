import express from 'express';
import briefRoutes from './routes/briefs.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';

const app = express();
const port = 3000;

app.use(express.json());

try {
  app.use('/api/briefs', briefRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('Error setting up routes:', error);
  process.exit(1); // Exit the application if routes cannot be set up
}

app.get('/', (req, res) => {
  res.send('API is actually working!');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});