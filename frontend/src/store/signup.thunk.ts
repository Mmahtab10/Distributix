import { Dispatch } from '@reduxjs/toolkit';
import { setError, setLoading, setToken } from './session.slice';

const signupThunk = (email: string, password: string) => {
	return (dispatch: Dispatch, getState: any) => {
		dispatch(setLoading({}));
		fetch('', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ email, password }),
		})
			.then(async (response) => {
				if (response.ok) {
					const data = await response.json();
					dispatch(setToken({ userId: data.userId, jwt: data.jwt }));
				} else {
					dispatch(setError((await response.json())?.message));
				}
			})
			.catch((error) => {
				dispatch(setError(error.message));
			});
	};
};

export default signupThunk;
