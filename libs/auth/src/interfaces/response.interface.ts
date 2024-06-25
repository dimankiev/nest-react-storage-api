export interface IAuthResponse {
    user?: IAuthUser;
    token: string;
}

export interface IAuthUser {
    name?: string;
    email?: string;
}