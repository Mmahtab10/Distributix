export const formatFullDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${month < 10 ? '0' + month : month}/${
		day < 10 ? '0' + day : day
	}/${year}`;
};
