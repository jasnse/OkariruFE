export interface AppEnvirontment {
    production: boolean;
    baseUrl: string;
    auth0config: {
        domainUrl: string
        clientId: string
        secret: string
    }
}