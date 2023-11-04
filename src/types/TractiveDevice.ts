export interface Token {
	user_id: string;
	client_id?: string;
	expires_at: number;
	access_token?: string;
}

export interface TractiveDevice {
	userInfo: Token;
	trackers: Trackers[];
	tracker: Tracker[];
	device_hw_report: DeviceHwReport[];
	positions: Positions[];
	device_pos_report: DevicePosReport[];
}

export interface Trackers {
	_id: string;
	_type: string;
	_version: string;
}

export interface Tracker {
	_id: string;
	hw_id: string;
	hw_type: string;
	model_number: string;
	_type: string;
	_version: string;
	bluetooth_mac: string | null;
	geofence_sensitivity: string;
	battery_save_mode: string | null;
	read_only: boolean;
	demo: boolean;
	self_test_available: boolean;
	capabilities: string[];
	supported_geofence_types: string[];
	fw_version: string;
	state: string;
	state_reason: string;
	charging_state: string;
	battery_state: string;
	power_saving_zone_id: string | null;
}

export interface DeviceHwReport {
	time: number;
	battery_level: number;
	clip_mounted_state: null | unknown;
	_id: string;
	_type: string;
	_version: string;
	report_id: string;
	power_saving_zone_id: string | null;
	hw_status: null | unknown;
}

export interface Positions {
	time: number;
	latlong: number[];
	alt: number;
	speed: number | null;
	course: number | null;
	pos_uncertainty: number;
	sensor_used: string;
}

export interface DevicePosReport {
	time: number;
	time_rcvd: number;
	sensor_used: string;
	pos_status: null;
	latlong: number[];
	speed: null | number;
	pos_uncertainty: number;
	_id: string;
	_type: string;
	_version: string;
	altitude: number;
	report_id: string;
	nearby_user_id: null | string;
	power_saving_zone_id: string | null;
}
