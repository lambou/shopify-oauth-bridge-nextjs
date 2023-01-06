export interface ICredentialsConfig {
    shop: string;
    host: string;
    scopes: string;
    state: string;
    redirect_uri: string;
    session?: string;
    locale?: string;
    embedded: boolean;

}

export default interface ICredentials {
    initiated: boolean;
    appSecrets: boolean;
    client_id?: string;
    client_secret?: string;
    authenticatedUrl?: string;
    config?: ICredentialsConfig
}