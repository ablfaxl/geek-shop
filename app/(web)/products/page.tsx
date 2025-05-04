'use client';
import { ProductGrid } from './components/product-card';
import { useEffect, useState } from 'react';
import { Product } from '@/types/product.interface';


export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		const fetchProducts = async () => {
			const response = await fetch('/api/products?all=true');
			const data = await response.json();
			setProducts(data);
		};
		fetchProducts();
	}, []);
	return (
		<div className="container px-4 py-12 mx-auto">
			<div className="flex flex-col items-center text-center space-y-2 mb-12">
				<h1 className="text-3xl font-bold tracking-tight">All Products</h1>
				<p className="text-muted-foreground max-w-[600px]">
					Browse our complete collection of premium clothing
				</p>
			</div>
			<ProductGrid products={products} />
		</div>
	);
}
