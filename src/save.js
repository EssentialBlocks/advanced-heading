import { RichText, useBlockProps } from "@wordpress/block-editor";
const { EBDisplayIcon } = window.EBAdvHeadingControls;

import { isLatestDesign, sanitizeTag, sanitizeURL } from "./helpers";

/**
 * Markup of blocks saved by 1.2.0 and earlier. It must not change: those blocks
 * are only valid while this returns exactly what they saved.
 */
const LegacySave = ({ attributes }) => {
    const {
        blockId,
        preset,
        tagName,
        titleText,
        subtitleTagName,
        displaySubtitle,
        subtitleText,
        seperatorType,
        displaySeperator,
        seperatorPosition,
        separatorIcon,
        classHook,
    } = attributes;

    return (
        <div {...useBlockProps.save()}>
            <div
                className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
            >
                <div
                    className={`eb-advance-heading-wrapper ${blockId} ${preset}`}
                    data-id={blockId}
                >
                    {displaySeperator && seperatorPosition === "top" && (
                        <div className={"eb-ah-separator " + seperatorType}>
                            {seperatorType === "icon" && (
                                <EBDisplayIcon icon={separatorIcon} />
                            )}
                        </div>
                    )}
                    <RichText.Content
                        tagName={tagName}
                        className="eb-ah-title"
                        value={titleText}
                    />
                    {displaySubtitle && (
                        <RichText.Content
                            tagName={subtitleTagName}
                            className="eb-ah-subtitle"
                            value={subtitleText}
                        />
                    )}
                    {displaySeperator && seperatorPosition === "bottom" && (
                        <div className={"eb-ah-separator " + seperatorType}>
                            {seperatorType === "icon" && (
                                <EBDisplayIcon icon={separatorIcon} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * The title parts: first title, then the optional second and third titles.
 */
export const TitleParts = ({ titleText, title2Text, title3Text }) => (
    <>
        <RichText.Content
            tagName="span"
            className="first-title"
            value={titleText}
        />
        {title2Text && (
            <>
                &nbsp;
                <RichText.Content
                    tagName="span"
                    className="second-title"
                    value={title2Text}
                />
            </>
        )}
        {title3Text && (
            <>
                &nbsp;
                <RichText.Content
                    tagName="span"
                    className="third-title"
                    value={title3Text}
                />
            </>
        )}
    </>
);

const Save = ({ attributes }) => {
    if (!isLatestDesign(attributes)) {
        // Called directly, not as <LegacySave />, so useBlockProps.save() runs while
        // this block is the one being serialized.
        return LegacySave({ attributes });
    }

    const {
        blockId,
        preset,
        effects,
        tagName,
        titleText,
        title2Text,
        title3Text,
        subtitleTagName,
        displaySubtitle,
        subtitleText,
        seperatorType,
        displaySeperator,
        seperatorPosition,
        separatorIcon,
        classHook,
        source,
        enableLink,
        titleLink,
        openInNewTab,
    } = attributes;

    // The post title is rendered on the server (see advanced-heading.php).
    if (source === "dynamic-title") {
        return null;
    }

    const TagName = sanitizeTag(tagName, "h2");
    const hasLink = enableLink && typeof titleLink === "string" && titleLink.length > 0;
    const wrapperClasses = ["eb-advance-heading-wrapper", blockId, preset, effects]
        .filter(Boolean)
        .join(" ");
    const parentClasses = ["eb-parent-wrapper", `eb-parent-${blockId}`, classHook]
        .filter(Boolean)
        .join(" ");

    const separator = (
        <div className={"eb-ah-separator " + seperatorType}>
            {seperatorType === "icon" && <EBDisplayIcon icon={separatorIcon} />}
        </div>
    );

    const parts = (
        <TitleParts
            titleText={titleText}
            title2Text={title2Text}
            title3Text={title3Text}
        />
    );

    return (
        <div {...useBlockProps.save()}>
            <div className={parentClasses}>
                <div className={wrapperClasses} data-id={blockId}>
                    {displaySeperator && seperatorPosition === "top" && separator}
                    <TagName className="eb-ah-title">
                        {hasLink ? (
                            <a
                                className="eb-ah-link"
                                href={sanitizeURL(titleLink)}
                                target={openInNewTab ? "_blank" : undefined}
                                rel={openInNewTab ? "noopener" : undefined}
                            >
                                {parts}
                            </a>
                        ) : (
                            parts
                        )}
                    </TagName>
                    {displaySubtitle && (
                        <RichText.Content
                            tagName={sanitizeTag(subtitleTagName, "p")}
                            className="eb-ah-subtitle"
                            value={subtitleText}
                        />
                    )}
                    {displaySeperator && seperatorPosition === "bottom" && separator}
                </div>
            </div>
        </div>
    );
};

export default Save;
