// components/users-table.tsx
'use client';

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Check, X } from 'lucide-react';
import { useState } from 'react';

export type User = {
	id: string;
	username: string;
	email: string;
	isAdmin: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="flex items-center justify-center px-2"
			>
				Id
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-start px-2">{row.id}</div>
		),
	},
	{
		accessorKey: 'username',
		header: 'Username',
		cell: ({ row }) => (
			<div className="flex items-center justify-start">
				{row.getValue('username')} {row.id}
			</div>
		),
	},
	{
		accessorKey: 'email',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Email
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: 'isAdmin',
		header: 'Admin',
		cell: ({ row }) => (
			<div className="flex items-center justify-center w-10">
				{row.getValue('isAdmin') ? (
					<Check className="h-4 w-4 text-green-500" />
				) : (
					<X className="h-4 w-4 text-red-500" />
				)}
			</div>
		),
	},
	{
		accessorKey: 'createdAt',
		header: 'Created At',
		cell: ({ row }) => (
			<div className="text-muted-foreground">
				{new Intl.DateTimeFormat('en-US', {
					dateStyle: 'medium',
					timeStyle: 'short',
				}).format(new Date(row.getValue('createdAt')))}
			</div>
		),
	},
	{
		accessorKey: 'updatedAt',
		header: 'Last Updated',
		cell: ({ row }) => (
			<div className="text-muted-foreground">
				{new Intl.DateTimeFormat('en-US', {
					dateStyle: 'medium',
					timeStyle: 'short',
				}).format(new Date(row.getValue('updatedAt')))}
			</div>
		),
	},
];

export function UsersTable({ data }: { data: User[] }) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No users found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
