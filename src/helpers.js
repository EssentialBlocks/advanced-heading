import { ALLOWED_TAGS } from "./constants/constants";

/**
 * Design generation given to blocks inserted from 1.3.0 on.
 *
 * See the `designVersion` attribute: the title markup (first / second / third
 * title spans, heading link, effects, dynamic title) and every style that relies
 * on it are only used when this returns true. Blocks saved by 1.2.0 or earlier
 * keep their markup and generated CSS, even after a re-save, until the author
 * turns on "Use latest design" in the Advanced tab.
 */
export const LATEST_DESIGN_VERSION = 2;

export const isLatestDesign = (attributes) =>
    Number(attributes?.designVersion || 0) >= LATEST_DESIGN_VERSION;

/**
 * Build one CSS rule, or nothing.
 *
 * The style generators return whitespace for an unset control, so emitting a
 * rule unconditionally would add empty selectors to every block's stored CSS.
 * A rule is only written when at least one declaration has a value.
 *
 * @param {string}   selector     CSS selector list.
 * @param {string[]} declarations Declaration strings.
 * @param {string}   transition   Optional transition value.
 * @return {string} The rule, or an empty string.
 */
export const cssRule = (selector, declarations, transition = "") => {
    const body = declarations
        .filter((part) => typeof part === "string" && part.trim() !== "")
        .join("\n");

    if (body.trim() === "") {
        return "";
    }

    return `${selector}{
        ${body}
        ${transition ? `transition: ${transition};` : ""}
    }`;
};

export const isGradientColor = (color) =>
    typeof color === "string" && color.includes("gradient");

/**
 * Text colour declarations. A gradient is painted through the text.
 */
export const getTextColorCss = (color) => {
    if (typeof color !== "string" || color === "") {
        return "";
    }
    if (isGradientColor(color)) {
        return `background: ${color};
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;`;
    }
    return `color: ${color};`;
};

/**
 * Border colour declarations. A gradient becomes a border image.
 */
export const getBorderColorCss = (color) => {
    if (typeof color !== "string" || color === "") {
        return "";
    }
    if (isGradientColor(color)) {
        return `border-image-slice: 1;
            border-image-source: ${color};`;
    }
    return `border-color: ${color};`;
};

/**
 * Background declaration for a title part. Only a solid colour is used: a
 * gradient text colour already paints the background.
 */
export const getBackgroundCss = (background, textColor) =>
    typeof background === "string" && background !== "" && !isGradientColor(textColor)
        ? `background: ${background};`
        : "";

const ALLOWED_PROTOCOLS = [
    "http:",
    "https:",
    "ftp:",
    "ftps:",
    "mailto:",
    "news:",
    "irc:",
    "irc6:",
    "ircs:",
    "gopher:",
    "nntp:",
    "feed:",
    "telnet:",
    "mms:",
    "rtsp:",
    "sms:",
    "svn:",
    "tel:",
    "fax:",
    "xmpp:",
    "webcal:",
    "urn:",
];

/**
 * Return a URL that is safe to put in an href, or "#".
 *
 * Relative paths and fragments are kept. Absolute URLs must parse and use one of
 * the protocols WordPress allows (so `javascript:` and `data:` are rejected).
 * This runs inside save(), so it must stay deterministic.
 */
export const sanitizeURL = (url) => {
    if (typeof url !== "string" || url.trim() === "") {
        return "#";
    }
    const value = url.trim();
    if (value.startsWith("#") || value.startsWith("/")) {
        return value;
    }
    try {
        const urlObject = new URL(value);
        if (!ALLOWED_PROTOCOLS.includes(urlObject.protocol)) {
            return "#";
        }
        return urlObject.toString();
    } catch (error) {
        return "#";
    }
};

export const sanitizeTag = (tag, fallback) =>
    ALLOWED_TAGS.includes(tag) ? tag : fallback;
