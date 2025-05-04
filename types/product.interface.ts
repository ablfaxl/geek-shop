export interface Product {
	id: number;
	name: string;
	description?: string;
	category: string;
	price: number;
	stock: number;
	status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'LOW_STOCK';
	image?: string;
	createdAt: string;
	updatedAt: string;
}
