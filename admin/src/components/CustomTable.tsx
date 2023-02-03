/**
 * Created by alex-issi on 01.05.22
 */
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useGlobals, useI18n, useIoBrokerState } from 'iobroker-react/hooks';
import React from 'react';
import { EditModal } from './EditModal';

interface CustomTableProps {
	settings: ioBroker.AdapterConfig;
	onChange: (id: keyof ioBroker.AdapterConfig, value: { id: string; name: string }[]) => void;
}

export const CustomTable: React.FC<CustomTableProps> = ({ settings, onChange }): JSX.Element => {
	// Translation function
	const { translate: _ } = useI18n();
	const { namespace } = useGlobals();
	const [items, setItems] = React.useState<ioBroker.NameArray[]>(settings.nameArray);
	const [json] = useIoBrokerState({
		id: `${namespace}.json`,
	});

	const handleOldValue = (value) => {
		if (value) {
			const newArray = [...items];
			for (const key of Object.keys(value)) {
				// search in value the _id and compare with the _id in settings.nameArray (id) and if not present then add it
				const found = settings.nameArray.find((element) => element.id === value[key]._id);
				if (!found) {
					console.log('not found in nameArray', value[key]._id);
					newArray.push({ id: value[key]._id, name: value[key]._id });
					setItems(newArray);
					onChange('nameArray', newArray);
				}
			}

			// check if there is an entry in settings.nameArray (id) that is not present in value and if yes then delete this entry
			for (const key of Object.keys(settings.nameArray)) {
				const found = value.find((element) => element._id === settings.nameArray[key].id);
				if (!found) {
					console.log('not found json', settings.nameArray[key].id);
					const index = newArray.findIndex((element) => element.id === settings.nameArray[key].id);
					newArray.splice(index, 1);
					setItems(newArray);
					onChange('nameArray', newArray);
				}
			}
		}
	};

	React.useEffect(() => {
		if (json) {
			if (typeof json === 'string') {
				const jsonTree = JSON.parse(json);
				handleOldValue(jsonTree.trackers);
			}
		}
	}, [json]);

	const handleEdit = (value: ioBroker.NameArray | undefined, index: number) => {
		if (value) {
			const newArray = [...items];
			newArray[index] = value;
			setItems(newArray);
			onChange('nameArray', newArray);
		}
	};

	const random = (): number => Math.floor(Math.random() * 100);

	return (
		<React.Fragment>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="NameArray table">
					<TableHead>
						<TableRow>
							<TableCell align="center">{_('deviceID')}</TableCell>
							<TableCell align="center">{_('deviceName')}</TableCell>
							<TableCell align="center">{_('actions')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((row, index) => (
							<TableRow
								key={`${row.id}-${random}`}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell id={'id'} align="center">
									{row.id}
								</TableCell>
								<TableCell align="center">{row.name}</TableCell>
								<TableCell align="center">
									<EditModal
										editRow={(value, index) => handleEdit(value, index)}
										oldRow={row}
										index={index}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</React.Fragment>
	);
};
