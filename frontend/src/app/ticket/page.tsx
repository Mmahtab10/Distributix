'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import Logo from '@/components/Logo';
import Notifications from '@/components/Notifications';
import { formatFullDate } from '@/helpers/format';
import getURLThunk from '@/store/getUrl.thunk';
import { SessionState, addNotification } from '@/store/session.slice';
import { Ticket } from '@/types/Ticket';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Formik } from 'formik';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { FaArrowLeft, FaDollarSign } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

export default function Page() {
	const [ticket, setTicket] = useState<Ticket>();
	const [quantity, setQuantity] = useState<number>(0);
	const params = useSearchParams();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { url, loading: URLLoading } = useSelector(
		({ session }: { session: SessionState }) => session
	);
	const dispatch = useDispatch();
	const [refresh, setRefresh] = useState(false);
	useEffect(() => {
		if (url || (refresh && url)) {
			setLoading(true);
			fetch(url + '/get_ticket/' + params.get('id'), {
				method: 'GET',
				headers: { 'Content-type': 'application/json' },
				referrerPolicy: 'unsafe-url',
			})
				.then(async (response) => {
					const data = await response.json();
					if (response.status === 200) {
						setLoading(false);
						setTicket({
							...data.ticket,
							coordinates: data.ticket.coordinates.split(','),
						});
					} else if (response.status === 403) {
						dispatch(getURLThunk() as any);
						dispatch(
							addNotification({
								label: 'Server error',
								message: 'please try again!',
							})
						);
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
				});
		} else {
			dispatch(getURLThunk() as any);
		}
		setRefresh(false);
	}, [url, dispatch, params, refresh]);

	return (
		<div className="absolute flex flex-col justify-start items-start gap-8 p-6 md:p-10 lg:p-14 pb-0 w-full h-full">
			<Notifications />
			<div className="flex justify-between items-center gap-16 bg-white rounded w-full">
				<Link href="/" className="cursor-pointer">
					<Logo size="lg" type="light" hideBorder={true} />
				</Link>
				<Button
					label="Go back"
					size="lg"
					onClick={() => router.push('/')}
					icon={<FaArrowLeft />}
				/>
			</div>
			{(loading || URLLoading) && (
				<div className="relative z-[999] flex flex-col justify-center items-center w-full h-full">
					<div className="top-1/2 left-1/2 z-[999] absolute -translate-x-1/2 -translate-y-1/2">
						<CgSpinner className={`animate-spin text-blue w-32 h-32 z-[999]`} />
					</div>
				</div>
			)}
			{ticket && !loading && !URLLoading && (
				<div className="flex flex-col gap-8 bg-white pb-0 rounded w-full h-full overflow-hidden">
					<div className="flex flex-col gap-8 w-1/3">
						<div className="flex flex-col gap-4">
							<h3 className="font-bold text-2xl">{ticket.eventName}</h3>
							<p className="text-neutral-700">{ticket.description}</p>
						</div>
						<div className="flex gap-4 min-w-fit">
							<div
								className={`flex justify-center gap-1 items-center bg-black p-2 rounded font-bold text-white`}
							>
								<p>{formatFullDate(new Date(ticket.date))}</p>
							</div>
							<div
								className={`flex justify-between gap-1 items-center bg-black p-2 rounded font-bold text-white`}
							>
								<FaDollarSign />
								<span className="text-blue">{ticket.price}</span>
							</div>
							<div
								className={`flex justify-center gap-2 items-center bg-black p-2 rounded font-bold text-white`}
							>
								<span className="text-blue">{ticket.quantity}</span> tickets
								left
							</div>
						</div>
						<Formik
							initialValues={{
								quantity: '0.0',
							}}
							validationSchema={Yup.object().shape({
								quantity: Yup.string()
									.min(1, 'You need to order atleast 1')
									.max(
										ticket.quantity,
										'You can only order upto ' + ticket.quantity + ' tickets.'
									)
									.required('required'),
							})}
							onSubmit={(values, formik) => {
								fetch(url + '/place_order', {
									method: 'POST',
									headers: { 'Content-type': 'application/json' },
									referrerPolicy: 'unsafe-url',
									body: JSON.stringify({
										ticket_id: params.get('id'),
										quantity: values.quantity,
									}),
								})
									.then(async (response) => {
										const data = await response.json();
										if (response.status === 200) {
											setLoading(false);
											setRefresh(true);
										} else if (response.status === 403) {
											dispatch(getURLThunk() as any);
											dispatch(
												addNotification({
													label: 'Server error',
													message: 'please try again!',
												})
											);
											setLoading(false);
										} else if (response.status === 422) {
											dispatch(
												addNotification({
													label: 'Not enough quantity',
													message: 'please lower quantity and try again!',
												})
											);
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
							}}
						>
							{(formik) => (
								<div className="flex flex-col justify-center items-center gap-8 w-fit">
									<InputField
										name="quantity"
										label="Quantity"
										type="number"
										onChange={(e) => {
											if (!formik.touched.quantity) {
												formik.setTouched({
													...formik.touched,
													quantity: true,
												});
											}
											formik.handleChange(e);
										}}
										value={formik.values.quantity}
										placeholder="0"
										error={
											!!formik.errors.quantity && formik.touched.quantity
												? formik.errors.quantity
												: ''
										}
									/>
									<Button
										label="Order now"
										onClick={() => formik.submitForm()}
										loading={loading || URLLoading}
										disabled={!!formik.errors.quantity}
									/>
								</div>
							)}
						</Formik>
					</div>
					<div className="flex flex-col gap-4 w-full h-full">
						<p className="font-bold text-lg">Venue is at {ticket.location}</p>
						<APIProvider apiKey={process.env.GOOGLE_MAPS_API ?? ''}>
							<Map
								className="rounded w-full h-full"
								defaultCenter={{
									lat: +ticket.coordinates[0],
									lng: +ticket.coordinates[1],
								}}
								defaultZoom={10}
							>
								<Marker
									position={{
										lat: +ticket.coordinates[0],
										lng: +ticket.coordinates[1],
									}}
								/>
							</Map>
						</APIProvider>
					</div>
				</div>
			)}
		</div>
	);
}
