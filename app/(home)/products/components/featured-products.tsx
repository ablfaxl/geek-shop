'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/app/(home)/cart/context/cart-provider';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Product } from '@/types/product.interface';


export function FeaturedProducts() {
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
		<section className="space-y-6">
			<div className="flex flex-col items-center text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
				<p className="text-muted-foreground max-w-[600px]">
					Our most popular items, handpicked for you
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
}

function ProductCard({
											 product,
										 }: {
	product: Product;
}) {
	const { addToCart } = useCart();

	return (
		<Card className="overflow-hidden group">
			<Link href={`/products/${product.id}`}>
				<div className="relative aspect-square overflow-hidden">
					<Image
						src={product.image || '/placeholder.svg'}
						alt={product.name}
						fill
						unoptimized
						className="object-cover transition-transform group-hover:scale-105"
					/>
				</div>
			</Link>
			<CardContent className="p-4">
				<Link href={`/products/${product.id}`} className="hover:underline">
					<h3 className="font-medium">{product.name}</h3>
				</Link>
				<p className="font-bold mt-1">${product.price.toFixed(2)}</p>
			</CardContent>
			<CardFooter className="p-4 pt-0">
				<Button
					className="w-full"
					size="sm"
					onClick={() => {
						addToCart(product);
						toast.success('Product added to cart');
					}}
				>
					<ShoppingCart className="h-4 w-4 mr-2" />
					Add to Cart
				</Button>
			</CardFooter>
		</Card>
	);
}
