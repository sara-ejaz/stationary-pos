require('dotenv').config();

const express = require('express');
const {
    initUsers,
    authenticate,
    toPublicUser,
    signToken,
    requireAuth
} = require('./auth');

const app = express();
const PORT = Number(process.env.PORT) || 8000;

// ---------------------------------------------------------------------------
// CORS - only the local frontend origins are allowed to talk to this API
// ---------------------------------------------------------------------------
const EXTRA_ORIGINS = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (EXTRA_ORIGINS.includes(origin)) return true;
    try {
        const { hostname } = new URL(origin);
        return hostname === 'localhost' || hostname === '127.0.0.1';
    } catch {
        return false;
    }
};

app.use((req, res, next) => {
    const origin = req.get('origin');

    if (origin && isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    return next();
});

app.use(express.json());

// ---------------------------------------------------------------------------
// Brute force protection - a locked account is released after the cooldown
// ---------------------------------------------------------------------------
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 5 * 60 * 1000;
const attempts = new Map();

const attemptState = (key) => {
    const record = attempts.get(key);
    if (!record) return { count: 0, firstAt: Date.now(), lockedUntil: 0 };
    return record;
};

const registerFailure = (key) => {
    const now = Date.now();
    const record = attemptState(key);

    if (now - record.firstAt > ATTEMPT_WINDOW_MS) {
        attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
        return;
    }

    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_MS;
    }
    attempts.set(key, record);
};

const clearFailures = (key) => attempts.delete(key);

const lockoutRemaining = (key) => {
    const record = attemptState(key);
    if (!record.lockedUntil || record.lockedUntil <= Date.now()) return 0;
    return Math.ceil((record.lockedUntil - Date.now()) / 1000);
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
    res.json({ success: true, status: 'ok', service: 'foji-book-pos-api' });
});

/**
 * POST /login
 * Authenticates a staff member and returns a signed session token.
 */
app.post('/login', async (req, res) => {
    const { email, username, password } = req.body || {};
    const identifier = email || username;

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required.'
        });
    }

    const throttleKey = String(identifier).trim().toLowerCase();
    const lockedFor = lockoutRemaining(throttleKey);
    if (lockedFor > 0) {
        return res.status(429).json({
            success: false,
            message: `Too many failed attempts. Try again in ${Math.ceil(lockedFor / 60)} minute(s).`
        });
    }

    const user = await authenticate(identifier, password);

    if (!user) {
        registerFailure(throttleKey);
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password.'
        });
    }

    clearFailures(throttleKey);

    return res.json({
        success: true,
        message: 'Login successful',
        token: signToken(user),
        user: toPublicUser(user)
    });
});

/**
 * GET /me
 * Verifies the bearer token and returns the staff member behind it.
 */
app.get('/me', requireAuth, (req, res) => {
    const { sub, name, email, username, role } = req.user;
    return res.json({
        success: true,
        user: { id: sub, name, email, username, role }
    });
});

/**
 * POST /logout
 * Tokens are stateless, so the client discards it. The endpoint exists so the
 * POS can record the sign out event.
 */
app.post('/logout', requireAuth, (req, res) => {
    return res.json({ success: true, message: 'Signed out' });
});

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('Unhandled server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

initUsers()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Foji Book POS API running on http://localhost:${PORT}`);
            console.log('Seeded staff: admin@gmail.com / Admin@123 (Admin)');
        });
    })
    .catch((err) => {
        console.error('Failed to initialise staff accounts:', err);
        process.exit(1);
    });
