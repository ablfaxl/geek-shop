'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, UsersTable } from './components/users-table';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;
export default function Dashboard() {
	const { data: session } = useSession();
	const [users, setUsers] = useState<User[]>([]);
	const [currentPage, setCurrentPage] = useState(1); // Current page state
	const [totalPages, setTotalPages] = useState(1); // Total pages state
	const [totalUsers, setTotalUsers] = useState(0); // Total users state
	const [searchTerm, setSearchTerm] = useState(''); // Search term state
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term state

	// Debounce the search term input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500); // Delay of 500ms

		return () => clearTimeout(timer); // Clean up on every change
	}, [searchTerm]);

	// Fetch users whenever session changes, page changes, or debouncedSearchTerm changes
	useEffect(() => {
		if (session?.user?.isAdmin) {
			fetch(
				`/api/users?page=${currentPage}&pageSize=${PAGE_SIZE}&search=${debouncedSearchTerm}`
			)
				.then((res) => res.json())
				.then((data) => {
					setUsers(data.users);
					setTotalPages(data.totalPages);
					setTotalUsers(data.totalUsers);
				})
				.catch((error) => console.error('Error fetching users:', error));
		}
	}, [session?.user?.isAdmin, currentPage, debouncedSearchTerm]);

	// Handle page change
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Handle search term change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1); // Reset to first page when search changes
	};

	if (!session?.user?.isAdmin) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-xl font-semibold">Access Denied</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session.user.name}
					</p>
				</div>
				<Button
					onClick={() => signOut({ callbackUrl: '/auth' })}
					variant="outline"
				>
					Sign Out
				</Button>
			</div>

			{/* Search Bar */}
			<div className="mb-4">
				<input
					type="text"
					placeholder="Search users..."
					value={searchTerm}
					onChange={handleSearchChange}
					className="p-2 border rounded-md w-full"
				/>
			</div>

			<div className="rounded-lg border p-6 shadow-sm">
				<h2 className="text-xl font-semibold mb-4">User Management | Total {totalUsers.toLocaleString()}</h2>
				<UsersTable data={users} />

				{/* Pagination Controls */}
				<Pagination className="mt-4">
					<PaginationContent>
						{/* Previous Button */}
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(currentPage - 1);
								}}
							/>
						</PaginationItem>

						{/* Dynamic page numbers */}
						{[...Array(totalPages)]
							.slice(Math.max(0, currentPage - 3), currentPage + 2)
							.map((_, index) => (
								<PaginationItem key={index}>
									<PaginationLink
										href="#"
										onClick={(e) => {
											e.preventDefault();
											handlePageChange(index + Math.max(0, currentPage - 3)); // Adjust the index based on the current page
										}}
										isActive={
											currentPage === index + Math.max(0, currentPage - 3)
										} // Mark the active page
									>
										{index + Math.max(0, currentPage - 3)}{' '}
										{/* Page number */}
									</PaginationLink>
								</PaginationItem>
							))}

						{/* Ellipsis (if needed) */}
						{totalPages > 5 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}

						{/* Next Button */}
						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(currentPage + 1);
								}}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
