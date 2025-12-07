import { Router, type Request, type Response } from 'express';
import { generators, type Client } from 'openid-client';

export class AuthController {
  public readonly router = Router();

  constructor(private readonly openIdClient: Client) {
    this.router.get('/login', this.login.bind(this));
    this.router.get('/callback', this.callback.bind(this));
    this.router.get('/logout', this.logout.bind(this));
    this.router.get('/refresh', this.refresh.bind(this));
  }

  private async login(_req: Request, res: Response) {
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    res.cookie('code_verifier', codeVerifier, { httpOnly: true });

    const authUrl = this.openIdClient.authorizationUrl({
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return res.redirect(authUrl);
  }

  private async callback(req: Request, res: Response) {
    const { code } = req.query;
    const codeVerifier = req.cookies.code_verifier;

    if (
      !code ||
      !codeVerifier ||
      typeof code !== 'string' ||
      typeof codeVerifier !== 'string'
    ) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const params = this.openIdClient.callbackParams(req);
    const tokens = await this.openIdClient.callback(
      process.env.COGNITO_REDIRECT_URI!,
      params,
      {
        code_verifier: codeVerifier,
      }
    );

    res.clearCookie('code_verifier');

    res.cookie('accessToken', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.cookie('idToken', tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
    });

    // Decode ID token to show user info (optional)
    const claims = tokens.claims();
    console.log('User authenticated:', claims.email || claims.sub);

    return res.redirect('/me');
  }

  private async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      try {
        await this.openIdClient.revoke(refreshToken);
      } catch (error) {
        console.error('Failed to revoke refresh token:', error);
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('idToken');
    res.clearCookie('refreshToken');

    // Clear the hosted UI session
    const domain = process.env.COGNITO_DOMAIN!;
    const clientId = process.env.COGNITO_CLIENT_ID!;
    const logoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      'http://localhost:8000/me'
    )}`;

    return res.redirect(logoutUrl);
  }

  private async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tokens = await this.openIdClient.refresh(refreshToken);

    res.cookie('accessToken', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.cookie('idToken', tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return res.redirect('/me');
  }
}
