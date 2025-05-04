import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './dashboard/components/app-sidebar';
import { SiteHeader } from './dashboard/components/site-header';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
