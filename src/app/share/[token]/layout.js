export const metadata = {
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: { index: false, follow: false, noimageindex: true },
	},
	referrer: "no-referrer",
};

export default function ShareLayout({ children }) {
	return children;
}
