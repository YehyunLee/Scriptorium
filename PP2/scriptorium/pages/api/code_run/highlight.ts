import hljs from 'highlight.js'; //library from https://highlightjs.org/
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Highlight code: returns highlighted code
 * Allowed method: POST
 * Url: /api/code_run/highlight
 * Access: Public
 * Payload: { code: string, language: string }
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'POST') {
        const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ message: 'Error: Code and Language are required' });
    }

    try {
        //returns an object with value property that has highlighted code
        const highlightedCode = hljs.highlight(code, { language }).value;

        res.status(200).json({ highlightedCode });
        } catch (error: any) {
            res.status(500).json({ error: 'Error: Failure to highlight code', details: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method is not allowed' });
    }
}
