'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import createTicketThunk from '@/store/create-ticket.thunk';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

const CreateTicketPage = () => {
	const dispatch = useDispatch();
	const router = useRouter();

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
		dispatch<any>(createTicketThunk(values))
			.then((ticketId: any) => {
				router.push(`/tickets/${ticketId}`);
			})
			.catch((error: any) => {
				actions.setSubmitting(false);
				console.error('Error creating ticket:', error);
			});
	};

	return (
		<div className="flex justify-center items-center w-full h-full">
			<div className="flex flex-col justify-start items-center gap-6 bg-white p-8 rounded-sm min-w-96 min-h-96">
				<div className="flex flex-col gap-2 self-start">
					<Logo size="lg" />
					<p className="font-medium text-neutral-600">Create Ticket</p>
				</div>
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleFormSubmit}
				>
					{(formik) => (
						<div className="flex flex-col justify-between items-center gap-8 w-full">
							<div className="z-10 justify-center items-center gap-x-8 gap-y-4 grid grid-cols-2 grid-flow-row w-full">
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

								<div className="flex flex-col justify-between items-end gap-4 self-end">
									<Button
										type="submit"
										label="Create Ticket"
										loading={formik.isSubmitting}
										disabled={formik.isSubmitting || !formik.isValid}
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
