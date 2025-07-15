import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import productRoutes from './route/productRoute.js';
import billRoutes from './route/billRoute.js';
import staffRoutes from './route/staffRoute.js';
import chatRoutes from './route/chatRoute.js';
import { initializeAdmin } from './utils/DataLoader.js';

dotenv.config();

const app = express();

// ✅ CORS setup
// Allow specific origin and handle preflight
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  credentials: true
}));


// Optional: respond to preflight requests manually (if needed)
//app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Root route
app.get('/', (_, res) => res.send('🚀 Scanify Backend Ready'));

// ✅ Create HTTP server to attach WebSocket server
const server = http.createServer(app);

// ✅ WebSocket setup (single instance for Vercel)
const staffSockets = global.staffSockets || new Map();
const wss = global.wss || new WebSocketServer({ server });

if (!global.wss) {
  wss.on('connection', (socket) => {
    console.log('🔗 WebSocket client connected');

    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // ✅ Register scan or bill tab
        if (data.type === 'register' && data.staffId && data.clientType) {
          const existing = staffSockets.get(data.staffId) || {};
          if (data.clientType === 'scan') {
            existing.scanSocket = socket;
          } else if (data.clientType === 'bill') {
            existing.billSocket = socket;
          }
          staffSockets.set(data.staffId, existing);
          console.log(`✅ Registered ${data.clientType} for staffId: ${data.staffId}`);
        }

        // ✅ Barcode scanned
        else if (data.type === 'barcode-scanned' && data.staffId && data.barcode) {
          const action = data.action || 'sell';
          const target = staffSockets.get(data.staffId);
          if (target?.billSocket?.readyState === WebSocket.OPEN) {
            target.billSocket.send(JSON.stringify({
              type: 'barcode-broadcast',
              barcode: data.barcode,
              action: action
            }));
            console.log(`📤 Sent barcode (${action}) to bill tab for staffId: ${data.staffId}`);
          } else {
            console.warn(`⚠️ No active bill tab for staffId: ${data.staffId}`);
          }
        }

      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err.message);
      }
    });

    socket.on('close', () => {
      for (const [staffId, entry] of staffSockets.entries()) {
        if (entry.scanSocket === socket) entry.scanSocket = null;
        if (entry.billSocket === socket) entry.billSocket = null;
        if (!entry.scanSocket && !entry.billSocket) {
          staffSockets.delete(staffId);
          console.log(`🗑️ Cleaned up sockets for staffId: ${staffId}`);
        }
      }
      console.log('🔌 WebSocket client disconnected');
    });
  });

  global.wss = wss;
  global.staffSockets = staffSockets;
}

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await initializeAdmin();
    if (process.env.VERCEL !== "1") {
      const PORT = process.env.PORT || 4000;
      server.listen(PORT, () => {
        console.log(`✅ Server & WS running on http://localhost:${PORT}`);
      });
    }
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err.message));

// ✅ Export for Vercel serverless function
export default app;
