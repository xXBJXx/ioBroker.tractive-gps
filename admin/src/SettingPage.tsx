import React from 'react';
import { EmailInput } from './components/EmailInput';
import { NumberInput, PasswordInput, SettingsHeader, useI18n } from 'iobroker-react';
import { decrypt, encrypt } from 'iobroker-react/lib/shared/tools';
import { Box, FormControl, Stack, Tab, Tabs } from '@mui/material';
import { Spacer } from './components/Spacer';
import { CustomTable } from './components/CustomTable';
import { DateTime } from './components/DateTime';
import { ApiToken } from './components/ApiToken';

interface SettingPageProps {
	onChange: (key: keyof ioBroker.AdapterConfig, value: any) => void;
	settings: ioBroker.AdapterConfig;
	secret: string;
}
interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}
function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`tabpanel-${index}`}
			aria-labelledby={`tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `tab-${index}`,
		'aria-controls': `tabpanel-${index}`,
	};
}

export const SettingPage: React.FC<SettingPageProps> = ({ settings, secret, onChange }): JSX.Element => {
	const { translate: t } = useI18n();
	const [value, setValue] = React.useState(0);

	const handleChangePassword = (value: string) => {
		// encrypt the password
		if (secret) {
			const encryptedPassword = encrypt(secret, value);
			// save the encrypted password
			onChange('password', encryptedPassword);
		}
	};
	const handleChangeTabs = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};
	const handleDecryption = (value: string) => {
		if (secret) {
			const decryptedValue = decrypt(secret, value);
			return decryptedValue;
		}
		return value;
	};

	return (
		<React.Fragment>
			<Box
				sx={{
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper',
					marginTop: '-20px',
				}}
			>
				<Tabs
					value={value}
					indicatorColor="secondary"
					textColor="inherit"
					variant="fullWidth"
					scrollButtons="auto"
					allowScrollButtonsMobile
					onChange={handleChangeTabs}
					aria-label="basic tabs"
				>
					<Tab label={t('settings_login')} {...a11yProps(0)} />
					<Tab label={t('settings_devices')} {...a11yProps(1)} />
					{/*<Tab label="IDs" {...a11yProps(2)} />*/}
				</Tabs>
			</Box>
			<Stack spacing={2}>
				<SettingsHeader
					classes={{
						logo: 'logo',
					}}
				/>
			</Stack>
			<TabPanel value={value} index={0}>
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
							value={handleDecryption(settings.password)}
							onChange={handleChangePassword}
						/>
					</FormControl>
				</Box>
				<Spacer text={t('settings_token')} align={'center'} />
				<Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
					<DateTime settings={settings} />
					<ApiToken settings={settings} secret={secret} />
				</Box>
			</TabPanel>
			<TabPanel value={value} index={1}>
				<Spacer text={t('settings_devices')} align={'center'} />
				<CustomTable settings={settings} onChange={onChange} />
			</TabPanel>
		</React.Fragment>
	);
};
