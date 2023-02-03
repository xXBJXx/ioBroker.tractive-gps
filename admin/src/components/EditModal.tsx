import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	TextField,
	Tooltip,
} from '@mui/material';
import { useI18n } from 'iobroker-react/hooks';
import React, { useState } from 'react';
import { Edit } from '@mui/icons-material';

export interface EditModalProps {
	editRow?: (value: ioBroker.NameArray | undefined, index: number) => void;
	oldRow?: ioBroker.NameArray;
	index?: number;
}

export const EditModal: React.FC<EditModalProps> = ({ index, editRow, oldRow }): JSX.Element => {
	const { translate: t } = useI18n();
	const [open, setOpen] = useState<boolean>(false);
	const [id, setId] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [rowEdit, setRowEdit] = useState<ioBroker.NameArray>();
	const { translate: _ } = useI18n();

	const handleClickEdit = (): void => {
		if (editRow) {
			if (index !== undefined) editRow(rowEdit, index);
		}
		setOpen(false);
	};

	const handleClickOpen = (): void => {
		if (oldRow) {
			setId(oldRow.id);
			setName(oldRow.name);
		}
		setOpen(true);
	};

	const handleClose = (): void => {
		setOpen(false);
		if (oldRow) {
			setId(oldRow.id);
			setName(oldRow.name);
		}
	};

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setName(event.target.value);
		setRowEdit({ id, name: event.target.value });
	};

	return (
		<React.Fragment>
			<IconButton onClick={handleClickOpen}>
				<Edit />
			</IconButton>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle
					sx={{
						textAlignLast: 'center',
						fontSize: '1.4rem',
					}}
				>
					{_('modal_edit_titel', oldRow?.id || '')}
				</DialogTitle>
				<DialogContent
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						flexDirection: 'row',
						justifyContent: 'center',
					}}
				>
					<Grid
						container
						sx={{
							marginTop: '10px',
							paddingBottom: '15px',
							alignItems: 'center',
							justifyContent: 'space-around',
							display: 'flex',
							flexWrap: 'nowrap',
							flexDirection: 'row',
						}}
					>
						<FormControl sx={{ m: 1, minWidth: 150 }}>
							<TextField disabled id="id" label={t('modal_deviceID')} variant="outlined" value={id} />
						</FormControl>
						<FormControl sx={{ m: 1, minWidth: 150 }}>
							<Tooltip title={t('modal_deviceName_tooltip')} arrow>
								<TextField
									id="name"
									label={t('modal_deviceName')}
									variant="outlined"
									value={name}
									onChange={handleNameChange}
								/>
							</Tooltip>
						</FormControl>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClickEdit}>{_('edit')}</Button>
					<Button onClick={handleClose}>{_('cancel')}</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
};
