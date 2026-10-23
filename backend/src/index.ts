import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import loadsRoutes from './routes/loads';
import dashboardRoutes from './routes/dashboard';
import predictionsRoutes from './routes/predictions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/loads', loadsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/predictions', predictionsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TruckBiz backend running on port ${PORT}`);
});

export default app;
