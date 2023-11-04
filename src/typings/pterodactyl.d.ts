export interface IServer {
    object: string;
    attributes: {
        id: number;
        external_id: string;
        uuid: string;
        identifier: string;
        name: string;
        description: string;
        suspended: boolean;
        limits: {
            memory: number;
            swap: number;
            disk: number;
            io: number;
            cpu: number;
        };
        feature_limits: {
            databases: number;
            allocations: number;
            backups: number;
        };
        user: number;
        node: number;
        allocation: number;
        nest: number;
        egg: number;
        pack: null;
        container: {
            startup_command: string;
            image: string;
            installed: boolean;
            environment: {
                [key: string]: string;
            };
        };
        updated_at: string;
        created_at: string;
    };
    meta: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
        };
    };
}

export interface IUserCreateRequest {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password?: string;
    root_admin?: boolean;
}

export interface IUserCreateResponse {
    object: string;
    attributes: {
        id: number;
        external_id: string;
        uuid: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        language: string;
        root_admin: boolean;
        '2fa': boolean;
        created_at: string;
        updated_at: string;
    };
}

export interface IServersGetResponse {
    object: string;
    data: IServer[];
}

export interface IServersCreateRequest {
    name: string;
    user: number;
    egg: number;
    node: number;
    description: string;
    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
    };
    feature_limits: {
        databases: number;
        allocations: number;
        backups: number;
    };
    allocations: {
        default: number;
    };
}
