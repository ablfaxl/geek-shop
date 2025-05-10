import { PrismaClient, Prisma, ProductStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

// ————————————————————————————————————————————————————————————————————
/**
 * The `prisma` variable represents an instance of the PrismaClient, which is used to interact with a database
 * using the Prisma ORM. It enables querying, creating, updating, and deleting data with a type-safe and
 * intuitive API.
 *
 * The PrismaClient is configured to log specific events, such as warnings and errors, to provide diagnostic
 * information during runtime. In this configuration, only 'warn' and 'error' log levels are enabled.
 *
 * This can be utilized to perform database operations in a structured and reliable manner while adhering
 * to the Prisma schema defined for the application.
 */
const prisma = new PrismaClient({ log: ['warn', 'error'] });
/**
 * Represents the constant total value set to one million.
 *
 * This variable is used to denote a predefined quantity or
 * a large base numeric limit in an application. The underscore
 * is used as a numeric separator for readability.
 *
 * Value: 1,000,000
 */
const TOTAL = 1_000_000; // rows per model (⚠️ huge!)
/**
 * Represents the standard size or quantity of items to be processed or handled
 * in a single batch operation. Typically used to define the maximum number
 * of items in a grouped set for processing, transactions, or similar operations.
 *
 * @constant {number}
 * @default 1000
 */
const BATCH = 1_000; // rows per createMany()
// ————————————————————————————————————————————————————————————————————

/**
 * A utility object `rand` that provides various random generation methods.
 *
 * @property {function} bool - Generates a random boolean value.
 * @property {function} recentDate - Generates a random date within the past 365 days.
 * @property {function} futureDate - Generates a random date within the next year.
 * @property {function} price - Generates a random price as a `Prisma.Decimal` with a value between 1 and 1000, formatted with 2 decimal places.
 * @property {function} pick - Selects a random element from the provided array.
 * @template T
 */
const rand = {
	bool: () => faker.datatype.boolean(),
	recentDate: () => faker.date.recent({ days: 365 }),
	futureDate: () => faker.date.future({ years: 1 }),
	price: () =>
		new Prisma.Decimal(
			faker.number.float({ min: 1, max: 1_000, fractionDigits: 2 }).toFixed(2)
		),
	pick: <T,>(arr: readonly T[]): T => faker.helpers.arrayElement(arr as T[]),
};

// ——————————————————— Seeder functions ——————————————————
/**
 * Seeds the database with a batch of users. Generates random user data using faker
 * and inserts them into the database in batches to optimize performance. The method
 * logs progress periodically and measures the total time taken for the seeding process.
 *
 * @return {Promise<void>} A promise that resolves when the seeding process completes.
 */
async function seedUsers() {
	console.time('users');
	for (let i = 0; i < TOTAL; i += BATCH) {
		const data: Prisma.UserCreateManyInput[] = Array.from(
			{ length: BATCH },
			() => ({
				email: faker.internet.email().toLowerCase(),
				password: faker.internet.password({ length: 16 }),
				username:
					faker.person.firstName().toString() +
					' ' +
					faker.person.lastName().toString(),
				isAdmin: false,
				emailVerified: rand.bool() ? rand.recentDate() : null,
				createdAt: rand.recentDate(),
			})
		);

		await prisma.user.createMany({ data, skipDuplicates: true });
		if ((i + BATCH) % 100_000 === 0) console.info(`✔︎ ${i + BATCH} users`);
	}
	console.timeEnd('users');
}

/**
 * Seeds the database with account data in batches. The accounts are generated
 * with various properties using randomly generated data for demonstration or testing
 * purposes. It supports seeding a large number of accounts efficiently by batching
 * the database insert operations.
 *
 * @return {Promise<void>} Resolves when the seeding operation is completed.
 */
async function seedAccounts() {
	console.time('accounts');
	const PROVIDERS = ['google', 'github', 'twitter'];

	for (let i = 0; i < TOTAL; i += BATCH) {
		const startId = i + 1; // relies on fresh auto‑increment ids
		const data: Prisma.AccountCreateManyInput[] = Array.from(
			{ length: BATCH },
			(_, idx) => ({
				userId: startId + idx,
				type: 'oauth',
				provider: rand.pick(PROVIDERS),
				providerAccountId: faker.string.uuid(),
				access_token: faker.string.alphanumeric(30),
				token_type: 'Bearer',
				expires_at: Math.floor(Date.now() / 1000) + 86_400,
				scope: 'read:user',
				id_token: faker.string.alphanumeric(40),
				session_state: faker.string.uuid(),
			})
		);
		await prisma.account.createMany({ data });
		if ((i + BATCH) % 100_000 === 0) console.info(`✔︎ ${i + BATCH} accounts`);
	}
	console.timeEnd('accounts');
}

/**
 * Seeds the database with session data in batches.
 * This function generates fake session data and inserts it into the database.
 * It processes the sessions in defined batch sizes to optimize database writes.
 *
 * @return {Promise<void>} A promise that resolves when all seed data is inserted.
 */
async function seedSessions() {
	console.time('sessions');
	for (let i = 0; i < TOTAL; i += BATCH) {
		const data: Prisma.SessionCreateManyInput[] = Array.from(
			{ length: BATCH },
			() => ({
				userId: faker.number.int({ min: 1, max: TOTAL }),
				sessionToken: faker.string.uuid(),
				expires: rand.futureDate(),
			})
		);
		await prisma.session.createMany({ data });
		if ((i + BATCH) % 100_000 === 0) console.info(`✔︎ ${i + BATCH} sessions`);
	}
	console.timeEnd('sessions');
}

/**
 * Seeds the database with verification tokens in batches.
 * Generates random verification token data and inserts it into the database.
 * Logs progress at every 100,000 tokens and measures the total execution time.
 *
 * @return {Promise<void>} A promise that resolves when the seeding process is complete.
 */
async function seedVerificationTokens() {
	console.time('verificationTokens');
	for (let i = 0; i < TOTAL; i += BATCH) {
		const data: Prisma.VerificationTokenCreateManyInput[] = Array.from(
			{ length: BATCH },
			() => ({
				identifier: faker.internet.email().toLowerCase(),
				token: faker.string.uuid(),
				expires: rand.futureDate(),
			})
		);
		await prisma.verificationToken.createMany({ data });
		if ((i + BATCH) % 100_000 === 0)
			console.info(`✔︎ ${i + BATCH} verification tokens`);
	}
	console.timeEnd('verificationTokens');
}

/**
 * Seeds the database with category data in batches.
 * Creates multiple category entries in the database with randomized titles
 * and no parent hierarchy (flat structure) using a batch approach for efficiency.
 *
 * @return {Promise<void>} A promise that resolves when all categories have been seeded.
 */
async function seedCategories() {
	console.time('categories');
	for (let i = 0; i < TOTAL; i += BATCH) {
		const data: Prisma.CategoryCreateManyInput[] = Array.from(
			{ length: BATCH },
			() => ({
				title: faker.commerce.department(),
				parentId: null, // flat tree for now
			})
		);
		await prisma.category.createMany({ data });
		if ((i + BATCH) % 100_000 === 0)
			console.info(`✔︎ ${i + BATCH} categories`);
	}
	console.timeEnd('categories');
}

/**
 * Seeds the database with a batch of product records. Each product is generated with
 * random attributes such as name, description, price, stock, status, image, and timestamps.
 * The seeding process is performed in batches, logging progress after every 100,000 products.
 *
 * @return {Promise<void>} A promise that resolves when the seeding process is completed.
 */
async function seedProducts() {
	console.time('products');
	const STATUSES = Object.values(ProductStatus) as ProductStatus[];

	for (let i = 0; i < TOTAL; i += BATCH) {
		const data: Prisma.ProductCreateManyInput[] = Array.from(
			{ length: BATCH },
			() => ({
				name: faker.commerce.productName(),
				description: faker.commerce.productDescription(),
				price: rand.price(),
				stock: faker.number.int({ min: 0, max: 500 }),
				status: rand.pick(STATUSES),
				image: faker.image.urlPicsumPhotos(),
				categoryId: null, // Set to null since categories might not be seeded
				userId: null, // Set to null since userId is optional in the schema
				createdAt: rand.recentDate(),
			})
		);
		await prisma.product.createMany({ data });
		if ((i + BATCH) % 100_000 === 0) console.info(`✔︎ ${i + BATCH} products`);
	}
	console.timeEnd('products');
}

// ——————————————————— Main runner ——————————————————
/**
 * Main function to seed the database with users, categories, and products.
 * Measures and logs the runtime for the seed process.
 *
 * @return {Promise<void>} A promise that resolves when the seeding process is complete.
 */
async function main() {
	console.time('seed‑runtime');
	await seedUsers();
	await seedCategories();
	await seedProducts();
	console.timeEnd('seed‑runtime');
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
