import { Issuer } from 'openid-client';

const issuerUrl = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

export const ISSUER = await Issuer.discover(issuerUrl);

export const CLIENT = new ISSUER.Client({
  client_id: process.env.COGNITO_CLIENT_ID!,
  client_secret: process.env.COGNITO_CLIENT_SECRET!,
  redirect_uris: [process.env.COGNITO_REDIRECT_URI!],
  response_types: ['code'],
});
