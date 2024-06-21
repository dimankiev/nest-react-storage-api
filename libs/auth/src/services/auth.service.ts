import {Inject, Injectable, Scope} from '@nestjs/common';
import {LoginTicket, OAuth2Client} from "google-auth-library";
import {AuthSessionService} from "./auth-session.service";

@Injectable({ scope: Scope.DEFAULT })
export class AuthService {
    private readonly googleOauth2Client: OAuth2Client;

    constructor(
        @Inject(AuthSessionService) private readonly sessionSvc: AuthSessionService,
        ) {
        this.googleOauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );
    }

    /**
     * Authorize a user with Google OAuth2 token
     * @param token - Google OAuth2 token
     * @param publicKey - user's public key
     * @returns signed JWT token
     */
    public async authorizeWithGoogle(token: string, publicKey: string): Promise<unknown> {
        const ticket: LoginTicket =
            await this.googleOauth2Client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

        const attributes = ticket.getAttributes();
        const userId = ticket.getUserId();

        // create a new session
        // TODO: use attributes.payload.exp to calculate session TTL

        const session = await this.sessionSvc.createSession();

        // create a JWT token
        const jwtToken = this.sessionSvc.createJwt(session, userId, publicKey);

        return {
            success: true,
            user: {
                sid: session.id,
                name: attributes.payload.name,
                email: attributes.payload.email,
            },
            token: jwtToken
        }
    }
}
