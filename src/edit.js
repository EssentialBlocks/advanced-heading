/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect } from "@wordpress/element";
import {
    BlockControls,
    AlignmentToolbar,
    RichText,
    useBlockProps,
} from "@wordpress/block-editor";
import { select } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";

/**
 * Internal depencencies
 */
import classnames from "classnames";

import Inspector from "./inspector";
import { LATEST_DESIGN_VERSION, isLatestDesign, sanitizeTag } from "./helpers";

/**
 * External depencencies
 */
const {
    duplicateBlockIdFix,
    DynamicInputValueHandler,
    EBDisplayIcon
} = window.EBAdvHeadingControls;

import Style from "./style";

const TEXT_FORMATS = [
    "core/bold",
    "core/italic",
    "core/link",
    "core/strikethrough",
    "core/underline",
    "core/text-color",
];

/**
 * The current post's title, for the "Dynamic Title" source.
 *
 * Inside a Query Loop the context is the loop's post, and the title is shown
 * read-only so the block does not rename other posts. In a template there is no
 * post, so a placeholder is shown.
 */
function DynamicTitle({ context }) {
    const postId = context?.postId;
    const postType = context?.postType;
    const inQueryLoop = Number.isFinite(context?.queryId);
    const [rawTitle = "", setTitle] = useEntityProp("postType", postType, "title", postId);

    if (!postId || !postType) {
        return <span className="first-title">{__("Post Title", "advanced-heading")}</span>;
    }

    if (inQueryLoop) {
        return <span className="first-title">{rawTitle}</span>;
    }

    return (
        <RichText
            tagName="span"
            className="first-title"
            value={rawTitle}
            onChange={setTitle}
            allowedFormats={[]}
            withoutInteractiveFormatting
            placeholder={__("Post Title", "advanced-heading")}
        />
    );
}

export default function Edit(props) {
    const {
        attributes,
        setAttributes,
        className,
        clientId,
        isSelected,
        context,
    } = props;
    const {
        blockId,
        preset,
        effects,
        align,
        tagName,
        titleText,
        title2Text,
        title3Text,
        subtitleTagName,
        subtitleText,
        displaySubtitle,
        displaySeperator,
        seperatorPosition,
        seperatorType,
        separatorIcon,
        classHook,
        source,
        designVersion,
    } = attributes;

    const latestDesign = isLatestDesign(attributes);

    // this useEffect is for creating a unique id for each block's unique className by a random unique number
    useEffect(() => {
        // A block without an id has never been saved, so it starts on the latest
        // design even when it was not added from the inserter (pattern, transform).
        if (!blockId && designVersion === undefined) {
            setAttributes({ designVersion: LATEST_DESIGN_VERSION });
        }
        const BLOCK_PREFIX = "eb-advance-heading";
        duplicateBlockIdFix({
            BLOCK_PREFIX,
            blockId,
            setAttributes,
            select,
            clientId,
        });
    }, []);

    const blockProps = useBlockProps({
        className: classnames(className, `eb-guten-block-main-parent-wrapper`),
    });

    const separator = (
        <div className={"eb-ah-separator " + seperatorType}>
            {seperatorType === "icon" && <EBDisplayIcon icon={separatorIcon} />}
        </div>
    );

    // Markup of blocks saved before 1.3.0 (see save.js).
    const legacyContent = (
        <div
            className={`eb-advance-heading-wrapper ${blockId} ${preset}`}
            data-id={blockId}
        >
            {displaySeperator && seperatorPosition === "top" && separator}

            <DynamicInputValueHandler
                value={titleText}
                placeholder={'Add your text here'}
                tagName={tagName}
                className="eb-ah-title"
                allowedFormats={TEXT_FORMATS}
                onChange={(titleText) =>
                    setAttributes({ titleText })
                }
                readOnly={true}
            />

            {displaySubtitle && (
                <DynamicInputValueHandler
                    tagName={subtitleTagName}
                    className="eb-ah-subtitle"
                    value={subtitleText}
                    allowedFormats={TEXT_FORMATS}
                    onChange={(subtitleText) =>
                        setAttributes({ subtitleText })
                    }
                    readOnly={true}
                />
            )}
            {displaySeperator && seperatorPosition === "bottom" && separator}
        </div>
    );

    const TagName = sanitizeTag(tagName, "h2");
    const isDynamic = source === "dynamic-title";

    const latestContent = (
        <div
            className={["eb-advance-heading-wrapper", blockId, preset, effects]
                .filter(Boolean)
                .join(" ")}
            data-id={blockId}
        >
            {displaySeperator && seperatorPosition === "top" && separator}

            <TagName className="eb-ah-title">
                {isDynamic ? (
                    <DynamicTitle context={context} />
                ) : (
                    <>
                        <RichText
                            tagName="span"
                            className="first-title"
                            value={titleText}
                            placeholder={__("Add your text here", "advanced-heading")}
                            allowedFormats={TEXT_FORMATS}
                            onChange={(titleText) => setAttributes({ titleText })}
                        />
                        {title2Text && (
                            <>
                                &nbsp;
                                <RichText
                                    tagName="span"
                                    className="second-title"
                                    value={title2Text}
                                    allowedFormats={TEXT_FORMATS}
                                    onChange={(title2Text) => setAttributes({ title2Text })}
                                />
                            </>
                        )}
                        {title3Text && (
                            <>
                                &nbsp;
                                <RichText
                                    tagName="span"
                                    className="third-title"
                                    value={title3Text}
                                    allowedFormats={TEXT_FORMATS}
                                    onChange={(title3Text) => setAttributes({ title3Text })}
                                />
                            </>
                        )}
                    </>
                )}
            </TagName>

            {!isDynamic && displaySubtitle && (
                <RichText
                    tagName={sanitizeTag(subtitleTagName, "p")}
                    className="eb-ah-subtitle"
                    value={subtitleText}
                    allowedFormats={TEXT_FORMATS}
                    onChange={(subtitleText) => setAttributes({ subtitleText })}
                />
            )}
            {displaySeperator && seperatorPosition === "bottom" && separator}
        </div>
    );

    return (
        <>
            {isSelected && (
                <>
                    <BlockControls>
                        <AlignmentToolbar
                            value={align}
                            onChange={(align) => setAttributes({ align })}
                            controls={["left", "center", "right"]}
                        />
                    </BlockControls>
                    <Inspector
                        attributes={attributes}
                        setAttributes={setAttributes}
                    />
                </>
            )}

            <div {...blockProps}>
                <Style {...props} />
                <div
                    className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                >
                    {latestDesign ? latestContent : legacyContent}
                </div>
            </div>
        </>
    );
}
