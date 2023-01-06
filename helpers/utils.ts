
/**
 * Checking if the app client ID and client secret is defined
 * @returns boolean
 */
export const isShopifyAppCredentialsDefined = () => {
    return typeof process.env.SHOPIFY_CLIENT_ID === "string" && process.env.SHOPIFY_CLIENT_ID.length !== 0 && typeof process.env.SHOPIFY_CLIENT_SECRET === "string" && process.env.SHOPIFY_CLIENT_SECRET.length !== 0;
}