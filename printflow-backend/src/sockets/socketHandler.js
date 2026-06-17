const User = require('../models/User');

let ioInstance = null;
const userSockets = new Map(); // clerkId -> Set(socketId)
const socketToUser = new Map(); // socketId -> clerkId

// Try to load Clerk server SDK if available
let clerkClient = null;
try {
  clerkClient = require('@clerk/clerk-sdk-node');
} catch (e) {
  console.warn('clerk sdk not installed, socket auth will be best-effort');
}

function _safeJoinRoom(socket, room) {
  try { socket.join(room); } catch (e) { console.warn('join room failed', room, e.message || e); }
}

async function handleConnection(socket) {
  try {
    const auth = socket.handshake.auth || {};
    const token = auth.token;
    const clerkUserId = auth.clerkUserId || auth.clerkId || null;

    let clerkId = clerkUserId;

    // Verify session token if clerk SDK is available
    if (token && clerkClient && clerkClient.sessions) {
      try {
        // Some versions expose verifySessionToken, others use getSession
        if (typeof clerkClient.sessions.verifySessionToken === 'function') {
          const v = await clerkClient.sessions.verifySessionToken(token);
          if (v && v.subject) clerkId = v.subject;
        } else if (typeof clerkClient.sessions.getSession === 'function') {
          const session = await clerkClient.sessions.getSession({ sessionToken: token });
          if (session && session.userId) clerkId = session.userId;
        }
      } catch (err) {
        console.warn('Clerk session verify failed', err.message || err);
      }
    }

    if (!clerkId) {
      // Disconnect unauthenticated sockets
      socket.emit('unauthorized', { message: 'Missing clerk credentials' });
      return socket.disconnect(true);
    }

    // Record mapping
    socketToUser.set(socket.id, clerkId);
    if (!userSockets.has(clerkId)) userSockets.set(clerkId, new Set());
    userSockets.get(clerkId).add(socket.id);

    // Join user private room
    _safeJoinRoom(socket, `user:${clerkId}`);

    // Lookup user role from DB (best-effort)
    let role = null;
    try {
      const user = await User.findOne({ clerkId });
      role = user ? user.role : null;
    } catch (err) {
      console.warn('user lookup failed during socket connect', err.message || err);
    }

    if (role) {
      _safeJoinRoom(socket, `role:${role}`);
    }

    socket.emit('connected', { clerkId, role });

    socket.on('join_user_room', () => {
      _safeJoinRoom(socket, `user:${clerkId}`);
    });

    socket.on('disconnect', () => {
      const u = socketToUser.get(socket.id);
      if (u) {
        const set = userSockets.get(u);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) userSockets.delete(u);
        }
        socketToUser.delete(socket.id);
      }
    });

  } catch (e) {
    console.warn('socket connect handler error', e.message || e);
  }
}

function init(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    handleConnection(socket);
  });
}

function emitToUser(clerkId, event, payload) {
  if (!ioInstance) return;
  try { ioInstance.to(`user:${clerkId}`).emit(event, payload); } catch (e) { console.warn('emitToUser failed', e.message || e); }
}

function emitToRole(role, event, payload) {
  if (!ioInstance) return;
  try { ioInstance.to(`role:${role}`).emit(event, payload); } catch (e) { console.warn('emitToRole failed', e.message || e); }
}

module.exports = {
  init,
  emitToUser,
  emitToRole,
  _internal: { userSockets, socketToUser }
};
