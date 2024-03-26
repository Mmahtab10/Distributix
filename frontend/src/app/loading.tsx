/* eslint-disable @next/next/no-img-element */
'use client';
import { usePathname } from 'next/navigation';
import { CgSpinner } from 'react-icons/cg';

export default function Loading() {
	const pathname = usePathname();
	return (
		<main className="h-full w-full flex flex-col items-center justify-start relative p-16 md:p-24 lg:p-32 gap-16 z-[999]">
			<div className="z-10 mb-auto">
				<img
					src={pathname.startsWith('/app') ? '../logo.svg' : './logo.svg'}
					alt="socialsync logo"
				/>
			</div>
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999]">
				<CgSpinner className={`animate-spin text-blue w-32 h-32 z-[999]`} />
			</div>
		</main>
	);
}
