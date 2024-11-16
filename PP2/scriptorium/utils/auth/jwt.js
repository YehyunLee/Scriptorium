import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_fill_later';

function generateToken(userId) {
    return jwt.sign({userId}, JWT_SECRET, {expiresIn: '1h'});
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Exports
export {generateToken, verifyToken};