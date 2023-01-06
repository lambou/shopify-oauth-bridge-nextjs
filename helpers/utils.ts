
/**
 * Checking if the app client ID and client secret is defined
 * @returns boolean
 */
export const isShopifyAppCredentialsDefined = () => {
    return process.env.SHOPIFY_CLIENT_ID?.length !== 0 && process.env.SHOPIFY_CLIENT_SECRET?.length !== 0;
}