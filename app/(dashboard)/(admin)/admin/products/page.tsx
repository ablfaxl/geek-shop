'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

export default function AdminProductsPage() {
	const router = useRouter();
	const [products, setProducts] = useState<Product[] | null>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [productToDelete, setProductToDelete] = useState<Product | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 10,
		total: 0,
		pageCount: 0,
	});

	const fetchProducts = async (search = '', page = 1) => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/products?page=${page}&pageSize=${pagination.pageSize}&search=${search}`
			);
			const data = await response.json();
			setProducts(data.products);
			setPagination({
				page: data.pagination.page,
				total: data.pagination.total,
				pageCount: data.pagination.pageCount,
				pageSize: pagination.pageSize,
			});
		} catch (error) {
			console.error('Error fetching products:', error);
			toast.error('Failed to load products');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts(searchTerm, pagination.page);
	}, [pagination.page]);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchProducts(searchTerm, 1); // Reset to page 1 on new search
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= pagination.pageCount) {
			setPagination((prev) => ({ ...prev, page }));
		}
	};

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
			const response = await fetch(`/api/products/${productToDelete.id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete product');
			}
			fetchProducts(searchTerm, pagination.page);
			toast.success(`${productToDelete.name} has been deleted successfully.`);
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
			<h1 className="text-3xl font-bold">Products</h1>
			<div className="flex items-center justify-between mb-4">
				<Input
					placeholder="Search products..."
					className="pl-8"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<Button asChild>
					<Link href="/admin/products/add">
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Product
					</Link>
				</Button>
			</div>

			{/* Product Table */}
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
						{isLoading ? (
							<TableRow className={'flex items-center justify-center'}>
								<TableCell className={'text-center text-2xl'}>
									loading...
								</TableCell>
							</TableRow>
						) : products && products.length > 0 ? (
							products.map((product) => (
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
									<TableCell className="font-medium">{product.name}</TableCell>
									<TableCell>{product.category}</TableCell>
									<TableCell>${product.price}</TableCell>
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

			{/* Pagination Component */}
			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handlePageChange(pagination.page - 1);
							}}
						/>
					</PaginationItem>

					{/* Page numbers */}
					{Array.from({ length: pagination.pageCount }, (_, index) => (
						<PaginationItem key={index}>
							<PaginationLink
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(index + 1);
								}}
								isActive={pagination.page === index + 1}
							>
								{index + 1}
							</PaginationLink>
						</PaginationItem>
					))}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handlePageChange(pagination.page + 1);
							}}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>

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
