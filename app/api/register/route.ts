import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
	try {
		const { username, email, password, repeatPassword } = await req.json();

		if (!username || !email || !password || !repeatPassword) {
			return NextResponse.json(
				{ error: 'All fields are required' },
				{ status: 400 }
			);
		}

		if (password !== repeatPassword) {
			return NextResponse.json(
				{ error: 'Passwords do not match' },
				{ status: 400 }
			);
		}

		const existing = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});

		if (existing) {
			return NextResponse.json(
				{ error: 'Username or email already in use' },
				{ status: 409 }
			);
		}

		const hashed = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { username, email, password: hashed },
		});
		// Add this after creating the user in your existing signup code
		const token = jwt.sign(
			{ sub: user.id, username: user.username, email: user.email },
			process.env.TOKEN_SECRET!,
			{ expiresIn: '7d' }
		);

		// Create response and set HTTP-only cookie
		const response = NextResponse.json(
			{ id: user.id, username: user.username, email: user.email },
			{ status: 201 }
		);

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
		// return NextResponse.json(
		//   { id: user.id, username: user.username, email: user.email },
		//   { status: 201 }
		// );
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// Optional: Handle other methods
export function GET() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export function PUT() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
