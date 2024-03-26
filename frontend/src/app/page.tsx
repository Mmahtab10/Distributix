'use client';
import useIsAuth from '@/hooks/useIsAuth';

export default function Page() {
	useIsAuth();
	return <div></div>;
}
