import dns from 'node:dns';
import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  // On some Windows networks, Node's SRV lookup for mongodb+srv fails (ECONNREFUSED)
  // while nslookup works on the router DNS. Public resolvers fix that locally.
  if (process.platform === 'win32' && uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  await mongoose.connect(uri);
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
