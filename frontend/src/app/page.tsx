'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import Logo from '@/components/Logo';
import TicketCard from '@/components/TicketCard';
import { getTickets } from '@/helpers/tickets';
import { Ticket } from '@/types/Ticket';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

export default function Page() {
	const [searchTerm, setSearchTerm] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const router = useRouter();

	useEffect(() => {
		setTickets(getTickets());
	}, []);

	useEffect(() => {
		let t = getTickets();

		if (searchTerm !== '') {
			t = t.filter(
				(ticket) =>
					ticket.name.toLowerCase().includes(searchTerm) ||
					ticket.description.toLowerCase().includes(searchTerm)
			);
		}

		if (startDate !== '') {
			t = t.filter((ticket) => new Date(startDate) <= new Date(ticket.date));
		}

		if (endDate !== '') {
			t = t.filter((ticket) => new Date(endDate) >= new Date(ticket.date));
		}
		setTickets(t);
	}, [startDate, endDate, searchTerm]);

	return (
		<div className="flex flex-col justify-start items-start gap-8 p-6 md:p-10 lg:p-14 pb-0 w-full h-full">
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
				<div className="gap-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 grid-flow-row w-full h-full overflow-y-scroll">
					{tickets.map((ticket) => (
						<TicketCard key={ticket.id} ticket={ticket} />
					))}
				</div>
			</div>
		</div>
	);
}
