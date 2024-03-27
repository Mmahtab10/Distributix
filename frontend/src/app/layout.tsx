import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';
import { Providers } from './providers';

const montserrat = Montserrat({ subsets: ['latin'] });

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
				className={`${montserrat.className} relative w-screen h-screen overflow-hidden  bg-black`}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="./confetti-doodles.svg"
					alt="doodles"
					className="top=0 left-0 -z-10 absolute w-full h-full object-cover"
				/>
				<ReduxProvider>
					<Providers>{children}</Providers>
				</ReduxProvider>
			</body>
		</html>
	);
}
