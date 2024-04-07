'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import Logo from '@/components/Logo';
import Notifications from '@/components/Notifications';
import TicketCard from '@/components/TicketCard';
import getURLThunk from '@/store/getUrl.thunk';
import { SessionState, addNotification } from '@/store/session.slice';
import { Ticket } from '@/types/Ticket';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export default function Page() {
	const [searchTerm, setSearchTerm] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { url, loading: URLLoading } = useSelector(
		({ session }: { session: SessionState }) => session
	);
	const dispatch = useDispatch();

	useEffect(() => {
		if (url) {
			setLoading(true);
			fetch(url + '/get_tickets', {
				method: 'GET',
				headers: { 'Content-type': 'application/json' },
				referrerPolicy: 'unsafe-url',
			})
				.then(async (response) => {
					const data = await response.json();
					if (response.status === 200) {
						setLoading(false);
						setTickets(data.tickets);
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
	}, [url, dispatch]);

	const format = (tickets: Ticket[]) => {
		let t = tickets;

		if (searchTerm !== '') {
			t = t.filter(
				(ticket) =>
					ticket.eventName.toLowerCase().includes(searchTerm) ||
					ticket.description.toLowerCase().includes(searchTerm)
			);
		}

		if (startDate !== '') {
			t = t.filter((ticket) => new Date(startDate) <= new Date(ticket.date));
		}

		if (endDate !== '') {
			t = t.filter((ticket) => new Date(endDate) >= new Date(ticket.date));
		}
		return t;
	};

	return (
		<div className="absolute flex flex-col justify-start items-start gap-8 p-6 md:p-10 lg:p-14 pb-0 w-full h-full">
			<Notifications />
			<div className="flex justify-between items-center gap-16 bg-white rounded w-full">
				<Logo size="lg" type="light" hideBorder={true} />
				<Button
					label="Create ticket"
					size="lg"
					onClick={() => router.push('/ticket/create')}
					icon={<FaPlus />}
				/>
			</div>
			<div className="flex flex-col gap-8 bg-white pb-0 rounded w-full h-full overflow-hidden">
				<div className="flex md:flex-row flex-col md:justify-between md:items-center w-full">
					<h3 className="font-bold text-xl md:text-2xl lg:text-3xl">Tickets</h3>

					<div className="flex md:flex-row flex-col justify-between items-end gap-4 bg-white rounded">
						<div className="md:block hidden">
							<InputField
								placeholder="Start date"
								label="Start date"
								name="startDate"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div className="md:block hidden">
							<InputField
								placeholder="End Date"
								label="End date"
								name="endDate"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
						<div className="md:block hidden">
							<InputField
								placeholder="search"
								label="Search"
								name="search"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</div>
				{!loading && !URLLoading && (
					<div className="gap-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 grid-flow-row w-full max-h-full overflow-y-scroll">
						{format(tickets).map((ticket) => (
							<TicketCard key={ticket.ticket_id} ticket={ticket} />
						))}
					</div>
				)}
				{(loading || URLLoading) && (
					<div className="relative z-[999] flex flex-col justify-center items-center w-full h-full">
						<div className="top-1/2 left-1/2 z-[999] absolute -translate-x-1/2 -translate-y-1/2">
							<CgSpinner
								className={`animate-spin text-blue w-32 h-32 z-[999]`}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
