import React, { useState } from 'react';
import { useI18n } from 'iobroker-react/hooks';
import { FormControl, FormHelperText, TextField } from '@mui/material';

interface EmailInputProps {
	onChange: (key: keyof ioBroker.AdapterConfig, value: any) => void;
	settings: ioBroker.AdapterConfig;
}

export const EmailInput: React.FC<EmailInputProps> = ({ settings, onChange }): JSX.Element => {
	const { translate: t } = useI18n();
	const [email, setEmail] = useState(settings.email);
	const [error, setError] = useState(false);
	const [valid, setValid] = useState(false);

	const validateEmail = (email: string): boolean => {
		const re =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		setError(!re.test(email));
		setValid(re.test(email));
		return re.test(email);
	};

	const handleChange = (event) => {
		setEmail(event.target.value);
		const result = validateEmail(event.target.value);
		if (result) {
			onChange('email', event.target.value);
		}
	};

	return (
		<FormControl
			error={error}
			sx={{
				width: '300px',
			}}
		>
			<TextField label={t('emailInput_email')} value={email} onChange={handleChange} />
			{error && <FormHelperText>{t('emailInput_invalid_email')}</FormHelperText>}
			{valid && <FormHelperText>{t('emailInput_valid_email')}</FormHelperText>}
		</FormControl>
	);
};
