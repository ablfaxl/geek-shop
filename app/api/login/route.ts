import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
	try {
		const { identifier, password } = await req.json();

		if (!identifier || !password) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		const user = await prisma.user.findFirst({
			where: {
				OR: [{ email: identifier }, { username: identifier }],
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		const valid = await bcrypt.compare(password, user.password!);
		if (!valid) {
			return NextResponse.json(
				{ error: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		if (!process.env.TOKEN_SECRET || process.env.TOKEN_SECRET.length < 32) {
			console.error(
				'TOKEN_SECRET must be defined and have a minimum length of 32 characters'
			);
		}

		const token = jwt.sign(
			{ sub: user.id, username: user.username, email: user.email },
			process.env.TOKEN_SECRET!,
			{ expiresIn: '7d' }
		);

		// Create response and set HTTP-only cookie
		const response = NextResponse.json({
			user: { id: user.id, username: user.username, email: user.email },
		});

		response.cookies.set({
			name: 'token',
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
