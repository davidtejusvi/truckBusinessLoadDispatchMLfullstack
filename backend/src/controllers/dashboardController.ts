import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  // Mock dashboard stats
  const stats = {
    activeLoads: 3,
    totalRevenue: 12850,
    loadsThisWeek: 7,
    milesThisWeek: 4230,
    revenueThisMonth: 38400,
    pendingLoads: 2,
  };
  res.json(stats);
};
