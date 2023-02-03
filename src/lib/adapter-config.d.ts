// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			interval: number;
			email: string;
			password: string;
			access_token: string;
			expires_at: number;
			user_id: string;
			nameArray: NameArray[];
		}
		interface NameArray {
			name: string;
			id: string;
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
