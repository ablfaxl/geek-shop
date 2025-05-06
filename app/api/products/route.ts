import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
	try {
		// Check for query parameter to get all products
		const url = new URL(request.url);
		const showAll = url.searchParams.get('all');
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
		const search = url.searchParams.get('search') || '';

		const skip = (page - 1) * pageSize;
		const take = pageSize;

		// Get user session
		const session = await getServerSession(authOptions);

		// Base search condition that will be used in both queries
		const searchCondition = search
			? {
				OR: [
					{ name: { contains: search, mode: 'insensitive' as const } },
					{ description: { contains: search, mode: 'insensitive' as const } },
				],
			}
			: {};

		if (Boolean(showAll)) {
			// Count total products for pagination
			const totalProducts = await prisma.product.count({
				where: {
					status: 'ACTIVE',
					...searchCondition,
				},
			});

			// Get paginated products
			const publicProducts = await prisma.product.findMany({
				where: {
					status: 'ACTIVE',
					...searchCondition,
				},
				include: {
					category: true, // Include the category relation
				},
				skip,
				take,
				orderBy: {
					createdAt: 'desc',
				},
			});

			return NextResponse.json({
				products: publicProducts,
				pagination: {
					total: totalProducts,
					page,
					pageSize,
					pageCount: Math.ceil(totalProducts / pageSize),
				}
			});
		}

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Count total user products for pagination
		const totalUserProducts = await prisma.product.count({
			where: {
				userId: parseInt(session.user.id),
				...searchCondition,
			},
		});

		// Get paginated user products
		const userProducts = await prisma.product.findMany({
			where: {
				userId: parseInt(session.user.id),
				...searchCondition,
			},
			include: {
				category: true, // Include the category relation
			},
			skip,
			take,
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({
			products: userProducts,
			pagination: {
				total: totalUserProducts,
				page,
				pageSize,
				pageCount: Math.ceil(totalUserProducts / pageSize),
			}
		});
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: 'Failed to fetch products' },
			{ status: 500 },
		);
	}
}
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const body = await request.json();
		const product = await prisma.product.create({
			data: {
				...body,
				price: parseFloat(body.price),
				stock: parseInt(body.stock),
				userId: parseInt(session.user.id),
			},
		});
		return NextResponse.json(product);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: 'Failed to create product' },
			{ status: 500 },
		);
	}
}
