import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import productRoutes from './route/productRoute.js';
import billRoutes from './route/billRoute.js';
import staffRoutes from './route/staffRoute.js';
import { initializeAdmin } from './utils/DataLoader.js';

dotenv.config();

const app = express();

// ✅ CORS setup for React frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/staff', staffRoutes);

// ✅ Root route
app.get('/', (_, res) => res.send('🚀 Scanify Backend Ready'));

// ✅ Create HTTP server to attach WebSocket server
const server = http.createServer(app);

// ✅ Setup WebSocket server
const wss = new WebSocketServer({ server });

// ✅ Store staff socket references: { staffId => { scanSocket, billSocket } }
const staffSockets = new Map();

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

      // ✅ Barcode scanned (sell or return)
      else if (data.type === 'barcode-scanned' && data.staffId && data.barcode) {
        const action = data.action || 'sell'; // default to 'sell'
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

// ✅ Start MongoDB + HTTP + WebSocket server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await initializeAdmin();
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`✅ Server & WS running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err.message));
