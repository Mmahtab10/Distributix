'use client';
import useIsAuth from '@/hooks/useIsAuth';
import { Link } from '@chakra-ui/next-js';

export default function Page() {
	useIsAuth();
	return <div></div>;
}
