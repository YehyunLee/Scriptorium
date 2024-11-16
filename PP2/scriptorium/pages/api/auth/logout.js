/**
 * Logout API: Clear the user's session
 * Allowed method: POST
 * Url: /api/auth/logout
 * Access: User
 * Payload: None
 */
export default function handler(req, res) {
    if (req.method === 'POST') {
        // Clear the token or handle session termination as necessary
        res.status(200).json({ message: 'Logout successful' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}