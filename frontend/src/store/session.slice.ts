import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';

export interface SessionState {
	loggedIn?: boolean;
	error?: any;
	loading?: boolean;
}

const initialState: SessionState = {
	loggedIn: false,
	error: undefined,
	loading: false,
};

const sessionSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setLoggedIn: (state, action) => {
			if (!action.payload) {
				return initialState;
			}
			const loggedIn = action.payload.loggedIn;
			return {
				...state,
				loggedIn,
				loading: false,
			};
		},
		setError: (state, action) => {
			const error = action.payload as string;
			return { ...state, error, loading: false };
		},
		setLoading: (state, action) => {
			return { ...state, loading: true };
		},
	},
});

export const { setLoggedIn, setError, setLoading } = sessionSlice.actions;

export default sessionSlice.reducer;
