import React from 'react';
import { EmailInput } from './components/EmailInput';
import { NumberInput, PasswordInput, useI18n } from 'iobroker-react';
import { decrypt, encrypt } from 'iobroker-react/lib/shared/tools';
import { Box, FormControl } from '@mui/material';
import { Spacer } from './components/Spacer';

interface SettingPageProps {
	onChange: (key: keyof ioBroker.AdapterConfig, value: any) => void;
	settings: ioBroker.AdapterConfig;
	secret: string;
}

export const SettingPage: React.FC<SettingPageProps> = ({ settings, secret, onChange }): JSX.Element => {
	const { translate: t } = useI18n();
	const handleChangePassword = (value: string) => {
		// encrypt the password
		const encryptedPassword = encrypt(secret, value);
		// save the encrypted password
		onChange('password', encryptedPassword);
	};

	return (
		<React.Fragment>
			<Spacer text={t('settings_interval')} align={'center'} />
			<Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
				<FormControl
					sx={{
						width: '150px',
					}}
				>
					<NumberInput
						min={1}
						label={t('settings_interval')}
						textAlign={'center'}
						unit={'s'}
						value={settings.interval}
						onChange={(value) => onChange('interval', value)}
						tooltip={{
							title: t('settings_interval_tooltip'),
							placement: 'top',
							arrow: true,
						}}
					/>
				</FormControl>
			</Box>
			<Spacer text={t('settings_login')} align={'center'} />
			<Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
				<EmailInput settings={settings} onChange={onChange} />
				<FormControl>
					<PasswordInput
						label={t('settings_password')}
						value={decrypt(secret, settings.password)}
						onChange={handleChangePassword}
					/>
				</FormControl>
			</Box>
		</React.Fragment>
	);
};
