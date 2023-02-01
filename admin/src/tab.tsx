import React from 'react';
import ReactDOM from 'react-dom';
import type { Translations } from 'iobroker-react/i18n';
import { IoBrokerApp } from 'iobroker-react/app';
import { useGlobals, useIoBrokerState } from 'iobroker-react/hooks';
import { Grid, Stack } from '@mui/material';
import { Logo } from 'iobroker-react';
import { PetCard } from './components/PetCard';
import { TractiveDevice } from '../../src/types/TractiveDevice';

// Components are imported here

// Load your translations
const translations: Translations = {
	en: require('./i18n/en.json'),
	de: require('./i18n/de.json'),
	ru: require('./i18n/ru.json'),
	pt: require('./i18n/pt.json'),
	nl: require('./i18n/nl.json'),
	fr: require('./i18n/fr.json'),
	it: require('./i18n/it.json'),
	es: require('./i18n/es.json'),
	pl: require('./i18n/pl.json'),
	uk: require('./i18n/uk.json'),
	'zh-cn': require('./i18n/zh-cn.json'),
};

export interface ItemProps {
	id?: string;
	latlong?: number[];
	lastReceived?: string;
	radius?: number;
	battery?: number;
	power_saving?: boolean;
	connection?: string;
}
const Root: React.FC = () => {
	const { namespace } = useGlobals();
	const [items, setItems] = React.useState<ItemProps[]>([]);
	const [json] = useIoBrokerState({
		id: `${namespace}.json`,
	});
	const item: ItemProps[] = [];

	const handleJson = (json: TractiveDevice) => {
		for (const tracker of json.device_pos_report) {
			const device = {
				id: tracker._id,
				latlong: tracker.latlong,
				lastReceived: new Date(tracker.time_rcvd * 1000).toLocaleString(),
				radius: tracker.pos_uncertainty,
				connection: tracker.sensor_used,
			};
			item.push(device);
		}
		for (const tracker of json.device_hw_report) {
			const device = {
				id: tracker._id,
				battery: tracker.battery_level,
			};
			const index = item.findIndex((item) => item.id === device.id);
			if (index !== -1) {
				item[index].battery = device.battery;
			}
		}
		for (const tracker of json.tracker) {
			const device = {
				id: tracker._id,
				power_saving: tracker.state_reason === 'POWER_SAVING',
			};
			const index = item.findIndex((item) => item.id === device.id);
			if (index !== -1) {
				item[index].power_saving = device.power_saving;
			}
		}
	};

	React.useEffect(() => {
		if (json)
			if (typeof json === 'string') {
				handleJson(JSON.parse(json));
			}
	}, [json]);

	React.useEffect(() => {
		if (item.length > 0) setItems([...item]);
	}, [item]);

	return (
		<React.Fragment>
			<Stack spacing={2}>
				<Logo
					classes={{
						logo: 'logo',
						buttons: 'buttons',
					}}
				/>
			</Stack>
			<Grid container>
				{items.map((items) => {
					return <PetCard key={items.id} item={items} />;
				})}
			</Grid>
		</React.Fragment>
	);
};

ReactDOM.render(
	<IoBrokerApp name={'tractive-gps'} translations={translations}>
		<Root />
	</IoBrokerApp>,
	document.getElementById('root'),
);
