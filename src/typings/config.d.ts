interface CommandConfig {
    name: string;
    description: string;
    access: {
        roles: string[];
        users: string[];
    };
}

export interface IConfig {
    commands: {
        [key: string]: CommandConfig;
    };
}
