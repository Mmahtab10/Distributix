'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import isValidToken from '@/helpers/isValidToken';
import { SessionState } from '@/store/session.slice';
import signupThunk from '@/store/signup.thunk';
import { Formik } from 'formik';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

export default function Page() {
	const dispatch = useDispatch();
	const { loading, error, parsedToken } = useSelector(
		({ session }: { session: SessionState }) => session
	);
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		if (isValidToken(parsedToken)) {
			router.push('/app');
		}
	}, [parsedToken, router, searchParams]);

	return (
		<div className="flex justify-center items-center w-full h-full">
			<div className="flex flex-col justify-start items-center gap-8 bg-slate-900 p-8 rounded-lg min-w-96 min-h-96">
				<div className="flex flex-col justify-start items-start gap-2">
					<h1 className="font-bold text-4xl text-white">DistribuTix</h1>
				</div>
				<Formik
					initialValues={{
						email: '',
						password: '',
					}}
					validationSchema={Yup.object().shape({
						email: Yup.string().email('invalid email').required('required'),
						password: Yup.string()
							.min(6, 'password is too short')
							.required('required'),
					})}
					onSubmit={(values) => {
						dispatch(signupThunk(values.email, values.password) as any);
					}}
				>
					{(formik) => (
						<div className="flex flex-col justify-between items-center gap-10">
							<div className="z-10 flex flex-col justify-between items-center gap-4">
								{error && <p className="font-bold text-red">{error}</p>}
								<InputField
									name="email"
									label="Email"
									type="email"
									onChange={(e) => {
										if (!formik.touched.email) {
											formik.setTouched({ ...formik.touched, email: true });
										}
										formik.handleChange(e);
									}}
									value={formik.values.email}
									placeholder="email@example.com"
									error={
										!!formik.errors.email && formik.touched.email
											? formik.errors.email
											: ''
									}
								/>
								<InputField
									name="password"
									label="Password"
									type="password"
									onChange={(e) => {
										if (!formik.touched.password) {
											formik.setTouched({ ...formik.touched, password: true });
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
									disabled={!!formik.errors.email || !!formik.errors.password}
								/>
								<Link
									href="/login"
									className="text-neutral-400 text-sm hover:text-white underline underline-offset-4 cursor-pointer"
								>
									login?
								</Link>
							</div>
						</div>
					)}
				</Formik>
			</div>
		</div>
	);
}
