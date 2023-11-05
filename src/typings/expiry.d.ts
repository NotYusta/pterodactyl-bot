export type ExpiryData = {
    id: number;
    name: string;
    userId: number;
    expiry: Date;
}

export type ExpiryDataMap = { [key: string]: ExpiryData | undefined };
