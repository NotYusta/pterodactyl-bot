import axios, { AxiosError, AxiosResponse } from 'axios';
import { IServersGetResponse, IUserCreateRequest, IUserCreateResponse } from '../typings/pterodactyl';

export class Pterodactyl {
    private apiKey: string;
    public panelUrl: string;

    constructor(apiKey: string, panelUrl: string) {
        this.apiKey = apiKey;
        this.panelUrl = panelUrl;
    }

    public async createUser(request: IUserCreateRequest): Promise<[IUserCreateResponse, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.post(`${this.panelUrl}/api/application/users`, request, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data, response];
        } catch (error) {
            const err = error as AxiosError;
            return err;
        }
    }

    public async getServers(): Promise<[IServersGetResponse, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.get(`${this.panelUrl}/api/application/servers`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data, response];
        } catch (error) {
            const err = error as AxiosError;
            return err;
        }
    }

    public async suspendServer(id: number): Promise<boolean> {
        try {
            const response = await axios.post(
                `${this.panelUrl}/api/application/servers/${id}/suspend`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        Accept: 'Application/vnd.pterodactyl.v1+json',
                    },
                }
            );

            return response.status === 204;
        } catch (error) {
            return false;
        }
    }
}
