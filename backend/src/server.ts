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
    // Attempt database initialization
    await initializeDatabase();
    
    // Auto-seed database if running dev
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn('⚠️ Seeding skipped or completed with warnings:', seedErr);
    }
  } catch (dbError) {
    console.error('⚠️ Could not connect to MySQL server during startup.', dbError);
    console.error('👉 Ensure MySQL is running locally on port 3306 with credentials in .env');
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Mini ERP + CRM Backend running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
};

startServer();
