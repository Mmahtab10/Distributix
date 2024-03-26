/* eslint-disable @next/next/no-img-element */
'use client';
import { usePathname } from 'next/navigation';
import { CgSpinner } from 'react-icons/cg';

export default function Loading() {
	const pathname = usePathname();
	return (
		<main className="relative z-[999] flex flex-col justify-center items-center w-full h-full">
			<img
				src="./confetti-doodles.svg"
				alt="doodles"
				className="top=0 left-0 absolute w-full h-full object-cover"
			/>

			<div className="top-1/2 left-1/2 z-[999] absolute -translate-x-1/2 -translate-y-1/2">
				<CgSpinner className={`animate-spin text-blue w-32 h-32 z-[999]`} />
			</div>
		</main>
	);
}
