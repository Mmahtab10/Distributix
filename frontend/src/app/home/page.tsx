'use client';

import Button from '@/components/Button';
import InputField from '@/components/InputField';
import Logo from '@/components/Logo';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function Page() {
	const [searchTerm, setSearchTerm] = useState('');
	return (
		<div className="flex flex-col justify-start items-start gap-8 p-8 lg:p-16 w-full h-full">
			<div className="flex justify-between items-center gap-16 bg-white p-4 rounded-sm w-full">
				<Logo size="lg" type="light" hideBorder={false} />
				<div className="flex justify-between gap-4 bg-white rounded-sm w-96">
					<InputField
						placeholder="search"
						name="search"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Button
						onClick={() => {}}
						style="ghost"
						size="sm"
						icon={<FaSearch className="w-6 h-6" />}
					/>
				</div>
			</div>
		</div>
	);
}
