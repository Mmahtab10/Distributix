import { formatFullDate } from '@/helpers/format';
import { Ticket } from '@/types/Ticket';
import { Children, ReactNode } from 'react';
import { FaDollarSign } from 'react-icons/fa';

interface Props {
	ticket: Ticket;
}

const TicketCard: React.FC<Props> = ({ ticket }) => {
	return (
		<div className="flex flex-col gap-4 bg-black hover:bg-neutral-800 p-4 rounded max-h-48 text-white transition-all duration-200 cursor-pointer ease-in-out">
			<div className="flex justify-between gap-1">
				<p className="font-bold text-lg" title={ticket.name}>
					{ticket.name}
				</p>
				<div className="flex flex-col gap-1 min-w-fit">
					<MetaInfoPill>{formatFullDate(new Date(ticket.date))}</MetaInfoPill>
					<MetaInfoPill>
						<FaDollarSign />
						<span className="text-blue">{ticket.price}</span>
					</MetaInfoPill>
					<MetaInfoPill>
						<span className="text-blue">{ticket.quantity}</span> tickets left
					</MetaInfoPill>
				</div>
			</div>
			<p className="text-neutral-400" title={ticket.description}>
				{ticket.description.length > 55
					? ticket.description.substring(0, 55) + '...'
					: ticket.description}
			</p>
		</div>
	);
};

const MetaInfoPill: React.FC<{ children: ReactNode }> = ({ children }) => {
	return (
		<div
			className={`flex ${
				Children.count(children) > 1
					? 'justify-between gap-1'
					: 'justify-center'
			} items-center bg-white p-1 rounded font-bold text-black text-xs`}
		>
			{children}
		</div>
	);
};

export default TicketCard;
