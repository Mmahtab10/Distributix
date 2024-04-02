import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';

const ibmPlexSans = IBM_Plex_Sans({
	weight: ['100', '200', '300', '400', '500', '600', '700'],
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'DistribuTix',
	description: '',
};
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${ibmPlexSans.className} relative w-screen h-screen overflow-hidden bg-white`}
			>
				<ReduxProvider>{children}</ReduxProvider>
			</body>
		</html>
	);
}
