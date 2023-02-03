const systemSecret = 'Zgfr56gFe87jJOM';

/**
 * Decrypt the password/value with given key
 * @param secret - Secret key
 * @param value - value to decrypt
 */
export function decrypt(secret: string, value: string | undefined) {
	if (value === undefined) {
		value = secret;
		secret = systemSecret;
	}
	let result = '';
	for (let i = 0; i < value.length; i++) {
		result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ value.charCodeAt(i));
	}
	return result;
}

/**
 * Encrypt the password/value with given key
 * @param secret - Secret key
 * @param value - value to encrypt
 */
export function encrypt(secret: string, value: string | undefined) {
	if (value === undefined) {
		value = secret;
		secret = systemSecret;
	}
	let result = '';
	for (let i = 0; i < value.length; i++) {
		result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ value.charCodeAt(i));
	}
	return result;
}
