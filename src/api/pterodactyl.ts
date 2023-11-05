import axios, { AxiosError, AxiosResponse } from 'axios';
import {
    IAllocationsGetResponse,
    IEgg,
    INestsGetResponse,
    INodesGetResponse,
    IServer,
    IServerCreateRequest,
    IServersGetResponse,
    IUserCreateRequest,
    IUser,
} from '../typings/pterodactyl';

export class PterodactylClient {
    private apiKey: string;
    public panelUrl: string;

    constructor(apiKey: string, panelUrl: string) {
        this.apiKey = apiKey;
        this.panelUrl = panelUrl;
    }

    public async createUser(request: IUserCreateRequest): Promise<[IUser, AxiosResponse] | AxiosError> {
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
            return error as AxiosError;
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
            return error as AxiosError;
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

    public async getAllocations(
        node: number,
        server?: number
    ): Promise<[IAllocationsGetResponse, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.get(
                `${this.panelUrl}/api/application/nodes/${node}/allocations${server ? `?server=${server}` : ''}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        Accept: 'Application/vnd.pterodactyl.v1+json',
                    },
                }
            );

            return [response.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }

    public async getNodes(): Promise<[INodesGetResponse, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.get(`${this.panelUrl}/api/application/nodes`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }

    public async getNests(): Promise<[INestsGetResponse, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.get(`${this.panelUrl}/api/application/nests`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }

    public async getEgg(nestId: number, id: number): Promise<[IEgg, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.get(`${this.panelUrl}/api/application/nests/${nestId}/eggs/${id}?include=nest,variables`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }

    public async getEggs(nestId: number): Promise<[IEgg[], AxiosResponse] | AxiosError> {
        try {
            const response = await axios.get(`${this.panelUrl}/api/application/nests/${nestId}/eggs?include=nest,variables`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }

    public async getUsers(email?: string): Promise<[IUser[], AxiosResponse] | AxiosError> {
        try {
            let url = `${this.panelUrl}/api/application/users`;
            if (email) {
                url += `?filter[email]=${email}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }

    public async createServer(request: IServerCreateRequest): Promise<[IServer, AxiosResponse] | AxiosError> {
        try {
            const response = await axios.post(`${this.panelUrl}/api/application/servers`, request, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            return [response.data, response];
        } catch (error) {
            return error as AxiosError;
        }
    }
}
