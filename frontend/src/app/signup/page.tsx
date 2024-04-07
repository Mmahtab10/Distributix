'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import Logo from '@/components/Logo';
import Notifications from '@/components/Notifications';
import getURLThunk from '@/store/getUrl.thunk';
import {
	SessionState,
	addNotification,
	setLoggedIn,
} from '@/store/session.slice';
import { Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

export default function Page() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const {
		url,
		loading: URLLoading,
		loggedIn,
	} = useSelector(({ session }: { session: SessionState }) => session);
	const dispatch = useDispatch();
	const [error, setError] = useState('');

	useEffect(() => {
		if (loggedIn) {
			router.push('/');
		}
	}, [loggedIn, router]);

	return (
		<div className="absolute flex justify-center items-center w-full h-full">
			<Notifications />

			<div className="flex flex-col justify-start items-center gap-16 p-6 md:p-10 lg:p-14 pb-0 w-full h-full">
				<div className="flex justify-between items-center gap-16 bg-white rounded w-full self-start">
					<Link href="/" className="cursor-pointer">
						<Logo size="lg" type="light" hideBorder={true} />
					</Link>
				</div>
				<div className="flex flex-col justify-start items-center gap-6 bg-white md:p-8 rounded">
					<Formik
						initialValues={{
							username: '',
							password: '',
						}}
						validationSchema={Yup.object().shape({
							username: Yup.string().required('required'),
							password: Yup.string()
								.min(6, 'password is too short')
								.required('required'),
						})}
						onSubmit={(values) => {
							setLoading(true);
							fetch(url + '/register', {
								method: 'POST',
								headers: { 'Content-type': 'application/json' },
								body: JSON.stringify({
									username: values.username,
									password: values.password,
								}),
								referrerPolicy: 'unsafe-url',
							})
								.then(async (response) => {
									const data = await response.json();
									if (response.status === 200) {
										dispatch(setLoggedIn({ loggedIn: true }));
										setLoading(false);
										router.push('/');
									} else if (response.status === 403) {
										dispatch(getURLThunk() as any);
										dispatch(
											addNotification({
												label: 'Server error',
												message: 'please try again!',
											})
										);
										setLoading(false);
									} else {
										setError(data.message);
										setLoading(false);
									}
								})
								.catch((error) => {
									dispatch(getURLThunk() as any);
									dispatch(
										addNotification({
											label: 'Server error',
											message: 'please try again!',
										})
									);
									setError(error.message);
									setLoading(false);
								});
						}}
					>
						{(formik) => (
							<div className="flex flex-col justify-between items-center gap-8 w-full">
								<div className="z-10 flex flex-col justify-between items-center gap-4 w-full">
									{error && <p className="font-bold text-red">{error}</p>}
									<InputField
										name="username"
										label="Username"
										type="text"
										onChange={(e) => {
											if (!formik.touched.username) {
												formik.setTouched({
													...formik.touched,
													username: true,
												});
											}
											formik.handleChange(e);
										}}
										value={formik.values.username}
										placeholder="username"
										error={
											!!formik.errors.username && formik.touched.username
												? formik.errors.username
												: ''
										}
									/>
									<InputField
										name="password"
										label="Password"
										type="password"
										onChange={(e) => {
											if (!formik.touched.password) {
												formik.setTouched({
													...formik.touched,
													password: true,
												});
											}
											formik.handleChange(e);
										}}
										value={formik.values.password}
										placeholder="password"
										error={
											!!formik.errors.password && formik.touched.password
												? formik.errors.password
												: ''
										}
									/>
								</div>
								<div className="flex flex-col justify-between items-center gap-4">
									<Button
										label="Signup"
										onClick={() => formik.submitForm()}
										loading={loading}
										disabled={
											!!formik.errors.username || !!formik.errors.password
										}
									/>
									<Link
										href="/login"
										className="font-bold text-neutral-400 text-sm hover:text-blue underline underline-offset-4 cursor-pointer"
									>
										login?
									</Link>
								</div>
							</div>
						)}
					</Formik>
				</div>
			</div>
		</div>
	);
}
