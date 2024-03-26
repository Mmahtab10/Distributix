'use client';

import setupStore from '@/store/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { store, persistor } = setupStore();
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				{children}
			</PersistGate>
		</Provider>
	);
};

export default ReduxProvider;
