import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
	try {
		// Check for query parameter to get all products
		const url = new URL(request.url);
		const showAll = url.searchParams.get('all');

		// Get user session
		const session = await getServerSession(authOptions);
		if (Boolean(showAll)) {
			const publicProducts = await prisma.product.findMany({
				where: {
					status: 'ACTIVE',
				},
			});
			console.log('publicProducts', publicProducts);
			return NextResponse.json(publicProducts);
		}
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const userProducts = await prisma.product.findMany({
			where: {
				userId: parseInt(session.user.id),
			},
		});

		return NextResponse.json(userProducts);
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
