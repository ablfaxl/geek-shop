import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col min-h-screen">
			<div
				className={'flex h-10 items-center justify-center bg-slate-950 px-4 text-sm font-medium text-white sm:px-6 lg:px-8'}>
				<p className={'text-center'}>
					Free shipping on orders over $50
				</p>
			</div>
			<Header />
			{children}
			<Footer />
		</div>
	);
}