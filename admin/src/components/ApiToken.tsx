import React from 'react';
import { useConnection, useGlobals, useI18n } from 'iobroker-react/hooks';
import { decrypt } from 'iobroker-react/lib/shared/tools';
import { PasswordInput } from 'iobroker-react';
import { Alert, Box, Button, Dialog, DialogContent, FormControl, Typography } from '@mui/material';

interface ApiTokenProps {
	settings: ioBroker.AdapterConfig;
	secret: string;
}
let timer: NodeJS.Timeout | null = null;
export const ApiToken: React.FC<ApiTokenProps> = ({ settings, secret }): JSX.Element => {
	const { translate: t } = useI18n();
	const connection = useConnection();
	const { namespace } = useGlobals();

	const [value, setValue] = React.useState<string>('');
	const [success, setSuccess] = React.useState<boolean>(false);

	React.useMemo(() => {
		if (secret) {
			setValue(decrypt(secret, settings.access_token));
		}
	}, [settings.access_token, secret]);

	const refreshToken = React.useCallback(async () => {
		console.log('refreshToken');
		const result = await connection.sendTo(namespace, 'refreshToken', { token: '' });
		if (!result) console.error('Nope!');
		if (result) {
			setTimeout(() => {
				if (secret) setValue(decrypt(secret, settings.access_token));
				setSuccess(true);
				console.log('refreshed');
			}, 1000);
		}
		console.log(result);
	}, [connection, namespace]);

	const handleClose = () => {
		setSuccess(false);
	};

	React.useEffect(() => {
		if (timer) clearTimeout(timer);
		// close dialog after 3 seconds
		timer = setTimeout(() => {
			setSuccess(false);
		}, 5000);
	}, [success]);

	return (
		<React.Fragment>
			<FormControl>
				<PasswordInput
					label={t('apiToken_accessToken')}
					value={value}
					onChange={() => {
						console.log('onChange');
					}}
				/>
			</FormControl>
			<Box
				sx={{ display: 'flex', justifyContent: 'space-evenly', flexDirection: 'column', alignItems: 'center' }}
			>
				<Typography variant="body1" color="text.secondary" component="p">
					{t('apiToken_refresh_description')}
				</Typography>
				<Button variant="contained" onClick={() => refreshToken()}>
					{t('apiToken_refresh')}
				</Button>
			</Box>

			<Dialog open={success} onClose={handleClose}>
				<DialogContent>
					<Alert variant="filled" severity="success">
						{t('apiToken_refreshed')}
					</Alert>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
};
