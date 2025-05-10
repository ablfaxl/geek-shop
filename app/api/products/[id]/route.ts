import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const productSchema = z.object({
	name: z.string().min(1),
	price: z
		.string()
		.or(z.number())
		.transform((val) => parseFloat(String(val))),
	stock: z
		.string()
		.or(z.number())
		.transform((val) => parseInt(String(val))),
	description: z.string().optional(),
	status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'LOW_STOCK']),
});

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = params.id;
		const productId = parseInt(id);
		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: 'Invalid product ID' },
				{ status: 400 }
			);
		}

		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		return NextResponse.json(product);
	} catch (error) {
		console.error('GET Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch product' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		const id = params.id;
		const productId = parseInt(id);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: 'Invalid product ID' },
				{ status: 400 }
			);
		}

		const existingProduct = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!existingProduct) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		if (existingProduct.userId !== Number(session.user.id)) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const body = await request.json();
		const validatedData = productSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validatedData.error },
				{ status: 400 }
			);
		}

		const product = await prisma.product.update({
			where: { id: productId },
			data: {
				...validatedData.data,
				userId: Number(session.user.id),
			},
		});

		return NextResponse.json(product);
	} catch (error) {
		console.error('PUT Error:', error);
		return NextResponse.json(
			{ error: 'Failed to update product' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = params.id;
		const productId = parseInt(id);
		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: 'Invalid product ID' },
				{ status: 400 }
			);
		}

		// Check if product exists and belongs to user
		const existingProduct = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!existingProduct) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		if (existingProduct.userId !== Number(session.user.id)) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		await prisma.product.delete({
			where: { id: productId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('DELETE Error:', error);
		return NextResponse.json(
			{ error: 'Failed to delete product' },
			{ status: 500 }
		);
	}
}
