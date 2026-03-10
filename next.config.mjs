/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	compress: true, // Active la compression gzip
	productionBrowserSourceMaps: true, // Source maps pour Lighthouse Best Practices

	// Optimisations des images
	images: {
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	// Headers de sécurité et SEO
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					{
						key: "Content-Security-Policy",
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension: https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.google-analytics.com https://vercel.live",
							"style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
							"img-src 'self' data: https:",
							"font-src 'self' data:",
							"connect-src 'self' https: https://challenges.cloudflare.com https://cloudflareinsights.com",
							"frame-src https://challenges.cloudflare.com",
							"frame-ancestors 'none'",
							"base-uri 'self'",
							"form-action 'self'",
						].join("; "),
					},
				],
			},
			// Sécurité renforcée pour les pages de partage (no-cache, no-referrer, noindex)
			{
				source: "/share/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, no-cache, must-revalidate",
					},
					{ key: "Pragma", value: "no-cache" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{
						key: "X-Robots-Tag",
						value: "noindex, nofollow, noarchive",
					},
				],
			},
			{
				source: "/api/share/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, no-cache, must-revalidate",
					},
					{ key: "Pragma", value: "no-cache" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{
						key: "X-Robots-Tag",
						value: "noindex, nofollow, noarchive",
					},
				],
			},
			// Cache pour les assets statiques
			{
				source: "/(.*).(jpg|jpeg|png|gif|ico|svg|webp|avif)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/(.*).(js|css|woff|woff2)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},

	// Redirections
	async redirects() {
		return [
			{
				source: "/home",
				destination: "/",
				permanent: true,
			},
		];
	},

	// Configuration PoweredBy
	poweredByHeader: false,

	// Optimisations de production
	reactStrictMode: true,

	// Configuration i18n si besoin plus tard
	// i18n: {
	//   locales: ['fr', 'en'],
	//   defaultLocale: 'fr',
	// },
};

export default nextConfig;
