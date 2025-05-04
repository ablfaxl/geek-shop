import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		unoptimized: true,
		domains: [
			'placehold.co',
			'*unsplash.com',
			'plus.unsplash.com',
			'images.unsplash.com',
		],
	},
};

export default nextConfig;
