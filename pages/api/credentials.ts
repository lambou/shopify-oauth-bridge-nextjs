// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { parse, serialize } from 'cookie'
import Joi from 'joi';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Buffer } from 'buffer';
import { exposeHandler, getMethodHandlers } from '../../helpers/apiHandler'
import ICredentials, { ICredentialsConfig } from '../../interfaces/ICredentials';
import { nonce } from '../../helpers/oauth';
import { isShopifyAppCredentialsDefined } from '../../helpers/utils';

interface ICredentialsPayload {
    shop: string;
    client_id: string;
    client_secret: string;
    scopes: string;
    redirect_uri: string;
    embedded: boolean
}

const schema = Joi.object<ICredentialsPayload>({
    shop: Joi.string().pattern(new RegExp('^[a-zA-Z0-9][a-zA-Z0-9\-]*')),
    client_id: Joi.string().required(),
    client_secret: Joi.string().required(),
    scopes: Joi.string().required(),
    redirect_uri: Joi.string().uri().required(),
    embedded: Joi.bool().required()
});

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    exposeHandler(req, res, getMethodHandlers({
        GET: (req, res: NextApiResponse<ICredentials>) => {

            // load cookie
            const cookies = parse(req.headers['cookie'] ?? '');

            // credentials cookie
            const credentialsCookieStr = cookies[process.env.CREDENTIALS_COOKIE_NAME!];

            // initiated
            if (credentialsCookieStr) {
                // get credentials
                const credentials: ICredentials = JSON.parse(credentialsCookieStr);

                res.status(200).json(credentials);
            } else {
                res.status(200).json({
                    initiated: false,
                    appSecrets: isShopifyAppCredentialsDefined(),
                    client_id: process.env.SHOPIFY_CLIENT_ID,
                    client_secret: process.env.SHOPIFY_CLIENT_SECRET,
                });
            }
        },
        POST: (req, res) => {

            // authorization code url
            const authorizationCodeUrl = `https://{shop}.${process.env.NEXT_PUBLIC_SHOPIFY_APP_DOMAIN}/admin/oauth/authorize?client_id={client_id}&scope={scopes}&redirect_uri={redirect_uri}&state={nonce}&grant_options[]=per-user`;

            // validate request
            const validation = schema.validate({
                client_id: process.env.SHOPIFY_CLIENT_ID,
                client_secret: process.env.SHOPIFY_CLIENT_SECRET,
                ...req.body
            });

            if (validation.error) {
                res.status(400).json(validation.error);
            } else {
                // initiate config
                const config: ICredentialsConfig = {
                    host: Buffer.from(`${validation.value.shop}.${process.env.NEXT_PUBLIC_SHOPIFY_APP_DOMAIN}`, 'ascii').toString('base64'),
                    redirect_uri: validation.value.redirect_uri,
                    scopes: validation.value.scopes,
                    shop: validation.value.shop,
                    state: nonce(),
                    embedded: validation.value.embedded
                };
                
                const credentials: ICredentials = isShopifyAppCredentialsDefined() ? {
                    initiated: true,
                    appSecrets: true,
                    config
                } : {
                    initiated: true,
                    appSecrets: false,
                    client_id: validation.value.client_id,
                    client_secret: validation.value.client_secret,
                    config
                }

                const authorizationUrl = authorizationCodeUrl
                    .replace(new RegExp('{shop}'), config.shop)
                    .replace(new RegExp('{client_id}'), validation.value.client_id)
                    .replace(new RegExp('{scopes}'), config.scopes)
                    .replace(new RegExp('{redirect_uri}'), `${req.headers['origin']}/api/generate-token`)
                    .replace(new RegExp('{nonce}'), config.state);

                res.setHeader('Set-Cookie', serialize(process.env.CREDENTIALS_COOKIE_NAME!, JSON.stringify(credentials), {
                    expires: new Date(Date.now() + (60 * 60 * 1000)),
                    path: '/'
                }));

                res.status(200).json({
                    credentials,
                    authorizationUrl
                })
            }
        }
    }))
}
