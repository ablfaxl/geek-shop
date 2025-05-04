import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
	try {
		// Get the session to check authorization
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

		// Get pagination and search parameters from the query string
		const url = new URL(request.url);
		const page = parseInt(url.searchParams.get('page') || '1', 10); // Default page to 1
		const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10); // Default page size to 10
		const search = url.searchParams.get('search') || ''; // Default to empty string if no search term is provided

		// Calculate skip and take for pagination
		const skip = (page - 1) * pageSize;
		const take = pageSize;

		// Get users with pagination and search query
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
			skip, // Skip records based on page
			take, // Limit the number of records per page
		});

		// Count total users to calculate total pages
		const totalUsers = await prisma.user.count({
			where: {
				OR: [
					{ username: { contains: search, mode: 'insensitive' } },
					{ email: { contains: search, mode: 'insensitive' } },
				],
			},
		});
		const totalPages = Math.ceil(totalUsers / pageSize);

		// Return users with pagination info
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
