import React from 'react';
import ReactDOM from 'react-dom';
import type { Translations } from 'iobroker-react/i18n';
import { IoBrokerApp } from 'iobroker-react/app';
// import { useAdapter, useGlobals, useI18n } from 'iobroker-react/hooks';
import { Logo } from 'iobroker-react';
import { Stack } from '@mui/material';
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

const Root: React.FC = () => {
	// const { translate: t } = useI18n();
	// const { alive } = useAdapter();
	// const { namespace } = useGlobals();

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
		</React.Fragment>
	);
};

ReactDOM.render(
	<IoBrokerApp name={'tractive-gps'} translations={translations}>
		<Root />
	</IoBrokerApp>,
	document.getElementById('root'),
);
