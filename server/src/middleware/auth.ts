import type { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';

declare global {
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}

const JWKS = createRemoteJWKSet(
  new URL(
    `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
  )
);

export async function authenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const idToken = req.cookies.idToken;
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      audience: process.env.COGNITO_CLIENT_ID!,
    });

    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
