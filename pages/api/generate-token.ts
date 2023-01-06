// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { AxiosError } from "axios";
import { parse, serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next'
import { exposeHandler, getMethodHandlers } from '../../helpers/apiHandler'
import ICredentials from '../../interfaces/ICredentials';
import { isShopifyAppCredentialsDefined } from '../../helpers/utils';

interface AccessTokenResponse {
  access_token: string;
  scope: string;
  session: string;
  expires_in: number;
  associated_user_scope: string;
  associated_user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    account_owner: boolean;
    locale: string;
    collaborator: boolean;
  };
}


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return exposeHandler(req, res, getMethodHandlers({
    GET: async (req, res) => {
      // load cookie
      const cookies = parse(req.headers['cookie'] ?? '');

      // credentials cookie
      const credentialsCookieStr = cookies[process.env.CREDENTIALS_COOKIE_NAME!];
      
      // initiated
      if (credentialsCookieStr) {
        try {
          // get credentials
          const credentials: Required<ICredentials> = JSON.parse(credentialsCookieStr);

          // shop domain
          const shopDomain = `${credentials.config.shop}.${process.env.NEXT_PUBLIC_SHOPIFY_APP_DOMAIN}`;

          // get access token
          const response = await axios.post(`https://${shopDomain}/admin/oauth/access_token?client_id=${isShopifyAppCredentialsDefined() ? process.env.SHOPIFY_CLIENT_ID : credentials.client_id}&client_secret=${isShopifyAppCredentialsDefined() ? process.env.SHOPIFY_CLIENT_SECRET : credentials.client_secret}&code=${req.query.code}`, {}, {
            headers: {
              "Accept": "application/json"
            }
          });

          // get the authentication token    
          const token: AccessTokenResponse = response.data;
          
          const expirationDate = new Date(Date.now() + token.expires_in * 1000);

          const redirectUrl = `${credentials.config.redirect_uri}/?${credentials.config.embedded ? 'embedded=1&' : ''}shop=${shopDomain}&host=${credentials.config.host}&session=${token.session}`;

          return res.setHeader('Set-Cookie', serialize(process.env.CREDENTIALS_COOKIE_NAME!, JSON.stringify({
            ...credentials,
            authenticatedUrl: redirectUrl,
            config: {
              ...credentials.config,
              session: token.session,
              locale: token.associated_user.locale
            }
          }), {
            expires: expirationDate,
            path: '/'
          })).redirect(redirectUrl);

        } catch (error) {
          if (axios.isAxiosError(error)) {
            return res.status(500).json((error as AxiosError).response?.data);
          } else {
            return res.status(500).json(error);
          }
        }
      } else {
        return res.status(403).json({ message: 'Required cookie missing.' })
      }
    }
  }))
}
