'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function EditProductPage() {
	const router = useRouter();
	const params = useParams();
	const id = params.id as string;

	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		category: '',
		price: '',
		stock: '',
		status: 'DRAFT',
		description: '',
		image: '',
	});

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const response = await fetch(`/api/products/${id}`);
				if (!response.ok) throw new Error('Product not found');

				const product = await response.json();
				setFormData({
					name: product.name,
					category: product.category,
					price: product.price.toString(),
					stock: product.stock.toString(),
					status: product.status,
					description: product.description || '',
					image: product.image || '',
				});
			} catch (error) {
				console.error(error);
				toast.error('Failed to load product');
				router.push('/admin/products');
			}
		};

		fetchProduct();
	}, [id, router]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch(`/api/products/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					price: parseFloat(formData.price),
					stock: parseInt(formData.stock),
				}),
			});

			if (!response.ok) throw new Error('Update failed');

			toast.success('Product updated successfully');
			router.push('/admin/products');
		} catch (error) {
			console.error(error);
			toast.error('Failed to update product');
		} finally {
			setIsLoading(false);
		}
	};
	// Update status options to match ProductStatus enum
	const statusOptions = [
		{ value: 'DRAFT', label: 'Draft' },
		{ value: 'ACTIVE', label: 'Active' },
		{ value: 'OUT_OF_STOCK', label: 'Out of Stock' },
		{ value: 'LOW_STOCK', label: 'Low Stock' },
	];

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/products">
						<ArrowLeft className="h-4 w-4" />
						<span className="sr-only">Back</span>
					</Link>
				</Button>
				<h1 className="text-3xl font-bold">Edit Product</h1>
			</div>

			<Card>
				<form onSubmit={handleSubmit}>
					<CardHeader>
						<CardTitle className={'my-4'}>Product Information</CardTitle>
						<CardDescription className={'my-4'}>
							Update the details of your product.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Product Name</Label>
								<Input
									id="name"
									name="name"
									placeholder="Enter product name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										handleSelectChange('category', value)
									}
									required
								>
									<SelectTrigger id="category">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Electronics">Electronics</SelectItem>
										<SelectItem value="Clothing">Clothing</SelectItem>
										<SelectItem value="Accessories">Accessories</SelectItem>
										<SelectItem value="Home & Kitchen">
											Home & Kitchen
										</SelectItem>
										<SelectItem value="Food & Beverage">
											Food & Beverage
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="price">Price ($)</Label>
								<Input
									id="price"
									name="price"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={formData.price}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="stock">Stock Quantity</Label>
								<Input
									id="stock"
									name="stock"
									type="number"
									min="0"
									placeholder="0"
									value={formData.stock}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => handleSelectChange('status', value)}
								>
									<SelectTrigger id="status">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="image">Image URL</Label>
								<Input
									id="image"
									name="image"
									placeholder="Enter image URL"
									value={formData.image}
									onChange={handleChange}
								/>
								<p className="text-xs text-muted-foreground">
									In a real app, you would have an image upload component here.
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Enter product description"
								value={formData.description}
								onChange={handleChange}
								rows={5}
							/>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between my-5">
						<Button variant="outline" type="button" asChild>
							<Link href="/admin/products">Cancel</Link>
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
