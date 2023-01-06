import { getRandomValues, randomBytes } from "crypto";

export function nonce(): string {
    const length = 15;

    // eslint-disable-next-line no-warning-comments
    // TODO Remove the randomBytes call when dropping Node 14 support
    const bytes = getRandomValues
        ? getRandomValues(new Uint8Array(length))
        : randomBytes(length);

    const nonce = bytes
        .map((byte: number) => {
            return byte % 10;
        })
        .join('');

    return nonce;
}