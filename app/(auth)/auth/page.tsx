import AuthForm from './components/auth-form';

export default function Auth() {
	return (
		<main className="min-h-screen flex flex-col md:flex-row bg-white lg:px-10">
			<div className="w-full flex items-center justify-center p-6 md:p-12 bg-white">
				<div className="w-full max-w-sm">
					<AuthForm />
				</div>
			</div>
		</main>
	);
}
