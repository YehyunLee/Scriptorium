import bcrypt from 'bcryptjs';
import prisma from '../../../utils/prisma';
import {validatePassword} from "../../../utils/auth/auth";


/**
 * Signup API: Create a new user
 * Allowed method: POST
 * Url: /api/auth/signup
 * Access: Public
 * Payload: {email, firstName, lastName, password, phone, avatar}
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({message: `Method ${req.method} not allowed`});
        return;
    }

    const {email, firstName, lastName, password, phone, avatar} = req.body;

    if (!email || !password) {
        res.status(400).json({error: 'Email and password are required'});
        return;
    }

    if (!validatePassword(password)) {
        res.status(400).json({error: 'Password is not strong enough'});
        return;
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user_data = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phone,
        avatarUrl: avatar,
        passwordHash: hashedPassword,
    }

    // Check if user already exists
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (existingUser) {
            res.status(400).json({error: 'User already exists'});
            return;
        }
    } catch (error) {
        res.status(500).json({error: 'User creation failed'});
        return;
    }

    // Create the user
    try {
        const user = await prisma.user.create({
            data: user_data,
        });
        res.status(201).json({message: 'User created successfully', user});
    } catch (error) {
        res.status(500).json({error: 'User creation failed'});
    }
}
