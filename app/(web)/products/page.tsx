'use client';
import { useEffect, useState, useCallback } from 'react';
import { ProductGrid } from './components/product-card';
import { Product } from '@/types/product.interface';

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchProducts = useCallback(async (page: number) => {
		try {
			const response = await fetch(`/api/products?all=true&page=${page}&pageSize=10`);
			const data = await response.json();

			if (data.products) {
				setProducts((prevProducts) => [...prevProducts, ...data.products]);
				setHasMore(data.pagination.page < data.pagination.pageCount);
			}
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	}, []);

	useEffect(() => {
		fetchProducts(page);
	}, [page, fetchProducts]);

	// Infinite Scroll detection
	const handleScroll = () => {
		const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
		if (bottom && hasMore) {
			setPage((prevPage) => prevPage + 1);  // Load next page
		}
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [hasMore]);


	return (
		<div className="container px-4 py-12 mx-auto">
			<div className="flex flex-col items-center text-center space-y-2 mb-12">
				<h1 className="text-3xl font-bold tracking-tight">All Products</h1>
				<p className="text-muted-foreground max-w-[600px]">
					Browse our complete collection of premium clothing
				</p>
			</div>
			<ProductGrid products={products ?? []} />
			{/* Optional: Add a loading spinner while fetching new products */}
			{hasMore && <div className="text-center py-4">Loading...</div>}
		</div>
	);
}
