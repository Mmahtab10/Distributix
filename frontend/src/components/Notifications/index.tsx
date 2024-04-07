import { formatFullDate } from '@/helpers/format';
import {
	Notification,
	SessionState,
	removeNotification,
} from '@/store/session.slice';
import { Ticket } from '@/types/Ticket';
import { useRouter } from 'next/navigation';
import { Children, ReactNode, useEffect, useState } from 'react';
import { FaDollarSign } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

interface Props {}

const Notifications: React.FC<Props> = ({}) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const { notifications: notis } = useSelector(
		({ session }: { session: SessionState }) => session
	);

	useEffect(() => {
		setNotifications(notis ?? []);
	}, [notis]);
	return (
		<div className="right-0 bottom-0 z-50 absolute flex flex-col justify-end gap-8 p-8 w-fit h-full">
			{notifications.map((n) => {
				return (
					<NotificationComp
						key={n.id}
						label={n.label}
						message={n.message}
						id={n.id!}
					/>
				);
			})}
		</div>
	);
};

const NotificationComp: React.FC<{
	label: string;
	message: string;
	id: number;
}> = ({ label, message, id }) => {
	const dispatch = useDispatch();
	useEffect(() => {
		const timeout = setTimeout(() => {
			dispatch(removeNotification(id));
		}, 5000);

		return () => {
			clearTimeout(timeout);
		};
	}, [id, dispatch]);
	return (
		<div className="relative flex flex-col gap-2 bg-blue p-4 rounded w-72 text-white overflow-hidden">
			<p className="font-bold text-xl">{label}</p>
			<p className="text-sm">{message}</p>
		</div>
	);
};

export default Notifications;
