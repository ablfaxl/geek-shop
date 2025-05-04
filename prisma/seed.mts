// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const BATCH_SIZE = 10000; // Number of records to create per batch
const TOTAL_USERS = 100000; // Total users to create
const TOTAL_CATEGORIES = 50; // Create 50 categories
// const TOTAL_PRODUCTS = 200000; // Total products to create
// const TOTAL_REVIEWS = 500000; // Total reviews to create

async function main() {
	console.log('Seeding database with large dataset...');

	// Create Categories
	const existingCategories = await prisma.category?.findMany({ select: { id: true } });
	if (existingCategories?.length === 0) {
		console.log('Creating categories...');
		const categories = Array.from({ length: TOTAL_CATEGORIES }, () => ({
			name: faker.commerce.department(),
		}));

		await prisma.category.createMany({
			data: categories,
		});
		console.log(`${TOTAL_CATEGORIES} categories created.`);
	} else {
		console.log('Categories already exist, skipping creation.');
	}

	// Track progress
	let currentCount = 0;
	const existingUsers = await prisma.user.findMany({ select: { id: true } });
	const existingUsersCount = existingUsers.length;

	// Generate Users
	console.log('Creating users...');
	while (currentCount < TOTAL_USERS) {
		const userBatch = Array.from({ length: BATCH_SIZE }, () => ({
			email: faker.internet.email(),
			username: faker.internet.userName(),
			password: faker.internet.password(12),
			isAdmin: faker.datatype.boolean(),
			emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
			createdAt: faker.date.past(),
			updatedAt: faker.date.recent(),
		}));

		for (const user of userBatch) {
			// Check if user already existsØ
			if (!existingUsers.some(existingUser => existingUser.email === user.email)) {
				await prisma.user.create({
					data: user,
				});
			}
		}
		currentCount += BATCH_SIZE;
		console.log(`Inserted ${currentCount + existingUsersCount} users so far.`);
	}

	// Create Products
	// Re-fetch existing data to reference later
	// const existingProducts = await prisma.product.findMany({ select: { id: true } });
	// currentCount = 0;
	//
	// console.log('Creating products...');
	// while (currentCount < TOTAL_PRODUCTS) {
	// 	const productBatch = Array.from({ length: BATCH_SIZE }, () => ({
	// 		name: faker.commerce.productName(),
	// 		description: faker.commerce.productDescription(),
	// 		price: parseFloat(faker.commerce.price()),
	// 		stock: faker.datatype.number({ min: 0, max: 100 }),
	// 		status: faker.helpers.arrayElement([
	// 			'DRAFT',
	// 			'ACTIVE',
	// 			'OUT_OF_STOCK',
	// 			'LOW_STOCK',
	// 		]),
	// 		categoryId: faker.datatype.number({ min: 1, max: TOTAL_CATEGORIES }), // Assuming those IDs exist
	// 		image: faker.image.imageUrl(),
	// 		userId: faker.datatype.number({ min: 1, max: existingUsersCount }), // Using existing user IDs
	// 		createdAt: faker.date.past(),
	// 		updatedAt: faker.date.recent(),
	// 	}));
	//
	// 	for (const product of productBatch) {
	// 		if (!existingProducts.some(existingProduct => existingProduct.id === product.id)) {
	// 			await prisma.product.create({
	// 				data: product,
	// 			});
	// 		}
	// 	}
	// 	currentCount += BATCH_SIZE;
	// 	console.log(`Inserted ${currentCount} products so far.`);
	// }
	//
	// // Create Reviews
	// const existingReviews = await prisma.review.findMany({ select: { id: true } });
	// currentCount = 0;
	//
	// console.log('Creating reviews...');
	// while (currentCount < TOTAL_REVIEWS) {
	// 	const reviewBatch = Array.from({ length: BATCH_SIZE }, () => ({
	// 		rating: faker.datatype.number({ min: 1, max: 5 }),
	// 		comment: faker.lorem.sentence(),
	// 		userId: faker.datatype.number({ min: 1, max: existingUsersCount }),
	// 		productId: faker.datatype.number({ min: 1, max: existingProducts.length }), // Use existing products
	// 		createdAt: faker.date.past(),
	// 		updatedAt: faker.date.recent(),
	// 	}));
	//
	// 	for (const review of reviewBatch) {
	// 		if (!existingReviews.some(existingReview => existingReview.id === review.id)) {
	// 			await prisma.review.create({
	// 				data: review,
	// 			});
	// 		}
	// 	}
	// 	currentCount += BATCH_SIZE;
	// 	console.log(`Inserted ${currentCount} reviews so far.`);
	// }

	console.log('Seeding complete!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});