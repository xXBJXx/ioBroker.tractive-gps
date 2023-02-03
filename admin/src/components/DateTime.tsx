import React from 'react';
import { useI18n } from 'iobroker-react/hooks';
import { TextField, Tooltip } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface DateTimeProps {
	settings: ioBroker.AdapterConfig;
}

export const DateTime: React.FC<DateTimeProps> = ({ settings }): JSX.Element => {
	const { translate: t } = useI18n();
	const [value, setValue] = React.useState<Dayjs | string>('');

	React.useEffect(() => {
		setValue(dayjs(settings.expires_at * 1000).format('DD.MM.YYYY, HH:mm:ss'));
		console.log();
	}, [settings.expires_at]);

	return (
		<React.Fragment>
			<Tooltip title={t('dateTime_token_expires_tooltip')} arrow>
				<TextField
					id="expires_at"
					disabled={true}
					label={t('date/time')}
					variant="outlined"
					value={value}
					inputProps={{
						style: { textAlign: 'center' },
					}}
					onChange={(event) => {
						console.log(event.target.value);
					}}
				/>
			</Tooltip>
		</React.Fragment>
	);
};
