const getLength = Buffer.byteLength.bind(Buffer);

function isHighSurrogate(codePoint: number) {
    return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint: number) {
    return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

function truncate(str: string, byteLength: number) {
    if (typeof str !== 'string') {
        throw new Error('Input must be string');
    }

    const charLength = str.length;
    let curByteLength = 0;
    let codePoint: number;
    let segment: string;

    for (let i = 0; i < charLength; i += 1) {
        codePoint = str.charCodeAt(i);
        segment = str[i];

        if (
            isHighSurrogate(codePoint) &&
            isLowSurrogate(str.charCodeAt(i + 1))
        ) {
            i += 1;
            segment += str[i];
        }

        curByteLength += getLength(segment);

        if (curByteLength === byteLength) {
            return str.slice(0, i + 1);
        } else if (curByteLength > byteLength) {
            return str.slice(0, i - segment.length + 1);
        }
    }

    return str;
}

const illegalRe = /[\/?<>\\:*|"]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[.\s]+$/;

function sanitizeFilename(input: string, replacement: string) {
    if (typeof input !== 'string') {
        throw new Error('Input must be string');
    }
    const sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement)
        .replace(windowsTrailingRe, replacement);
    return truncate(sanitized, 255);
}

/**
 * Replaces characters and reserved names in strings that are illegal/unsafe for filenames.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insensitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 *
 * @param  {String} input   Original filename
 * @return {String}         Sanitized filename
 */
export function sanitize(input: string): string {
    return sanitizeFilename(input, '');
}
