import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const product = await prisma.product.findUnique({
			where: { id: parseInt(params.id) },
		});
		return NextResponse.json(product);
	} catch (error) {
		console.log(error);
		return NextResponse.json({ error: 'Product not found' }, { status: 404 });
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const { ...body } = await request.json();

		const session = await getServerSession(authOptions);
		if (!session)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const product = await prisma.product.update({
			where: { id: parseInt(params.id) },
			data: {
				...body,
				price: parseFloat(body.price),
				stock: parseInt(body.stock),
				userId: session.user.id,
			},
		});

		return NextResponse.json(product);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Failed to update product' },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		await prisma.product.delete({
			where: { id: parseInt(params.id) },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: 'Failed to delete product' },
			{ status: 500 },
		);
	}
}
