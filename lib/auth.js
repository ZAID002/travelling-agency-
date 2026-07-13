import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'flytoway-secret-key-12345';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
