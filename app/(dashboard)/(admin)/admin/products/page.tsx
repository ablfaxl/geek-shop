'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Product } from '@/types/product.interface';

export default function AdminProductsPage() {
	const router = useRouter();
	const [products, setProducts] = useState<Product[] | null>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [productToDelete, setProductToDelete] = useState<Product | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	useEffect(() => {
		const fetchProducts = async () => {
			const response = await fetch('/api/products');
			const data = await response.json();
			setProducts(data);
		};
		fetchProducts();
	}, []);
	// Filter products based on search term
	const filteredProducts = products?.filter(
		(product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Stats calculations
	const totalProducts = products?.length;
	const activeProducts = products?.filter((p) => p.status === 'ACTIVE').length;
	const outOfStockProducts = products?.filter(
		(p) => p.status === 'OUT_OF_STOCK' || p.stock === 0
	).length;
	const lowInventoryProducts = products?.filter(
		(p) => p.status === 'LOW_STOCK' || (p.stock > 0 && p.stock <= 10)
	).length;

	const handleEdit = (productId: number) => {
		router.push(`/admin/products/edit/${productId}`);
	};

	const handleDeleteClick = (product: Product) => {
		setProductToDelete(product);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!productToDelete) return;

		setIsDeleting(true);

		try {
			// Call the DELETE API endpoint
			const response = await fetch(`/api/products/${productToDelete.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete product');
			}

			// Update local state
			if (!products) return;
			setProducts(products.filter((p) => p.id !== productToDelete.id));

			toast.success(
				`${productToDelete.name} has been deleted successfully.`
			);
		} catch (error) {
			console.error(error);
			toast.error('Failed to delete product. Please try again.');
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setProductToDelete(null);
		}
	};

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Products</h1>
				<Button asChild>
					<Link href="/admin/products/add">
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Product
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Total Products
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProducts}</div>
						<p className="text-xs text-muted-foreground">+12 from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							Active Products
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeProducts}</div>
						<p className="text-xs text-muted-foreground">
							{Math.round(((activeProducts ?? 0) / (totalProducts ?? 1)) * 100)}
							% of total products
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{outOfStockProducts}</div>
						<p className="text-xs text-muted-foreground">
							{Math.round(
								((outOfStockProducts ?? 0) / (totalProducts ?? 1)) * 100
							)}
							% of total products
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Low Inventory</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{lowInventoryProducts}</div>
						<p className="text-xs text-muted-foreground">
							{Math.round(
								((lowInventoryProducts ?? 0) / (totalProducts ?? 1)) * 100
							)}
							% of total products
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Product Management</CardTitle>
					<CardDescription>
						Manage your product inventory, update details, and track stock
						levels.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between mb-4">
						<div className="relative w-full max-w-sm">
							<Input
								placeholder="Search products..."
								className="pl-8"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</div>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[80px]">Image</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Stock</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProducts && filteredProducts?.length > 0 ? (
									filteredProducts?.map((product) => (
										<TableRow key={product.id}>
											<TableCell>
												<Image
													unoptimized
													src={product.image || '/placeholder.svg'}
													alt={product.name}
													width={40}
													height={40}
													className="rounded-sm w-10 h-10 object-cover"
												/>
											</TableCell>
											<TableCell className="font-medium">
												{product.name}
											</TableCell>
											<TableCell>{product.category}</TableCell>
											<TableCell>${product.price.toFixed(2)}</TableCell>
											<TableCell>{product.stock}</TableCell>
											<TableCell>
												<Badge
													variant={
														product.status === 'ACTIVE'
															? 'default'
															: product.status === 'DRAFT'
																? 'secondary'
																: 'destructive'
													}
												>
													{product.status}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Open menu</span>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
																/>
															</svg>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() => handleEdit(+product.id)}
														>
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleDeleteClick(product)}
														>
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={7} className="h-24 text-center">
											No products found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &quot;{productToDelete?.name}
							&quot;? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
