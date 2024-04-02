import React from 'react';

interface Props {
	name: string;
	label?: string;
	placeholder: string;
	onChange: (value: any) => void;
	value: any;
	type?:
		| 'textarea'
		| 'text'
		| 'email'
		| 'password'
		| 'number'
		| 'datetime-local'
		| 'date';
	error?: string;
}
const InputField: React.FC<Props> = ({
	name,
	label,
	placeholder,
	onChange,
	value,
	type = 'text',
	error,
}) => {
	const getSharedStyles = () =>
		`border-[3px] bg-white w-full ${
			error ? 'border-red' : 'border-black focus:border-blue'
		} flex justify-start items-center rounded px-2 outline-none text-black font-bold transition-all duration-200 ease-in-out `;
	return (
		<div
			className={`w-full ${
				type === 'textarea' ? 'min-h-[5rem] max-h-[8rem]' : 'max-h-[5rem]'
			} flex flex-col justify-start items-start relative`}
		>
			<style>
				{`date::-webkit-calendar-picker-indicator {
          margin-left: auto
        }`}
			</style>
			{label && (
				<label className={`text-black font-bold`} htmlFor={name}>
					{label}
				</label>
			)}
			{type === 'textarea' ? (
				<textarea
					id={name}
					name={name}
					className={`p-2 min-h-[3rem] min-w-[16rem] ${getSharedStyles()}`}
					placeholder={placeholder}
					onChange={onChange}
					value={value || ''}
				/>
			) : (
				<input
					id={name}
					name={name}
					type={type}
					className={` h-12 ${getSharedStyles()} -ms-reveal:invert ${
						!type.includes('date') && 'min-w-[16rem]'
					}`}
					placeholder={placeholder}
					onChange={onChange}
					value={value || ''}
				/>
			)}
			<p className="top-full left-2 absolute font-bold text-red text-sm">
				{error}
			</p>
		</div>
	);
};

export default InputField;
