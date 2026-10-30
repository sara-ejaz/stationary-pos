/**
 * Foji Book Center POS - Authentication & Authorization
 *
 * Responsibilities:
 *  - Seed the staff accounts and store only scrypt password hashes in memory
 *  - Issue signed, expiring session tokens for authenticated staff
 *  - Verify tokens on protected routes and enforce role based access
 *
 * The user store is intentionally kept in memory so the POS boots without a
 * database. It is exposed through `authenticate()` so it can be swapped for a
 * MongoDB (Mongoose) backed repository without touching the routes.
 */

require('dotenv').config();

const crypto = require('crypto');

const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS) || 60 * 60 * 8; // 8 hour shift
const TOKEN_SECRET = process.env.JWT_SECRET || 'foji-book-pos-development-secret';

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

const VALID_ROLES = ['Admin', 'Cashier', 'Inventory Staff'];

/**
 * Seed staff accounts. Passwords are only used once at boot to derive a hash
 * and can be overridden through environment variables.
 */
const SEED_USERS = [
    {
        id: 'staff_admin',
        name: 'admin',
        email: 'admin@gmail.com',
        username: 'admin',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'Admin'
    },
    {
        id: 'staff_cashier',
        name: 'Ahmed Khan',
        email: 'cashier@fojibook.com',
        username: 'cashier',
        password: process.env.CASHIER_PASSWORD || 'Cashier@123',
        role: 'Cashier'
    },
    {
        id: 'staff_inventory',
        name: 'Bilal Ahmed',
        email: 'inventory@fojibook.com',
        username: 'inventory',
        password: process.env.INVENTORY_PASSWORD || 'Inventory@123',
        role: 'Inventory Staff'
    }
];

// Runtime user store: { id, name, email, username, role, passwordHash }
let userStore = [];

const hashPassword = (plainPassword) => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16);
        crypto.scrypt(plainPassword, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(`${salt.toString('hex')}.${derivedKey.toString('hex')}`);
        });
    });
};

const verifyPassword = (plainPassword, storedHash) => {
    return new Promise((resolve) => {
        const [saltHex, keyHex] = String(storedHash || '').split('.');
        if (!saltHex || !keyHex) return resolve(false);

        const expectedKey = Buffer.from(keyHex, 'hex');
        crypto.scrypt(plainPassword, Buffer.from(saltHex, 'hex'), expectedKey.length, SCRYPT_PARAMS, (err, derivedKey) => {
            if (err) return resolve(false);
            if (derivedKey.length !== expectedKey.length) return resolve(false);
            resolve(crypto.timingSafeEqual(derivedKey, expectedKey));
        });
    });
};

/** Hashes every seed account so plaintext passwords are never kept in memory. */
const initUsers = async () => {
    userStore = await Promise.all(
        SEED_USERS.map(async (seed) => ({
            id: seed.id,
            name: seed.name,
            email: seed.email,
            username: seed.username,
            role: seed.role,
            passwordHash: await hashPassword(seed.password)
        }))
    );
};

/**
 * Verifies staff credentials.
 * @returns {Promise<object|null>} the authenticated staff member, or null when rejected.
 */
const authenticate = async (identifier, password) => {
    const key = String(identifier || '').trim().toLowerCase();
    if (!key || !password) return null;

    const match = userStore.find(
        (u) => u.email.toLowerCase() === key || u.username.toLowerCase() === key
    );

    if (!match) {
        // Burn an equivalent amount of time so a missing account cannot be
        // detected faster than a wrong password.
        await hashPassword(String(password));
        return null;
    }

    const passwordMatches = await verifyPassword(String(password), match.passwordHash);
    if (!passwordMatches) return null;

    return toPublicUser(match);
};

/** Strips every secret before a user object leaves the server. */
const toPublicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role
});

const base64url = (value) => Buffer.from(value).toString('base64url');

/** Issues a signed session token for the given staff member. */
const signToken = (user) => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        iat: issuedAt,
        exp: issuedAt + TOKEN_TTL_SECONDS
    };
    const body = base64url(JSON.stringify(payload));
    const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
    return `${body}.${signature}`;
};

/**
 * Validates a session token.
 * @returns {object|null} the token payload, or null when the token is invalid or expired.
 */
const verifyToken = (token) => {
    if (typeof token !== 'string' || !token.includes('.')) return null;

    const [body, signature] = token.split('.');
    if (!body || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
    const given = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;

    let payload;
    try {
        payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
        return null;
    }

    if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role && !VALID_ROLES.includes(payload.role)) return null;

    return payload;
};

/** Rejects any request that does not carry a valid session token. */
const requireAuth = (req, res, next) => {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (!token || scheme.toLowerCase() !== 'bearer') {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please sign in.'
        });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({
            success: false,
            message: 'Your session is invalid or has expired. Please sign in again.'
        });
    }

    req.user = payload;
    return next();
};

/** Restricts a route to the given roles. Must run after `requireAuth`. */
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please sign in.'
        });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `This module requires ${allowedRoles.join(' or ')} access.`
        });
    }

    return next();
};

module.exports = {
    VALID_ROLES,
    TOKEN_TTL_SECONDS,
    initUsers,
    authenticate,
    toPublicUser,
    signToken,
    verifyToken,
    requireAuth,
    requireRole,
    hashPassword,
    verifyPassword
};
