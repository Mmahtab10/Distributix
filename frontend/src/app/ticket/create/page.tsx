'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import Logo from '@/components/Logo';
import Notifications from '@/components/Notifications';
import getURLThunk from '@/store/getUrl.thunk';
import { SessionState, addNotification, setError } from '@/store/session.slice';
import { Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

const CreateTicketPage = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const {
		url,
		loading: URLLoading,
		loggedIn,
	} = useSelector(({ session }: { session: SessionState }) => session);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!loggedIn) {
			router.push('/login');
		}
	}, [loggedIn, router]);

	const initialValues = {
		name: '',
		description: '',
		price: '',
		date: '',
		locationName: '',
		coordinates: '',
		quantity: '',
	};

	const validationSchema = Yup.object().shape({
		name: Yup.string().required('Required'),
		description: Yup.string().required('Required'),
		price: Yup.number().required('Required').positive('Price must be positive'),
		date: Yup.string().required('Required'),
		locationName: Yup.string().required('Required'),
		coordinates: Yup.string().required('Required'),
		quantity: Yup.number()
			.required('Required')
			.positive('Quantity must be positive')
			.integer(),
	});

	const handleFormSubmit = (values: any, actions: any): void => {
		setLoading(true);

		fetch(url + '/create_ticket', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				eventName: values.name,
				description: values.description,
				price: values.price,
				date: values.date,
				location: values.locationName,
				coordinates: values.coordinates,
				quantity: values.quantity,
			}),
			referrerPolicy: 'unsafe-url',
		})
			.then(async (response) => {
				const data = await response.json();
				if (response.status === 200) {
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
				setLoading(false);
			});
	};

	return (
		<div className="absolute flex flex-col justify-start items-center gap-16 p-6 md:p-10 lg:p-14 pb-0 w-full h-full">
			<Notifications />
			<div className="flex justify-between items-center gap-16 bg-white rounded w-full self-start">
				<Link href="/" className="cursor-pointer">
					<Logo size="lg" type="light" hideBorder={true} />
				</Link>
			</div>
			<div className="flex flex-col justify-start items-center gap-6 bg-white md:p-8 rounded">
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleFormSubmit}
				>
					{(formik) => (
						<div className="flex flex-col justify-between items-center gap-8 w-full">
							<div className="z-10 justify-center items-center gap-x-8 gap-y-4 grid grid-cols-1 md:grid-cols-2 grid-flow-row w-full">
								<InputField
									name="name"
									label="Event Name"
									type="text"
									onChange={(e) => {
										if (!formik.touched.name) {
											formik.setTouched({ ...formik.touched, name: true });
										}
										formik.handleChange(e);
									}}
									value={formik.values.name}
									placeholder="name"
									error={
										!!formik.errors.name && formik.touched.name
											? formik.errors.name
											: ''
									}
								/>
								<InputField
									name="description"
									label="Description"
									type="text"
									onChange={(e) => {
										if (!formik.touched.description) {
											formik.setTouched({
												...formik.touched,
												description: true,
											});
										}
										formik.handleChange(e);
									}}
									value={formik.values.description}
									placeholder="description"
									error={
										!!formik.errors.description && formik.touched.description
											? formik.errors.description
											: ''
									}
								/>
								<InputField
									name="price"
									label="Price"
									type="number"
									onChange={(e) => {
										if (!formik.touched.price) {
											formik.setTouched({ ...formik.touched, price: true });
										}
										formik.handleChange(e);
									}}
									value={formik.values.price}
									placeholder="price"
									error={
										!!formik.errors.price && formik.touched.price
											? formik.errors.price
											: ''
									}
								/>
								<InputField
									name="date"
									label="Date"
									type="datetime-local"
									onChange={(e) => {
										if (!formik.touched.date) {
											formik.setTouched({ ...formik.touched, date: true });
										}
										formik.handleChange(e);
									}}
									value={formik.values.date}
									placeholder="date"
									error={
										!!formik.errors.date && formik.touched.date
											? formik.errors.date
											: ''
									}
								/>
								<InputField
									name="locationName"
									label="Location Name"
									type="text"
									onChange={(e) => {
										if (!formik.touched.locationName) {
											formik.setTouched({
												...formik.touched,
												locationName: true,
											});
										}
										formik.handleChange(e);
									}}
									value={formik.values.locationName}
									placeholder="locationName"
									error={
										!!formik.errors.locationName && formik.touched.locationName
											? formik.errors.locationName
											: ''
									}
								/>
								<InputField
									name="coordinates"
									label="Coordinates"
									type="text"
									onChange={(e) => {
										if (!formik.touched.coordinates) {
											formik.setTouched({
												...formik.touched,
												coordinates: true,
											});
										}
										formik.handleChange(e);
									}}
									value={formik.values.coordinates}
									placeholder="coordinates"
									error={
										!!formik.errors.coordinates && formik.touched.coordinates
											? formik.errors.coordinates
											: ''
									}
								/>
								<InputField
									name="quantity"
									label="Quantity"
									type="number"
									onChange={(e) => {
										if (!formik.touched.quantity) {
											formik.setTouched({ ...formik.touched, quantity: true });
										}
										formik.handleChange(e);
									}}
									value={formik.values.quantity}
									placeholder="quantity"
									error={
										!!formik.errors.quantity && formik.touched.quantity
											? formik.errors.quantity
											: ''
									}
								/>

								<div className="flex justify-between items-end gap-4 self-end">
									<Button
										type="submit"
										label="Create Ticket"
										onClick={() => formik.submitForm()}
										loading={loading || formik.isSubmitting}
										disabled={loading || formik.isSubmitting || !formik.isValid}
									/>
									<Button
										style="danger"
										label="Cancel"
										disabled={loading || formik.isSubmitting || !formik.isValid}
										onClick={() => router.push('/')}
									/>
								</div>
							</div>
						</div>
					)}
				</Formik>
			</div>
		</div>
	);
};

export default CreateTicketPage;
