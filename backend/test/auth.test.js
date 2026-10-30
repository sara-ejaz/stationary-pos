const test = require('node:test');
const assert = require('node:assert');

const {
    initUsers,
    authenticate,
    signToken,
    verifyToken,
    toPublicUser,
    requireAuth
} = require('../auth');

test.before(async () => {
    await initUsers();
});

test('accepts the seeded admin credentials', async () => {
    const user = await authenticate('admin@gmail.com', 'Admin@123');
    assert.ok(user);
    assert.strictEqual(user.role, 'Admin');
    assert.strictEqual(user.email, 'admin@gmail.com');
});

test('accepts a login by username as well as by email', async () => {
    const user = await authenticate('cashier', 'Cashier@123');
    assert.ok(user);
    assert.strictEqual(user.role, 'Cashier');
});

test('rejects a wrong password', async () => {
    const user = await authenticate('admin@gmail.com', 'wrong-password');
    assert.strictEqual(user, null);
});

test('rejects an unknown account', async () => {
    const user = await authenticate('ghost@fojibook.com', 'Admin@123');
    assert.strictEqual(user, null);
});

test('never exposes the password hash', async () => {
    const user = await authenticate('inventory', 'Inventory@123');
    const publicUser = toPublicUser(user);
    assert.ok(!('passwordHash' in publicUser));
    assert.ok(!('password' in publicUser));
});

test('signs a token that verifies back to the same user', () => {
    const user = { id: 'staff_admin', name: 'admin', email: 'admin@gmail.com', username: 'admin', role: 'Admin' };
    const payload = verifyToken(signToken(user));
    assert.ok(payload);
    assert.strictEqual(payload.sub, 'staff_admin');
    assert.strictEqual(payload.role, 'Admin');
    assert.ok(payload.exp > payload.iat);
});

test('rejects a tampered token', () => {
    const token = signToken({ id: 'staff_admin', name: 'x', email: 'x@y.z', username: 'x', role: 'Admin' });
    const [body, signature] = token.split('.');
    const tampered = `${body}.${signature.slice(0, -1)}${signature.slice(-1) === 'A' ? 'B' : 'A'}`;
    assert.strictEqual(verifyToken(tampered), null);
});

test('requireAuth answers 401 without a bearer token', () => {
    let statusCode = null;
    let body = null;

    const req = { get: () => undefined };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(payload) {
            body = payload;
            return this;
        }
    };

    requireAuth(req, res, () => assert.fail('next() must not be called for an anonymous request'));

    assert.strictEqual(statusCode, 401);
    assert.strictEqual(body.success, false);
});
