import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import challanRoutes from './routes/challanRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { initializeDatabase } from './db/initDb';
import { seedDatabase } from './db/seedDb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS & Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Mini ERP + CRM Backend API'
  });
});

// Explicit Database Initialization & Seeding Endpoint
app.get('/api/db/init-and-seed', async (_req: Request, res: Response) => {
  try {
    await initializeDatabase();
    await seedDatabase();
    return res.json({
      success: true,
      message: 'Aiven Cloud MySQL Database initialized and seeded successfully with all tables and demo accounts!'
    });
  } catch (error: any) {
    console.error('Error during init-and-seed endpoint execution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize and seed database.',
      error: error.message
    });
  }
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and initialize DB connection
const startServer = async () => {
  try {
    await initializeDatabase();
    await seedDatabase();
    console.log('✅ Auto Database Initialized & Seeded.');
  } catch (dbError) {
    console.error('⚠️ Could not connect or initialize MySQL database during startup.', dbError);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Mini ERP + CRM Backend running on port ${PORT}`);
    console.log(`=======================================================`);
  });
};

startServer();
