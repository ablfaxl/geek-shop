import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		// Authorization check
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get current user to verify admin status
		const currentUser = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!currentUser?.isAdmin) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				email: true,
				isAdmin: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json(users);
	} catch (error) {
		console.error('Get users error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
