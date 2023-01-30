// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
// Load your modules here, e.g.:
import 'source-map-support/register';
import { TractiveDevice } from './types/TractiveDevice';
import axios from 'axios';
import { CronJob } from 'cron';
import { stateAttrb } from './lib/object_definition';

// Global variables here

class TractiveGPS extends utils.Adapter {
	private requestTimer: ioBroker.Timeout | null;
	private interval: number;
	private readonly client_id: string;
	// private expires_at: number;

	private readonly allData: TractiveDevice;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'tractive-gps',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('unload', this.onUnload.bind(this));
		this.requestTimer = null;
		this.interval = 60000;
		this.client_id = '5f9be055d8912eb21a4cd7ba';
		this.allData = {
			userInfo: {
				user_id: '',
				expires_at: 0,
			},
			trackers: [],
			tracker: [],
			device_hw_report: [],
			positions: [],
			device_pos_report: [],
		};
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here
		// convert the interval to milliseconds and add a random value between 0 and 100
		this.interval = this.config.interval * 1000 + Math.floor(Math.random() * 100);
		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);

		// check if the access data are available
		if (this.config.email && this.config.password) {
			// check if user_id and expires_at is greater than 0 and access_token is present
			if (this.config.user_id && this.config.expires_at > 0 && this.config.access_token) {
				// check if expires_at is smaller than now
				// convert Date.now() to seconds
				const now = Math.round(Date.now() / 1000);
				if (this.config.expires_at < now) {
					// get new access token when expires_at is smaller than now
					this.writeLog(`[Adapter v.${this.version} onReady] access_token expired`, 'debug');
					await this.getAccessToken();
					this.setState('info.connection', true, true);
				} else {
					this.writeLog(`[Adapter v.${this.version} onReady] access_token valid`, 'debug');
					this.allData.userInfo.user_id = this.config.user_id;
					this.allData.userInfo.expires_at = this.config.expires_at;
					await this.createCronjob();
					// start the requestData timer
					this.writeLog(`[Adapter v.${this.version} onReady] start requestData`, 'debug');
					await this.requestData();
					this.setState('info.connection', true, true);
				}
			} else {
				// get new access token
				this.writeLog(
					`[Adapter v.${this.version} onReady] access_token not available call new access_token`,
					'debug',
				);
				await this.getAccessToken();
				this.setState('info.connection', true, true);
			}
		} else {
			this.writeLog(`[Adapter v.${this.version} onReady] email and password are required`, 'error');
		}
	}

	// create a cronjob to get new access_token wenn expires_at is reached
	private async createCronjob(): Promise<void> {
		// create the cronjob
		this.writeLog(`[Adapter v.${this.version} createCronjob] create cronjob`, 'debug');
		const expires_at = this.config.expires_at;
		console.log('expires_at: ', new Date(expires_at * 1000));
		const cronjob = new CronJob(
			new Date(expires_at * 1000),
			async () => {
				this.writeLog(`[Adapter v.${this.version} createCronjob] get new access_token`, 'debug');
				console.log(`[Adapter v.${this.version} createCronjob] get new access_token`);
				await this.getAccessToken();
			},
			null,
			true,
			'Europe/Berlin',
		);
		console.log('cronjob: ', cronjob);
	}

	private async requestData(): Promise<void> {
		// Request data from all Key Lights every 5 minutes
		if (this.requestTimer) this.clearTimeout(this.requestTimer);
		await this.getTrackers();
		await this.getTrackerInfo();
		await this.getTrackerDeviceHwReport();
		await this.getTrackerLocation();
		// await this.getTrackerPosition('1674226858', '1674313258');
		await this.createStates();
		await this.writeAllData();
		console.log('all data', this.allData);
		this.requestTimer = this.setTimeout(() => {
			this.writeLog(`[Adapter v.${this.version} requestData] next request in ${this.interval} ms`, 'debug');
			this.requestData();
		}, this.interval);
	}

	// write all data in the state
	private async writeAllData(): Promise<void> {
		for (const device of this.allData.trackers) {
			for (const [key, value] of Object.entries(device)) {
				await this.setStateAsync(`${device._id}.trackers.${key}`, { val: value, ack: true });
			}
		}
		for (const device of this.allData.tracker) {
			for (const [key, value] of Object.entries(device)) {
				// if key is capabilities and supported_geofence_types then write the data with JSON.stringify
				if (typeof value === 'object' && value !== null) {
					await this.setStateAsync(`${device._id}.tracker.${key}`, {
						val: JSON.stringify(value),
						ack: true,
					});
				} else {
					await this.setStateAsync(`${device._id}.tracker.${key}`, { val: value, ack: true });
				}
			}
		}
		for (const device of this.allData.device_hw_report) {
			for (const [key, value] of Object.entries(device)) {
				if (typeof value === 'object' && value !== null) {
					await this.setStateAsync(`${device._id}.device_hw_report.${key}`, {
						val: JSON.stringify(value),
						ack: true,
					});
				} else {
					await this.setStateAsync(`${device._id}.device_hw_report.${key}`, { val: value, ack: true });
				}
			}
		}
		for (const device of this.allData.device_pos_report) {
			for (const [key, value] of Object.entries(device)) {
				// if key is latlong then write the data with JSON.stringify and split in latitude,longitude
				if (key === 'latlong') {
					await this.setStateAsync(`${device._id}.device_pos_report.${key}`, {
						val: JSON.stringify(value),
						ack: true,
					});
					await this.setStateAsync(`${device._id}.device_pos_report.latitude`, {
						val: value[0],
						ack: true,
					});
					await this.setStateAsync(`${device._id}.device_pos_report.longitude`, {
						val: value[1],
						ack: true,
					});
				} else {
					if (typeof value === 'object' && value !== null) {
						await this.setStateAsync(`${device._id}.device_pos_report.${key}`, {
							val: JSON.stringify(value),
							ack: true,
						});
					} else {
						await this.setStateAsync(`${device._id}.device_pos_report.${key}`, { val: value, ack: true });
					}
				}
			}

			if (this.allData.positions.length !== 0) {
				for (const positionsDevice of this.allData.positions) {
					for (const [key, value] of Object.entries(positionsDevice)) {
						await this.setStateAsync(`${device._id}.positions.${key}`, {
							val: JSON.stringify(value),
							ack: true,
						});
					}
				}
			} else {
				// check if the object positions already exists
				const obj = await this.getObjectAsync(`${device._id}.positions.0`);
				if (obj) {
					await this.setStateAsync(`${device._id}.positions.0`, {
						val: JSON.stringify([]),
						ack: true,
					});
				}
			}
		}
		await this.setStateAsync('json', JSON.stringify(this.allData), true);
	}

	/**
	 * create the all states for the adapter
	 */
	private async createStates(): Promise<void> {
		// create the device channel for all devices in the this.allData.trackers array
		for (const device of this.allData.trackers) {
			// console.log('device', device);
			// create the device channel
			await this.extendObjectAsync(device._id, {
				type: 'device',
				common: {
					name: device._id,
				},
				native: {},
			});

			// create the channel for the device
			await this.extendObjectAsync(`${device._id}.trackers`, {
				type: 'channel',
				common: {
					name: 'trackers',
				},
				native: {},
			});

			// create the states
			for (const [key] of Object.entries(device)) {
				const common: ioBroker.StateCommon = stateAttrb[key as keyof typeof stateAttrb];
				// console.log('common', device);
				if (common) {
					await this.extendObjectAsync(`${device._id}.trackers.${key}`, {
						type: 'state',
						common: common,
						native: {},
					});
				} else {
					this.writeLog(
						`[Adapter v.${this.version} createStates] no state attribute found for ${key}`,
						'warn',
					);
				}
			}

			// end of the for loop this.allData.trackers
		}
		// create the device channel for all devices in the this.allData.tracker array
		for (const device of this.allData.tracker) {
			// console.log('device', device);
			// create the channel for the device
			await this.extendObjectAsync(`${device._id}.tracker`, {
				type: 'channel',
				common: {
					name: 'tracker',
				},
				native: {},
			});
			// create the states
			for (const [key] of Object.entries(device)) {
				const common: ioBroker.StateCommon = stateAttrb[key as keyof typeof stateAttrb];
				// console.log('common', device);
				if (common) {
					await this.extendObjectAsync(`${device._id}.tracker.${key}`, {
						type: 'state',
						common: common,
						native: {},
					});
				} else {
					this.writeLog(
						`[Adapter v.${this.version} createStates] no state attribute found for ${key} in tracker`,
						'warn',
					);
				}
			}

			// end of the for loop this.allData.tracker
		}
		// create the device channel for all devices in the this.allData.device_hw_report array
		for (const device of this.allData.device_hw_report) {
			// console.log('device', device);
			// create the channel for the device
			await this.extendObjectAsync(`${device._id}.device_hw_report`, {
				type: 'channel',
				common: {
					name: 'device hardware report',
				},
				native: {},
			});
			// create the states
			for (const [key] of Object.entries(device)) {
				const common: ioBroker.StateCommon = stateAttrb[key as keyof typeof stateAttrb];
				// console.log('common', device);
				if (common) {
					await this.extendObjectAsync(`${device._id}.device_hw_report.${key}`, {
						type: 'state',
						common: common,
						native: {},
					});
				} else {
					this.writeLog(
						`[Adapter v.${this.version} createStates] no state attribute found for ${key} in device_hw_report`,
						'warn',
					);
				}
			}

			// end of the for loop this.allData.device_hw_report
		}
		// create the device channel for all devices in the this.allData.device_pos_report array
		for (const device of this.allData.device_pos_report) {
			// console.log('device', device);
			// create the channel for the device
			await this.extendObjectAsync(`${device._id}.device_pos_report`, {
				type: 'channel',
				common: {
					name: 'device position report',
				},
				native: {},
			});
			// create the states
			for (const [key] of Object.entries(device)) {
				const common: ioBroker.StateCommon = stateAttrb[key as keyof typeof stateAttrb];
				// console.log('common', device);
				if (common) {
					if (key === 'latlong') {
						await this.extendObjectAsync(`${device._id}.device_pos_report.${key}`, {
							type: 'state',
							common: common,
							native: {},
						});
						await this.extendObjectAsync(`${device._id}.device_pos_report.latitude`, {
							type: 'state',
							common: stateAttrb['latitude'],
							native: {},
						});
						await this.extendObjectAsync(`${device._id}.device_pos_report.longitude`, {
							type: 'state',
							common: stateAttrb['longitude'],
							native: {},
						});
					} else {
						await this.extendObjectAsync(`${device._id}.device_pos_report.${key}`, {
							type: 'state',
							common: common,
							native: {},
						});
					}
				} else {
					this.writeLog(
						`[Adapter v.${this.version} createStates] no state attribute found for ${key} in device_pos_report`,
						'warn',
					);
				}
			}

			// create the device channel for all devices in the this.allData.positions array
			for (const positionsDevice of this.allData.positions) {
				// console.log('device', device);
				// create the channel for the device
				await this.extendObjectAsync(`${device._id}.positions`, {
					type: 'channel',
					common: {
						name: 'positions',
					},
					native: {},
				});
				// // create the states
				for (const [key] of Object.entries(positionsDevice)) {
					const common: ioBroker.StateCommon = stateAttrb['positions'];
					// console.log('common', device);
					if (common) {
						await this.extendObjectAsync(`${device._id}.positions.${key}`, {
							type: 'state',
							common: common,
							native: {},
						});
					} else {
						this.writeLog(
							`[Adapter v.${this.version} createStates] no state attribute found for ${key} in positions`,
							'warn',
						);
					}
				}

				// end of the for loop this.allData.device_pos_report
			}

			// end of the for loop this.allData.positions
		}
		await this.extendObjectAsync(`json`, {
			type: 'state',
			common: {
				name: 'json',
				desc: 'all data from the api as json',
				type: 'string',
				role: 'json',
				read: true,
				write: false,
			},
			native: {},
		});
	}

	/**
	 * @description a function for log output
	 */
	private writeLog(logText: string, logType: 'silly' | 'info' | 'debug' | 'warn' | 'error'): void {
		if (logType === 'silly') this.log.silly(logText);
		if (logType === 'info') this.log.info(logText);
		if (logType === 'debug') this.log.debug(logText);
		if (logType === 'warn') this.log.warn(logText);
		if (logType === 'error') this.log.error(logText);
	}

	/**
	 * Is called if a subscribed state changes
	 */
	private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
		if (state) {
			if (state.from === 'system.adapter.' + this.namespace) {
				// ignore the state change from the adapter itself
				return;
			} else {
				this.writeLog(
					`[Adapter v.${this.version} onStateChange] state ${id} changed: ${state.val} (ack = ${state.ack})`,
					'debug',
				);
			}
		} else {
			return;
		}
	}

	/**
	 * call all trackers from the user
	 * https://graph.tractive.com/3/user/${this.user_id}/trackers
	 */
	private async getTrackers(): Promise<void> {
		// Request data from api
		const url = `https://graph.tractive.com/3/user/${this.allData.userInfo.user_id}/trackers`;
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-tractive-client': this.client_id,
				'x-tractive-user': this.allData.userInfo.user_id,
				Authorization: `Bearer ${this.decrypt(this.config.access_token)}`,
			},
		};
		try {
			const response = await axios(url, options);
			if (response.status === 200) {
				this.writeLog(
					`[Adapter v.${this.version} Axios V: ${axios.VERSION} getTrackers] response: ${JSON.stringify(
						response.data,
					)}`,
					'debug',
				);
				if (response.data) {
					this.allData.trackers = response.data;
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackers] trackers: ${JSON.stringify(
							this.allData.trackers,
						)}`,
						'debug',
					);
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackers] trackers: ${JSON.stringify(
							this.allData.trackers,
						)}`,
						'debug',
					);
				} else {
					this.writeLog(`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackers] no data`, 'warn');
				}
			} else {
				this.writeLog(
					`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackers] error: ${response.status}`,
					'error',
				);
				if (response.data) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackers] response: ${JSON.stringify(
							response.data,
						)}`,
						'error',
					);
				}
			}
		} catch (error) {
			this.writeLog(
				`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackers] error: ${error}`,
				'error',
			);
		}
	}

	/**
	 * call all tracker information
	 * https://graph.tractive.com/3/tracker/${tracker._id}
	 */
	private async getTrackerInfo(): Promise<void> {
		this.allData.tracker = [];
		// gehe alle tracker durch und hole die informationen
		for (const tracker of this.allData.trackers) {
			const url = `https://graph.tractive.com/3/tracker/${tracker._id}`;
			const options = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-tractive-client': this.client_id,
					'x-tractive-user': this.allData.userInfo.user_id,
					Authorization: `Bearer ${this.decrypt(this.config.access_token)}`,
				},
			};
			try {
				const response = await axios(url, options);
				if (response.status === 200) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${
							axios.VERSION
						}  getTrackerInfo] response: ${JSON.stringify(response.data)}`,
						'debug',
					);
					if (response.data) {
						this.allData.tracker.push(response.data);
						// this.tracker.push(response.data);
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${
								axios.VERSION
							}  getTrackerInfo] tracker: ${JSON.stringify(this.allData.tracker)}`,
							'debug',
						);
						// console.log('tracker Info', this.allData.tracker);
					} else {
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerInfo] no data`,
							'warn',
						);
					}
				}
			} catch (error) {
				this.writeLog(
					`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerInfo] error: ${error}`,
					'error',
				);
			}
		}
	}

	/**
	 * call all tracker device_hw_report
	 * https://graph.tractive.com/3/device_hw_report/${tracker._id}
	 */
	private async getTrackerDeviceHwReport(): Promise<void> {
		this.allData.device_hw_report = [];
		// gehe alle tracker durch und hole die informationen
		for (const tracker of this.allData.trackers) {
			const url = `https://graph.tractive.com/3/device_hw_report/${tracker._id}`;
			const options = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-tractive-client': this.client_id,
					'x-tractive-user': this.allData.userInfo.user_id,
					Authorization: `Bearer ${this.decrypt(this.config.access_token)}`,
				},
			};
			try {
				const response = await axios(url, options);
				if (response.status === 200) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${
							axios.VERSION
						}  getTrackerDeviceHwReport] response: ${JSON.stringify(response.data)}`,
						'debug',
					);
					if (response.data) {
						this.allData.device_hw_report.push(response.data);
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${
								axios.VERSION
							}  getTrackerDeviceHwReport] trackerDeviceHwReport: ${JSON.stringify(
								this.allData.device_hw_report,
							)}`,
							'debug',
						);
						// console.log('tracker DeviceHwReport', this.allData.device_hw_report);
					} else {
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerDeviceHwReport] no data`,
							'warn',
						);
					}
				}
			} catch (error) {
				if (error.response && error.response.data.code === 4002) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${
							axios.VERSION
						}  getTrackerDeviceHwReport] warn: ${JSON.stringify(
							error.response.data.message,
						)} - the tracker does not yet contain any data`,
						'warn',
					);
				} else {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerDeviceHwReport] error: ${error}`,
						'error',
					);
				}
			}
		}
	}

	/**
	 * call all tracker location
	 * https://graph.tractive.com/3/device_pos_report/${tracker._id}
	 */
	private async getTrackerLocation(): Promise<void> {
		this.allData.device_pos_report = [];
		// gehe alle tracker durch und hole die informationen
		for (const tracker of this.allData.trackers) {
			const url = `https://graph.tractive.com/3/device_pos_report/${tracker._id}`;
			const options = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-tractive-client': this.client_id,
					'x-tractive-user': this.allData.userInfo.user_id,
					Authorization: `Bearer ${this.decrypt(this.config.access_token)}`,
				},
			};
			try {
				const response = await axios(url, options);
				if (response.status === 200) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${
							axios.VERSION
						}  getTrackerLocation] response: ${JSON.stringify(response.data)}`,
						'debug',
					);
					if (response.data) {
						this.allData.device_pos_report.push(response.data);
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${
								axios.VERSION
							}  getTrackerLocation] trackerLocation: ${JSON.stringify(this.allData.device_pos_report)}`,
							'debug',
						);
						// console.log('tracker Location', this.allData.device_pos_report);
					} else {
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerLocation] no data`,
							'warn',
						);
					}
				}
			} catch (error) {
				if (error.response && error.response.data.code === 4002) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${
							axios.VERSION
						}  getTrackerLocation] warn: ${JSON.stringify(
							error.response.data.message,
						)} - the tracker does not yet contain any data`,
						'warn',
					);
				} else {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerLocation] error: ${error}`,
						'error',
					);
				}
			}
		}
	}

	/**
	 * call all tracker position
	 * https://graph.tractive.com/3/tracker/CDSOLIJE/positions?time_from=${time_from}&time_to=${time_to}&format=json_segments
	 * time_from = 1.1.2023 00:00:00 in seconds
	 * time_to = 1.1.2023 23:59:59 in seconds
	 * format = json_segments
	 */
	private async getTrackerPosition(time_from: string, time_to: string): Promise<void> {
		this.allData.positions = [];
		// gehe alle tracker durch und hole die informationen
		for (const tracker of this.allData.trackers) {
			const url = `https://graph.tractive.com/3/tracker/${tracker._id}/positions?time_from=${time_from}&time_to=${time_to}&format=json_segments`;
			const options = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-tractive-client': this.client_id,
					'x-tractive-user': this.allData.userInfo.user_id,
					Authorization: `Bearer ${this.decrypt(this.config.access_token)}`,
				},
			};
			try {
				const response = await axios(url, options);
				if (response.status === 200) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${
							axios.VERSION
						}  getTrackerPosition] response: ${JSON.stringify(response.data)}`,
						'debug',
					);
					if (response.data) {
						this.allData.positions.push(response.data);
						const testdata: {
							[key: string]: any;
						} = {};
						testdata[tracker._id] = response.data;
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${
								axios.VERSION
							}  getTrackerPosition] trackerPosition: ${JSON.stringify(this.allData.positions)}`,
							'debug',
						);
						// console.log('tracker Position', this.allData.positions);
					} else {
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerPosition] no data`,
							'warn',
						);
					}
				}
			} catch (error) {
				this.writeLog(
					`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getTrackerPosition] error: ${error}`,
					'error',
				);
			}
		}
	}
	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private async onUnload(callback: () => void): Promise<void> {
		try {
			this.writeLog(`[Adapter v.${this.version} onUnload] Adapter stopped`, 'debug');
			// Here you must clear all timeouts or intervals that may still be active
			if (this.requestTimer) this.clearTimeout(this.requestTimer);
			this.setState('info.connection', false, true);

			callback();
		} catch (e) {
			callback();
		}
	}

	private async getAccessToken() {
		console.log('getAccessToken');
		// get the access token
		const url = 'https://graph.tractive.com/3/auth/token';
		console.log('url', url);
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-tractive-client': this.client_id,
			},
			data: {
				platform_email: this.config.email,
				platform_token: this.decrypt(this.config.password),
				grant_type: 'tractive',
			},
		};
		try {
			const response = await axios(url, options);
			console.log('response', response);
			if (response.status === 200) {
				this.writeLog(
					`[Adapter v.${this.version} Axios V: ${axios.VERSION}  getAccessToken] response: ${JSON.stringify(
						response.data,
					)}`,
					'debug',
				);
				if (response.data) {
					const obj = await this.getForeignObjectAsync(`system.adapter.${this.namespace}`);
					if (obj) {
						// write the data into the config
						obj.native.access_token = this.encrypt(response.data.access_token);
						obj.native.user_id = response.data.user_id;
						obj.native.expires_at = response.data.expires_at;
						this.allData.userInfo.user_id = response.data.user_id;
						this.allData.userInfo.expires_at = response.data.expires_at;
						this.writeLog(
							`[Adapter v.${this.version} Axios V: ${
								axios.VERSION
							}  getAccessToken] obj: ${JSON.stringify(obj)}`,
							'debug',
						);
						await this.setForeignObjectAsync(`system.adapter.${this.namespace}`, obj);
						this.writeLog(
							`[Adapter v.${this.version} getAccessToken] new access_token: ${response.data.access_token}`,
							'debug',
						);
					}
				} else {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION} getAccessToken] no data`,
						'warn',
					);
				}
			} else {
				if (response.data) {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION} getAccessToken] ${response.status} ${response.statusText} ${response.data}`,
						'warn',
					);
				} else {
					this.writeLog(
						`[Adapter v.${this.version} Axios V: ${axios.VERSION} getAccessToken] ${response.status} ${response.statusText}`,
						'warn',
					);
				}
			}
		} catch (error) {
			this.writeLog(
				`[Adapter v.${this.version} Axios V: ${axios.VERSION} getAccessToken] error: ${error}`,
				'error',
			);
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TractiveGPS(options);
} else {
	// otherwise start the instance directly
	(() => new TractiveGPS())();
}
