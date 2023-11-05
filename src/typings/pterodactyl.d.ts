export interface IEggVariable {
    object: string;
    attributes: {
        id: number;
        egg_id: number;
        name: string;
        description: string;
        env_variable: string;
        default_value: string;
        user_viewable: boolean;
        user_editable: boolean;
        rules: string;
        created_at: string;
        updated_at: string;
    };
}
export interface IUser {
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
export interface IEgg {
    object: string;
    attributes: {
        id: number;
        uuid: string;
        nest: number;
        author: string;
        name: string;
        description: string;
        docker_image: string;
        startup: string;
        created_at: string;
        updated_at: string;
        relationships: {
            nest: INest;
            variables: {
                object: string;
                data: IEggVariable[];
            };
        };
    };
}

export interface INest {
    object: string;
    attributes: {
        id: number;
        uuid: string;
        name: string;
        description: string;
    };
}

export interface IServer {
    object: string;
    attributes: {
        id: number;
        external_id: string;
        uuid: string;
        identifier: string;
        name: string;
        description: string;
        is_suspended: boolean;
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

export interface IAllocation {
    object: string;
    attributes: {
        id: number;
        ip: string;
        alias: string;
        port: number;
        notes?: string;
        assigned: boolean;
    };
}

export interface INode {
    object: string;
    attributes: {
        id: number;
        public: boolean;
        name: string;
        description: string;
        location_id: number;
        fqdn: string;
        scheme: string;
        behind_proxy: boolean;
        maintenance_mode: boolean;
        memory: {
            total: number;
            used: number;
        };
        memory_overallocate: number;
        disk: {
            total: number;
            used: number;
        };
        disk_overallocate: number;
        upload_size: number;
        daemon_listen_port: number;
        daemon_sftp_port: number;
        daemon_base: string;
        created_at: string;
        updated_at: string;
        allocated_resources: {
            memory: number;
            disk: number;
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

export interface IServersGetResponse {
    object: string;
    data: IServer[];
}

export interface IServerCreateRequest {
    name: string;
    user: number;
    egg: number;
    description?: string;
    docker_image: string;
    startup: string;
    environment: {
        [key: string]: string;
    };
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
    allocation: {
        default: number;
    };
}

export interface IAllocationsGetResponse {
    object: string;
    data: IAllocation[];
}

export interface INodesGetResponse {
    object: string;
    data: INode[];
}

export interface INestsGetResponse {
    object: string;
    data: INest[];
}
