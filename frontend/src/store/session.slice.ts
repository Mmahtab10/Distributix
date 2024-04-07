import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';

export interface SessionState {
	loggedIn?: boolean;
	notifications?: Notification[];
	url?: string;
	count?: number;
	loading?: boolean;
}

export interface Notification {
	label: string;
	message: string;
	id?: number;
}

const initialState: SessionState = {
	loggedIn: false,
	notifications: [],
	loading: false,
	count: 0,
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
		setUrl: (state, action) => {
			const url = action.payload as string;
			return { ...state, url };
		},
		addNotification: (state, action) => {
			const notification = action.payload as Notification;
			return {
				...state,
				notifications: [
					...(state.notifications ?? []),
					{ ...notification, id: (state.count ?? 0) + 1 },
				],
				count: (state.count ?? 0) + 1,
			};
		},
		removeNotification: (state, action) => {
			const id = action.payload as number;
			state.notifications?.filter((n) => n.id !== id);
			return {
				...state,
				notifications: state.notifications?.filter((n) => n.id !== id),
			};
		},
		setError: (state, action) => {
			const error = action.payload as string;
			return { ...state, error, loading: false };
		},
		setLoading: (state, action) => {
			const loading = action.payload as boolean;
			return { ...state, loading };
		},
	},
});

export const {
	setLoggedIn,
	setError,
	setLoading,
	setUrl,
	addNotification,
	removeNotification,
} = sessionSlice.actions;

export default sessionSlice.reducer;
