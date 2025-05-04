import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const currentUser = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!currentUser?.isAdmin) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const url = new URL(request.url);
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
		const search = url.searchParams.get('search') || '';

		const skip = (page - 1) * pageSize;
		const take = pageSize;

		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				email: true,
				isAdmin: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				OR: [
					{ username: { contains: search, mode: 'insensitive' } },
					{ email: { contains: search, mode: 'insensitive' } },
				],
			},
			orderBy: { createdAt: 'desc' },
			skip,
			take,
		});

		const totalUsers = await prisma.user.count({
			where: {
				OR: [
					{ username: { contains: search, mode: 'insensitive' } },
					{ email: { contains: search, mode: 'insensitive' } },
				],
			},
		});
		const totalPages = Math.ceil(totalUsers / pageSize);

		return NextResponse.json({
			users,
			page,
			pageSize,
			totalPages,
			totalUsers,
		});
	} catch (error) {
		console.error('Get users error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
