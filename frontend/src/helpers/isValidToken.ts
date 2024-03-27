const isValidToken = (parsedToken: { exp: number }) => {
	if (parsedToken && parsedToken.exp > new Date().getTime() / 1000) {
		return true;
	} else {
		return false;
	}
};

export default isValidToken;
