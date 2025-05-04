'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const productSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	category: z.string().min(1, 'Category is required'),
	price: z.coerce.number().positive('Price must be positive'),
	stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
	status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'LOW_STOCK']),
	description: z.string().optional(),
	image: z.string().url('Invalid URL').optional(),
});

export default function AddProductPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof productSchema>>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: '',
			category: '',
			price: 0,
			stock: 0,
			status: 'DRAFT',
			description: '',
			image: '',
		},
	});

	async function onSubmit(values: z.infer<typeof productSchema>) {
		setIsLoading(true);
		try {
			const response = await fetch('/api/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create product');
			}

			toast.success('Product created successfully');
			router.push('/admin/products');
		} catch (error) {
			console.error(error);
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/products">
						<ArrowLeft className="h-4 w-4" />
						<span className="sr-only">Back</span>
					</Link>
				</Button>
				<h1 className="text-3xl font-bold">Add New Product</h1>
			</div>

			<Card>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardHeader>
							<CardTitle>Product Information</CardTitle>
							<CardDescription>
								Enter the details of the new product you want to add to your
								inventory.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{/* Name Field */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<Label htmlFor="name">Product Name</Label>
											<FormControl>
												<Input
													id="name"
													placeholder="Enter product name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Category Field */}
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<Label htmlFor="category">Category</Label>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="Electronics">
														Electronics
													</SelectItem>
													<SelectItem value="Clothing">Clothing</SelectItem>
													<SelectItem value="Accessories">
														Accessories
													</SelectItem>
													<SelectItem value="Home & Kitchen">
														Home & Kitchen
													</SelectItem>
													<SelectItem value="Food & Beverage">
														Food & Beverage
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Price Field */}
								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<Label htmlFor="price">Price ($)</Label>
											<FormControl>
												<Input
													id="price"
													type="number"
													step="0.01"
													min="0"
													placeholder="0.00"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Stock Field */}
								<FormField
									control={form.control}
									name="stock"
									render={({ field }) => (
										<FormItem>
											<Label htmlFor="stock">Stock Quantity</Label>
											<FormControl>
												<Input
													id="stock"
													type="number"
													min="0"
													placeholder="0"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Status Field */}
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<Label htmlFor="status">Status</Label>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="DRAFT">Draft</SelectItem>
													<SelectItem value="ACTIVE">Active</SelectItem>
													<SelectItem value="OUT_OF_STOCK">
														Out of Stock
													</SelectItem>
													<SelectItem value="LOW_STOCK">Low Stock</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Image Field */}
								<FormField
									control={form.control}
									name="image"
									render={({ field }) => (
										<FormItem>
											<Label htmlFor="image">Image URL</Label>
											<FormControl>
												<Input
													id="image"
													placeholder="Enter image URL"
													{...field}
													value={field.value || ''}
												/>
											</FormControl>
											<FormMessage />
											<p className="text-xs text-muted-foreground">
												In a real app, you would have an image upload component
												here.
											</p>
										</FormItem>
									)}
								/>
							</div>

							{/* Description Field */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<Label htmlFor="description">Description</Label>
										<FormControl>
											<Textarea
												id="description"
												placeholder="Enter product description"
												rows={5}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter className="flex justify-between my-4">
							<Button variant="outline" type="button" asChild>
								<Link href="/admin/products">Cancel</Link>
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? 'Creating...' : 'Create Product'}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
