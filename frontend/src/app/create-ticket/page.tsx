import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import createTicketThunk from '@/store/create-ticket.thunk';

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
        quantity: Yup.number().required('Required').positive('Quantity must be positive').integer(),
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
            <div className="flex flex-col justify-start items-center gap-6 bg-white p-8 rounded-sm min-w-96">
                <h1 className="text-xl font-bold">Create New Ticket</h1>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleFormSubmit}
                >
                    {formik => (
                        <Form className="flex flex-col gap-4 w-full">
                            <InputField name="name" label="Event Name" type="text" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />
                            <InputField name="description" label="Description" type="text" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />
                            <InputField name="price" label="Price" type="number" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />
                            <InputField name="date" label="Date" type="datetime-local" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />
                            <InputField name="locationName" label="Location Name" type="text" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />
                            <InputField name="coordinates" label="Coordinates" type="text" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />
                            <InputField name="quantity" label="Quantity" type="number" placeholder={''} onChange={function (value: any): void {
                                throw new Error('Function not implemented.');
                            } } value={undefined} />

                            <Button type="submit" label="Create Ticket" loading={formik.isSubmitting} disabled={formik.isSubmitting || !formik.isValid} />
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CreateTicketPage;
