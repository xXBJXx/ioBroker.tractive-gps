import React from 'react';
import { useI18n } from 'iobroker-react/hooks';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Maps } from './Maps';
import { Pets } from '@mui/icons-material';
import WifiIcon from '@mui/icons-material/Wifi';
import TapAndPlayIcon from '@mui/icons-material/TapAndPlay';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import { ItemProps } from '../tab';

interface PetCardProps {
	item: ItemProps;
}

export const PetCard: React.FC<PetCardProps> = ({ item }): JSX.Element => {
	const { translate: _ } = useI18n();

	return (
		<React.Fragment>
			<Card
				sx={{
					maxWidth: 450,
					width: '100%',
					borderRadius: '20px',
					boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
					margin: '10px',
					padding: '10px',
				}}
			>
				<CardContent
					sx={{
						margin: '5 5 0 5',
						height: '50px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-around',
						borderRadius: '15px 15px 0px 0px',
						borderTop: '2.5px solid',
						borderRight: '2.5px solid',
						borderLeft: '2.5px solid',
						borderColor: '#000000',
						padding: '5 5 0 5',
					}}
				>
					<Pets />
					<Typography
						variant="h5"
						maxWidth={'md'}
						sx={{
							fontSize: '20px',
						}}
					>
						{item.id}
					</Typography>
					<Pets />
				</CardContent>
				<CardMedia
					component="img"
					image="images/pets.png"
					// image="https://t4.ftcdn.net/jpg/03/33/41/39/360_F_333413930_c2GjjOCNl0TtbAQDX6VIlKfcBdHEbya3.jpg"
					alt="green iguana"
					sx={{
						height: '230px',
						width: '97.7%',
						paddingTop: '0px',
						paddingBottom: '0px',
						borderRight: '2.5px solid',
						borderLeft: '2.5px solid',
						margin: '0 5 0 5',
						borderColor: 'black',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						alignContent: 'flex-end',
						flexWrap: 'wrap',
						fontSize: '1rem',
						objectFit: 'contain',
					}}
				/>
				<CardContent
					sx={{
						paddingTop: '10px',
						paddingBottom: '0px',
						borderRight: '2.5px solid',
						borderLeft: '2.5px solid',
						margin: '0 5 0 5',
						borderColor: 'black',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						alignContent: 'flex-end',
						flexWrap: 'wrap',
						fontSize: '1rem',
					}}
				>
					<Maps item={item} />
				</CardContent>
				<CardContent
					sx={{
						paddingTop: '15px',
						paddingBottom: '0px',
						borderRight: '2.5px solid',
						borderLeft: '2.5px solid',
						borderBottom: '2.5px solid',
						margin: '0 5 5 5',
						borderColor: 'black',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						alignContent: 'flex-end',
						flexWrap: 'wrap',
						fontSize: '1rem',
						borderRadius: '0px 0px 15px 15px',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							borderTop: '2.5px solid',
							borderBottom: '2.5px solid',
							borderRight: '2.5px solid',
							borderLeft: '2.5px solid',
							borderColor: 'divider',
							borderRadius: '15px 0px 0px 15px',
							width: '50%',
						}}
					>
						<Typography
							gutterBottom
							component="div"
							sx={{
								marginTop: '5px',
								// marginRight: '15px',
								// paddingRight: '15px',
							}}
						>
							latitude:
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginRight: '15px',
							// 	paddingRight: '15px',
							// }}
						>
							longitude:
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginRight: '15px',
							// 	paddingRight: '15px',
							// }}
						>
							last seen:
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginRight: '15px',
							// 	paddingRight: '15px',
							// }}
						>
							Battery:
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginRight: '15px',
							// 	paddingRight: '15px',
							// }}
						>
							At Home:
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginRight: '15px',
							// 	paddingRight: '15px',
							// }}
						>
							connection:
						</Typography>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							borderTop: '2.5px solid',
							borderBottom: '2.5px solid',
							borderRight: '2.5px solid',
							borderColor: 'divider',
							borderRadius: '0px 15px 15px 0px',
							width: '50%',
						}}
					>
						<Typography
							gutterBottom
							component="div"
							sx={{
								marginTop: '5px',
								// 	marginLeft: '15px',
								// 	paddingLeft: '15px',
							}}
						>
							{item.latlong ? item.latlong[0] : 'loading...'}
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginLeft: '15px',
							// 	paddingLeft: '15px',
							// }}
						>
							{item.latlong ? item.latlong[1] : 'loading...'}
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginLeft: '15px',
							// 	paddingLeft: '15px',
							// }}
						>
							{item.lastReceived ? item.lastReceived : 'loading...'}
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginLeft: '15px',
							// 	paddingLeft: '15px',
							// }}
						>
							{item.battery ? `${item.battery}%` : 'loading...'}
						</Typography>

						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginLeft: '15px',
							// 	paddingLeft: '15px',
							// }}
						>
							{item.power_saving ? 'Yes' : 'No'}
						</Typography>
						<Typography
							gutterBottom
							color="text.secondary"
							// sx={{
							// 	marginLeft: '15px',
							// 	paddingLeft: '15px',
							// }}
						>
							{item.connection === 'GPS' ? (
								<SatelliteAltIcon />
							) : item.connection === 'KNOWN_WIFI' ? (
								<WifiIcon />
							) : (
								<TapAndPlayIcon />
							)}
						</Typography>
					</Box>
				</CardContent>
			</Card>
		</React.Fragment>
	);
};
