import React from 'react';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Box } from '@mui/material';
import { useGlobals } from 'iobroker-react/hooks';
import { ItemProps } from '../tab';

interface MapsProps {
	item: ItemProps;
	// props
}

export const Maps: React.FC<MapsProps> = ({ item }): JSX.Element => {
	const { namespace } = useGlobals();
	if (item.latlong === undefined) {
		item.latlong = [0, 0];
	}
	if (item.radius === undefined) {
		item.radius = 0;
	}
	const [map, setMap] = React.useState<[number, number]>([item.latlong[0], item.latlong[1]]);

	return (
		<Box
			sx={{
				width: '100%',
				height: '200px',
				borderRadius: '10px',
				overflow: 'hidden',
				'.leaflet-control': { display: 'none' },
			}}
		>
			<MapContainer
				center={map}
				zoomControl={false}
				doubleClickZoom={false}
				touchZoom={false}
				zoom={18}
				scrollWheelZoom={true}
				style={{ height: '100%', width: '100%', borderRadius: '10px' }}
				dragging={true}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={map} />
				<Circle center={map} radius={item.radius} />
			</MapContainer>
		</Box>
	);
};
