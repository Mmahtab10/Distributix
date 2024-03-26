import React, { ReactNode } from 'react';
import { CgSpinner } from 'react-icons/cg';

interface Props {
	label: string;
	onClick?: () => void;
	type?: 'submit' | 'button';
	style?: 'primary' | 'secondary' | 'ghost' | 'danger';
	disabled?: boolean;
	loading?: boolean;
	icon?: ReactNode;
	size?: 'sm' | 'md' | 'lg';
}
const Button: React.FC<Props> = ({
	label,
	onClick,
	style = 'primary',
	disabled = false,
	loading = false,
	size = 'md',
	type = 'button',
	icon,
}) => {
	return (
		<button
			className={`cursor-pointer transition-all ease-in-out duration-200 rounded-md font-bold text-center disabled:bg-grey disabled:border-grey ${
				loading ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed'
			} flex justify-center items-center gap-2
      ${
				size === 'md'
					? 'w-32 h-10 border-2'
					: size === 'lg'
					? 'w-48 h-18 border-4 text-lg'
					: 'w-24 h-8 border-2 text-sm'
			}
      ${
				style === 'primary' &&
				'bg-slate-800 text-white border-slate-900 hover:bg-slate-950'
			} 
      ${
				style === 'secondary' &&
				'bg-white text-black border-white hover:bg-black hover:text-white'
			} 
      ${
				style === 'ghost' &&
				'bg-inherit text-white border-white hover:bg-white hover:text-black'
			} 
      ${
				style === 'danger' && 'bg-red text-white border-red hover:bg-red-dark'
			}`}
			disabled={disabled || loading}
			onClick={() => onClick?.()}
			type={type}
		>
			{loading && (
				<CgSpinner
					className={`animate-spin text-white ${
						size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-4 h-4'
					}`}
				/>
			)}
			{!loading && icon}
			{!loading && label}
		</button>
	);
};

export default Button;
