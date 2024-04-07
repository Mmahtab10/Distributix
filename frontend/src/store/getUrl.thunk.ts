import { Dispatch } from '@reduxjs/toolkit';
import {
	Notification,
	SessionState,
	addNotification,
	setLoading,
	setUrl,
} from './session.slice';

const getURLThunk = (lId = 2, firstCall = true) => {
	return (dispatch: Dispatch, getState: any) => {
		const { url, loading } = getState().session as SessionState;

		const sendNotification = (label: string, message: string) => {
			const notification = {
				label,
				message,
			};
			dispatch(addNotification(notification));
		};
		const COMMS_URL = '3.17.227.54';
		const COMMS_PORTS = [5001, 5002, 5003];
		let leaderId = lId;
		let port = COMMS_PORTS[leaderId];
		let URL = url;
		if (loading && firstCall) {
			return;
		}
		if (!loading) {
			sendNotification(
				'Getting leader',
				'Getting the leader from communication server ' + (leaderId + 1)
			);
		}
		dispatch(setLoading(true));

		if (!url || +(URL?.charAt(URL.length - 1) ?? -1) !== lId) {
			URL = `http://${COMMS_URL}:${port}`;
			console.log('hereeeeeeeeeeeeeeeeeee');
		}
		console.log('mmmmmmmmmmmmmmm', lId, URL);
		fetch(URL + '/leader', {
			method: 'GET',
			headers: { 'Content-type': 'application/json' },
			referrerPolicy: 'unsafe-url',
		})
			.then(async (response) => {
				const data = await response.json();

				if (response.status === 200) {
					dispatch(setUrl(data.leader));
					sendNotification(
						'Got leader',
						'Got the leader! ' + data.leader.split(':')[2].charAt(3)
					);
					dispatch(setLoading(false));
				} else if (response.status === 202) {
					sendNotification(
						'Leader election running',
						'Leader election is running!'
					);
					await new Promise(() =>
						setTimeout(() => {
							sendNotification(
								'Check election status',
								"Checking the election's status"
							);
							dispatch(getURLThunk(leaderId, false) as any);
						}, 5000)
					);
				}
			})
			.catch((error) => {
				const oldLeader = leaderId;
				leaderId = leaderId + 1 < COMMS_PORTS.length ? leaderId + 1 : 0;
				sendNotification(
					'Server unresponsive',
					'Server ' +
						(oldLeader + 1) +
						' is unresponsive, trying server: ' +
						(leaderId + 1)
				);
				return dispatch(getURLThunk(leaderId, false) as any);
			});
	};
};

export default getURLThunk;
