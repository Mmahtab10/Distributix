const COMMS_URL = '3.17.227.54';
const COMMS_PORTS = [5001, 5002, 5003];
export const getEnvURL = (leaderId: number) =>
	`http://${COMMS_URL}:${COMMS_PORTS[leaderId - 1]}`;
