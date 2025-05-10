import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		// Check for query parameter to get all products
		const publicProducts = await prisma.product.findMany({
			where: {
				status: 'ACTIVE',
			},
			include: {
				category: true,
			},
			orderBy: {
				createdAt: 'asc',
			},
			take: 5,
		});
		return NextResponse.json(publicProducts);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: 'Failed to fetch products' },
			{ status: 500 }
		);
	}
}
