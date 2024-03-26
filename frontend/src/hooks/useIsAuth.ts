import isValidToken from '@/helpers/isValidToken';
import { SessionState } from '@/store/session.slice';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const useIsAuth = (skipLogin?: boolean) => {
	const { parsedToken } = useSelector(
		({ session }: { session: SessionState }) => session
	);
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (!isValidToken(parsedToken) && !skipLogin) {
			router.push(
				'/login?navigatedFrom=' + pathname + '?' + searchParams.toString()
			);
		} else if (isValidToken(parsedToken) && !pathname.startsWith('/app')) {
			router.push(searchParams.get('navigatedFrom') ?? '/app');
		}
	}, [parsedToken, pathname, router, searchParams, skipLogin]);
};

export default useIsAuth;
