import { Dispatch } from '@reduxjs/toolkit';
import { setError, setLoading } from './session.slice';  // Use session slice actions

interface TicketData {
    name: string;
    description: string;
    price: number;
    date: string;
    locationName: string;
    coordinates: string;
    quantity: number;
}

const createTicketThunk = (ticketData: TicketData) => {
    return (dispatch: Dispatch) => {
        dispatch(setLoading(true));
        fetch('/api/ticket/create', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(ticketData),
        })
        .then(async (response) => {
            if (response.ok) {
                const { ticketId } = await response.json();
                dispatch(setLoading(false));
                return ticketId;
            } else {
                const error = (await response.json()).message;
                dispatch(setError(error));
                dispatch(setLoading(false));
                throw new Error(error);  // To handle in the catch block of the form submission
            }
        })
        .catch((error) => {
            dispatch(setError(error.message));
            dispatch(setLoading(false));
            throw error;  // To handle in the catch block of the form submission
        });
    };
};

export default createTicketThunk;
