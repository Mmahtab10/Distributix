'use client';

import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { formatFullDate } from '@/helpers/format';
import { getEnvURL } from '@/helpers/getEnvURL';
import { Ticket } from '@/types/Ticket';
import { APIProvider, Marker, Map } from '@vis.gl/react-google-maps';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaDollarSign } from 'react-icons/fa';

export default function Page() {
	const [ticket, setTicket] = useState<Ticket>();
	const params = useSearchParams();
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let url = getEnvURL(2);
		const makeRequest = (url: string, retriesLeft: number) => {
			if (retriesLeft <= 0) {
				return;
			}
			fetch(url + '/get_ticket/' + params.get('id'), {
				method: 'GET',
				headers: { 'Content-type': 'application/json' },
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
						makeRequest(
							getEnvURL(data.leader.split(':')[2].charAt(3)),
							retriesLeft - 1
						);
					} else {
						setLoading(false);
					}
				})
				.catch((error) => {});
		};
		makeRequest(url, 5);
		setLoading(true);
	}, [params]);

	return (
		<div className="flex flex-col justify-start items-start gap-8 p-6 md:p-10 lg:p-14 pb-0 w-full h-full">
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
			{ticket && (
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
						<div>
							<Button label="Order now" />
						</div>
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
