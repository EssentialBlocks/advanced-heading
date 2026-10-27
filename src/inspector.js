/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { InspectorControls } from "@wordpress/block-editor";
import {
    PanelBody,
    PanelRow,
    SelectControl,
    ToggleControl,
    TextControl,
    RangeControl,
    Button,
    ButtonGroup,
    BaseControl,
    TabPanel,
} from "@wordpress/components";

/**
 * Internal depencencies
 */
import {
    WRAPPER_BG,
    WRAPPER_MARGIN,
    WRAPPER_PADDING,
    WRAPPER_BORDER_SHADOW,
    TITLE_MARGIN,
    TITLE1_PADDING,
    TITLE1_BORDER_SHADOW,
    TITLE2_PADDING,
    TITLE2_BORDER_SHADOW,
    TITLE3_PADDING,
    TITLE3_BORDER_SHADOW,
    SUBTITLE_MARGIN,
    SEPARATOR_MARGIN,
    SEPARATOR_LINE_SIZE,
    SEPARATOR_ICON_SIZE,
    SEPARATOR_WIDTH,
    SEPARATOR_POSITION,
    UNIT_TYPES,
    SEPARATOR_UNIT_TYPES,
    PRESETS,
    TEXT_ALIGN,
    HEADING,
    SEPERATOR_STYLES,
    SEPARATOR_TYPE,
    ALIGNMENT,
    SOURCE,
    EFFECTS,
} from "./constants/constants";
import {
    TITLE_TYPOGRAPHY,
    TITLE2_TYPOGRAPHY,
    TITLE3_TYPOGRAPHY,
    SUBTITLE_TYPOGRAPHY,
} from "./constants/typographyPrefixConstants";
import ResponsiveAlignControl from "../controls/src/controls/responsive-align-control";
import {
    LATEST_DESIGN_VERSION,
    isLatestDesign,
    isGradientColor,
    sanitizeURL,
} from "./helpers";
const {
    ResponsiveDimensionsControl,
    TypographyDropdown,
    BorderShadowControl,
    ResponsiveRangeController,
    BackgroundControl,
    AdvancedControls,
    ColorControl,
    EBIconPicker
} = window.EBAdvHeadingControls;

import objAttributes from "./attributes";

function Inspector(props) {
    const { attributes, setAttributes } = props;
    const {
        resOption,
        preset,
        effects,
        marqueeSpeed,
        marqueePauseOnHover,
        tagName,
        titleText,
        title2Text,
        title3Text,
        subtitleTagName,
        subtitleText,
        displaySubtitle,
        displaySeperator,
        titleColor,
        titleHoverColor,
        titleBgColor,
        titleHoverBgColor,
        title2Color,
        title2HoverColor,
        title2BgColor,
        title2HoverBgColor,
        title3Color,
        title3HoverColor,
        title3BgColor,
        title3HoverBgColor,
        subtitleColor,
        subtitleHoverColor,
        separatorColor,
        separatorHoverColor,
        seperatorPosition,
        seperatorType,
        seperatorStyle,
        separatorIcon,
        source,
        enableLink,
        titleLink,
        openInNewTab,
    } = attributes;

    const latestDesign = isLatestDesign(attributes);
    const isCustom = source !== "dynamic-title";
    const linkIsInvalid =
        typeof titleLink === "string" && titleLink.trim() !== "" && sanitizeURL(titleLink) === "#" && !titleLink.trim().startsWith("#");

    const resRequiredProps = {
        setAttributes,
        resOption,
        attributes,
        objAttributes,
    };

    const changeSource = (selected) => {
        setAttributes({ source: selected, displaySubtitle: false });
    };

    const changePreset = (selected) => {
        setAttributes({ preset: selected });
        switch (selected) {
            case "preset-0":
                setAttributes({
                    displaySubtitle: false,
                    displaySeperator: false,
                    align: "left",
                    titleColor: "#551ef7",
                    subtitleColor: "#555555",
                    separatorColor: "#551ef7",
                    seperatorType: "line",
                    wrpPaddingisLinked: true,
                    wrpPaddingUnit: "px",
                    wrpPaddingTop: "0",
                    wrpPaddingBottom: "0",
                    wrpPaddingLeft: "0",
                    wrpPaddingRight: "0",
                    wrprBgbackgroundColor: "rgba(255,255,255,1)",
                    wrprBgbackgroundType: "classic",
                });
                break;
            case "preset-1":
                setAttributes({
                    displaySubtitle: true,
                    displaySeperator: true,
                    align: "left",
                    titleColor: "#551ef7",
                    subtitleColor: "#555555",
                    separatorColor: "#551ef7",
                    seperatorType: "line",
                    wrpPaddingisLinked: false,
                    wrpPaddingUnit: "px",
                    wrpPaddingTop: "0",
                    wrpPaddingBottom: "0",
                    wrpPaddingLeft: "0",
                    wrpPaddingRight: "0",
                    wrprBgbackgroundColor: "rgba(255,255,255,1)",
                    wrprBgbackgroundType: "classic",
                });
                break;
            case "preset-2":
                setAttributes({
                    displaySubtitle: true,
                    displaySeperator: true,
                    align: "center",
                    titleColor: "#551ef7",
                    subtitleColor: "#555555",
                    separatorColor: "#551ef7",
                    seperatorType: "icon",
                    separatorIcon: "fas fa-bullhorn",
                    wrpPaddingisLinked: false,
                    wrpPaddingUnit: "px",
                    wrpPaddingTop: "0",
                    wrpPaddingBottom: "0",
                    wrpPaddingLeft: "0",
                    wrpPaddingRight: "0",
                    wrprBgbackgroundColor: "rgba(255,255,255,1)",
                    wrprBgbackgroundType: "classic",
                });
                break;
            case "preset-3":
                setAttributes({
                    displaySubtitle: true,
                    displaySeperator: true,
                    align: "center",
                    titleColor: "#551ef7",
                    subtitleColor: "#9b51e0",
                    separatorColor: "#551ef7",
                    seperatorType: "icon",
                    separatorIcon: "fas fa-exchange-alt",
                    wrpPaddingisLinked: false,
                    wrpPaddingUnit: "px",
                    wrpPaddingTop: "30",
                    wrpPaddingBottom: "30",
                    wrpPaddingLeft: "15",
                    wrpPaddingRight: "15",
                    wrprBgbackgroundColor: "rgba(206,190,255,1)",
                    wrprBgbackgroundType: "classic",
                });
                break;
            default:
                return false;
        }
    };



    // Colour, background, padding and border controls for one title part.
    const titlePartControls = ({
        typography,
        color,
        colorAttr,
        hoverColor,
        hoverColorAttr,
        bgColor,
        bgColorAttr,
        hoverBgColor,
        hoverBgColorAttr,
        padding,
        borderShadow,
    }) => (
        <>
            <TypographyDropdown
                baseLabel={__("Typography", "essential-blocks")}
                typographyPrefixConstant={typography}
                resRequiredProps={resRequiredProps}
            />
            <ColorControl
                label={__("Text Color", "essential-blocks")}
                color={color}
                isGradient={true}
                onChange={(value) => setAttributes({ [colorAttr]: value })}
            />
            <ColorControl
                label={__("Hover Text Color", "essential-blocks")}
                color={hoverColor}
                isGradient={true}
                onChange={(value) => setAttributes({ [hoverColorAttr]: value })}
            />
            {!isGradientColor(color) && (
                <ColorControl
                    label={__("Background Color", "essential-blocks")}
                    color={bgColor}
                    onChange={(value) => setAttributes({ [bgColorAttr]: value })}
                />
            )}
            {!isGradientColor(hoverColor) && (
                <ColorControl
                    label={__("Hover Background Color", "essential-blocks")}
                    color={hoverBgColor}
                    onChange={(value) => setAttributes({ [hoverBgColorAttr]: value })}
                />
            )}
            <ResponsiveDimensionsControl
                resRequiredProps={resRequiredProps}
                controlName={padding}
                baseLabel="Padding"
            />
            <BorderShadowControl
                controlName={borderShadow}
                resRequiredProps={resRequiredProps}
            />
        </>
    );

    const tagButtons = (value, attr) => (
        <ButtonGroup className="eb-advance-heading-alignment eb-html-tag-buttongroup">
            {HEADING.map((item, key) => (
                <Button
                    key={key}
                    isPrimary={value === item.value}
                    isSecondary={value !== item.value}
                    onClick={() => setAttributes({ [attr]: item.value })}
                >
                    {item.label}
                </Button>
            ))}
        </ButtonGroup>
    );

    return (
        <InspectorControls key="controls">
            <div className="eb-panel-control">
                <TabPanel
                    className="eb-parent-tab-panel"
                    activeClass="active-tab"
                    tabs={[
                        {
                            name: "general",
                            title: "General",
                            className: "eb-tab general",
                        },
                        {
                            name: "styles",
                            title: "Style",
                            className: "eb-tab styles",
                        },
                        {
                            name: "advance",
                            title: "Advanced",
                            className: "eb-tab advance",
                        },
                    ]}
                >
                    {(tab) => (
                        <div className={"eb-tab-controls" + tab.name}>
                            {tab.name === "general" && (
                                <>
                                    <PanelBody title={__("General", "essential-blocks")} initialOpen={true}>
                                        {latestDesign && (
                                            <SelectControl
                                                label={__("Source", "essential-blocks")}
                                                value={source}
                                                options={SOURCE}
                                                onChange={(selected) => changeSource(selected)}
                                                help={
                                                    !isCustom
                                                        ? __("Shows the title of the current post, or of each post inside a Query Loop.", "advanced-heading")
                                                        : undefined
                                                }
                                            />
                                        )}
                                        <SelectControl
                                            label={__("Preset Designs", "essential-blocks")}
                                            value={preset}
                                            options={PRESETS}
                                            onChange={(selected) => changePreset(selected)}
                                        />
                                        {latestDesign && (
                                            <SelectControl
                                                label={__("Effects", "essential-blocks")}
                                                value={effects}
                                                options={EFFECTS}
                                                onChange={(selected) => setAttributes({ effects: selected })}
                                            />
                                        )}
                                        {latestDesign && effects === "marquee" && (
                                            <>
                                                <RangeControl
                                                    label={__("Marquee Speed", "essential-blocks")}
                                                    help={__("Seconds for one pass. Lower is faster.", "advanced-heading")}
                                                    value={marqueeSpeed}
                                                    min={1}
                                                    max={100}
                                                    step={1}
                                                    onChange={(value) => setAttributes({ marqueeSpeed: value })}
                                                />
                                                <ToggleControl
                                                    label={__("Marquee Pause on Hover", "essential-blocks")}
                                                    checked={marqueePauseOnHover}
                                                    onChange={() =>
                                                        setAttributes({ marqueePauseOnHover: !marqueePauseOnHover })
                                                    }
                                                />
                                            </>
                                        )}

                                        <ResponsiveAlignControl
                                            baseLabel={__("Alignment", "essential-blocks")}
                                            controlName={ALIGNMENT}
                                            options={TEXT_ALIGN}
                                            resRequiredProps={resRequiredProps}
                                        />
                                        <BaseControl
                                            label={__("Title Level", "essential-blocks")}
                                            id="eb-advance-heading-title-level"
                                        >
                                            {tagButtons(tagName, "tagName")}
                                        </BaseControl>

                                        {isCustom && (
                                            <>
                                                <TextControl
                                                    label={
                                                        latestDesign
                                                            ? __("Title Text (First)", "essential-blocks")
                                                            : __("Title Text", "essential-blocks")
                                                    }
                                                    value={titleText}
                                                    onChange={(text) => setAttributes({ titleText: text })}
                                                />
                                                {latestDesign && (
                                                    <>
                                                        <TextControl
                                                            label={__("Title Text (Second)", "essential-blocks")}
                                                            value={title2Text || ""}
                                                            onChange={(text) => setAttributes({ title2Text: text })}
                                                        />
                                                        <TextControl
                                                            label={__("Title Text (Third)", "essential-blocks")}
                                                            value={title3Text || ""}
                                                            onChange={(text) => setAttributes({ title3Text: text })}
                                                        />
                                                    </>
                                                )}
                                                <ToggleControl
                                                    label={__("Display Subtitle", "essential-blocks")}
                                                    checked={displaySubtitle}
                                                    onChange={() => setAttributes({ displaySubtitle: !displaySubtitle })}
                                                />
                                            </>
                                        )}
                                        {isCustom && displaySubtitle && (
                                            <>
                                                <BaseControl
                                                    label={__("Subtitle Level", "essential-blocks")}
                                                    id="eb-advance-heading-subtitle-level"
                                                >
                                                    {tagButtons(subtitleTagName, "subtitleTagName")}
                                                </BaseControl>
                                                <TextControl
                                                    label={__("Subtitle Text", "essential-blocks")}
                                                    value={subtitleText}
                                                    onChange={(text) => setAttributes({ subtitleText: text })}
                                                />
                                            </>
                                        )}
                                        <ToggleControl
                                            label={__("Display Separator", "essential-blocks")}
                                            checked={displaySeperator}
                                            onChange={() => setAttributes({ displaySeperator: !displaySeperator })}
                                        />

                                        {latestDesign && (
                                            <ToggleControl
                                                label={__("Enable Link for Heading?", "essential-blocks")}
                                                help={
                                                    !isCustom
                                                        ? __("Links the title to its post.", "advanced-heading")
                                                        : undefined
                                                }
                                                checked={enableLink}
                                                onChange={(value) => setAttributes({ enableLink: value })}
                                            />
                                        )}
                                        {latestDesign && isCustom && enableLink && (
                                            <TextControl
                                                type="url"
                                                label={__("Link", "essential-blocks")}
                                                value={titleLink}
                                                onChange={(link) => setAttributes({ titleLink: link })}
                                                help={
                                                    linkIsInvalid
                                                        ? __("Invalid URL. Please include http:// or https://", "essential-blocks")
                                                        : __("Use http:// or https://", "essential-blocks")
                                                }
                                            />
                                        )}
                                        {latestDesign && enableLink && (
                                            <ToggleControl
                                                label={__("Link open in New Tab", "essential-blocks")}
                                                checked={openInNewTab}
                                                onChange={(value) => setAttributes({ openInNewTab: value })}
                                            />
                                        )}

                                        {!latestDesign && (
                                            <p className="components-base-control__help">
                                                {__(
                                                    "Second and third titles, a heading link, effects and the Dynamic Title source are available after turning on \"Use latest design\" in the Advanced tab.",
                                                    "advanced-heading"
                                                )}
                                            </p>
                                        )}
                                    </PanelBody>
                                </>
                            )}

                            {tab.name === "styles" && (
                                <>
                                    <PanelBody title={__("Title", "essential-blocks")} initialOpen={true}>
                                        {latestDesign ? (
                                            <>
                                                <PanelRow className="separator">
                                                    {__("First Heading", "essential-blocks")}
                                                </PanelRow>
                                                {titlePartControls({
                                                    typography: TITLE_TYPOGRAPHY,
                                                    color: titleColor,
                                                    colorAttr: "titleColor",
                                                    hoverColor: titleHoverColor,
                                                    hoverColorAttr: "titleHoverColor",
                                                    bgColor: titleBgColor,
                                                    bgColorAttr: "titleBgColor",
                                                    hoverBgColor: titleHoverBgColor,
                                                    hoverBgColorAttr: "titleHoverBgColor",
                                                    padding: TITLE1_PADDING,
                                                    borderShadow: TITLE1_BORDER_SHADOW,
                                                })}
                                                {isCustom && title2Text && (
                                                    <>
                                                        <PanelRow className="separator">
                                                            {__("Second Heading", "essential-blocks")}
                                                        </PanelRow>
                                                        {titlePartControls({
                                                            typography: TITLE2_TYPOGRAPHY,
                                                            color: title2Color,
                                                            colorAttr: "title2Color",
                                                            hoverColor: title2HoverColor,
                                                            hoverColorAttr: "title2HoverColor",
                                                            bgColor: title2BgColor,
                                                            bgColorAttr: "title2BgColor",
                                                            hoverBgColor: title2HoverBgColor,
                                                            hoverBgColorAttr: "title2HoverBgColor",
                                                            padding: TITLE2_PADDING,
                                                            borderShadow: TITLE2_BORDER_SHADOW,
                                                        })}
                                                    </>
                                                )}
                                                {isCustom && title3Text && (
                                                    <>
                                                        <PanelRow className="separator">
                                                            {__("Third Heading", "essential-blocks")}
                                                        </PanelRow>
                                                        {titlePartControls({
                                                            typography: TITLE3_TYPOGRAPHY,
                                                            color: title3Color,
                                                            colorAttr: "title3Color",
                                                            hoverColor: title3HoverColor,
                                                            hoverColorAttr: "title3HoverColor",
                                                            bgColor: title3BgColor,
                                                            bgColorAttr: "title3BgColor",
                                                            hoverBgColor: title3HoverBgColor,
                                                            hoverBgColorAttr: "title3HoverBgColor",
                                                            padding: TITLE3_PADDING,
                                                            borderShadow: TITLE3_BORDER_SHADOW,
                                                        })}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <TypographyDropdown
                                                    baseLabel={__("Typography", "essential-blocks")}
                                                    typographyPrefixConstant={TITLE_TYPOGRAPHY}
                                                    resRequiredProps={resRequiredProps}
                                                />
                                                <ColorControl
                                                    label={__("Title Color", "essential-blocks")}
                                                    color={titleColor}
                                                    onChange={(color) => setAttributes({ titleColor: color })}
                                                />
                                                <ColorControl
                                                    label={__("Title Hover Color", "essential-blocks")}
                                                    color={titleHoverColor}
                                                    onChange={(color) => setAttributes({ titleHoverColor: color })}
                                                />
                                            </>
                                        )}
                                        <ResponsiveDimensionsControl
                                            resRequiredProps={resRequiredProps}
                                            controlName={TITLE_MARGIN}
                                            baseLabel="Margin"
                                        />
                                    </PanelBody>

                                    {isCustom && (
                                        <PanelBody title={__("Subtitle", "essential-blocks")} initialOpen={false}>
                                            <TypographyDropdown
                                                baseLabel={__("Typography", "essential-blocks")}
                                                typographyPrefixConstant={SUBTITLE_TYPOGRAPHY}
                                                resRequiredProps={resRequiredProps}
                                            />

                                            <ColorControl
                                                label={__("Subtitle Color", "essential-blocks")}
                                                color={subtitleColor}
                                                onChange={(color) => setAttributes({ subtitleColor: color })}
                                            />
                                            <ColorControl
                                                label={__("Subtitle Hover Color", "essential-blocks")}
                                                color={subtitleHoverColor}
                                                onChange={(color) => setAttributes({ subtitleHoverColor: color })}
                                            />

                                            <ResponsiveDimensionsControl
                                                resRequiredProps={resRequiredProps}
                                                controlName={SUBTITLE_MARGIN}
                                                baseLabel="Margin"
                                            />
                                        </PanelBody>
                                    )}

                                    {displaySeperator && (
                                        <PanelBody title={__("Separator", "essential-blocks")} initialOpen={false}>
                                            <SelectControl
                                                label={__("Separator Position", "essential-blocks")}
                                                value={seperatorPosition}
                                                options={SEPARATOR_POSITION}
                                                onChange={(seperatorPosition) => setAttributes({ seperatorPosition })}
                                            />
                                            <BaseControl
                                                label={__("Separator Type", "essential-blocks")}
                                                id="eb-advance-heading-separator-type"
                                            >
                                                <ButtonGroup id="eb-advance-heading-separator-type">
                                                    {SEPARATOR_TYPE.map((item, key) => (
                                                        <Button
                                                            key={key}
                                                            isPrimary={seperatorType === item.value}
                                                            isSecondary={seperatorType !== item.value}
                                                            onClick={() =>
                                                                setAttributes({
                                                                    seperatorType: item.value,
                                                                })
                                                            }
                                                        >
                                                            {item.label}
                                                        </Button>
                                                    ))}
                                                </ButtonGroup>
                                            </BaseControl>

                                            {seperatorType === "line" && (
                                                <>
                                                    <SelectControl
                                                        label={__("Separator Style", "essential-blocks")}
                                                        value={seperatorStyle}
                                                        options={SEPERATOR_STYLES}
                                                        onChange={(seperatorStyle) => setAttributes({ seperatorStyle })}
                                                    />
                                                    <ResponsiveRangeController
                                                        baseLabel={__("Separator Height", "essential-blocks")}
                                                        controlName={SEPARATOR_LINE_SIZE}
                                                        resRequiredProps={resRequiredProps}
                                                        units={UNIT_TYPES}
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                    />
                                                </>
                                            )}

                                            {seperatorType === "icon" && (
                                                <>
                                                    <EBIconPicker
                                                        value={separatorIcon}
                                                        onChange={(icon) =>
                                                            setAttributes({
                                                                separatorIcon: icon,
                                                            })
                                                        }
                                                    />
                                                    <ResponsiveRangeController
                                                        baseLabel={__("Icon Size", "essential-blocks")}
                                                        controlName={SEPARATOR_ICON_SIZE}
                                                        resRequiredProps={resRequiredProps}
                                                        units={UNIT_TYPES}
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                    />
                                                </>
                                            )}
                                            <ResponsiveRangeController
                                                baseLabel={__("Separator Width", "essential-blocks")}
                                                controlName={SEPARATOR_WIDTH}
                                                resRequiredProps={resRequiredProps}
                                                units={SEPARATOR_UNIT_TYPES}
                                                min={0}
                                                max={300}
                                                step={1}
                                            />

                                            <ColorControl
                                                label={__("Separator Color", "essential-blocks")}
                                                color={separatorColor}
                                                isGradient={latestDesign}
                                                onChange={(color) => setAttributes({ separatorColor: color })}
                                            />
                                            <ColorControl
                                                label={__("Separator Hover Color", "essential-blocks")}
                                                color={separatorHoverColor}
                                                isGradient={latestDesign}
                                                onChange={(color) => setAttributes({ separatorHoverColor: color })}
                                            />

                                            <ResponsiveDimensionsControl
                                                resRequiredProps={resRequiredProps}
                                                controlName={SEPARATOR_MARGIN}
                                                baseLabel="Margin"
                                            />
                                        </PanelBody>
                                    )}
                                </>
                            )}

                            {tab.name === "advance" && (
                                <>
                                    <PanelBody>
                                        <ResponsiveDimensionsControl
                                            resRequiredProps={resRequiredProps}
                                            controlName={WRAPPER_MARGIN}
                                            baseLabel="Margin"
                                        />
                                        <ResponsiveDimensionsControl
                                            resRequiredProps={resRequiredProps}
                                            controlName={WRAPPER_PADDING}
                                            baseLabel="Padding"
                                        />
                                    </PanelBody>
                                    <PanelBody title={__("Background", "essential-blocks")} initialOpen={false}>
                                        <BackgroundControl
                                            controlName={WRAPPER_BG}
                                            resRequiredProps={resRequiredProps}
                                        />
                                    </PanelBody>
                                    <PanelBody title={__("Border & Shadow")} initialOpen={false}>
                                        <BorderShadowControl
                                            controlName={WRAPPER_BORDER_SHADOW}
                                            resRequiredProps={resRequiredProps}
                                        />
                                    </PanelBody>
                                    <PanelBody
                                        title={__("Design", "advanced-heading")}
                                        initialOpen={!latestDesign}
                                    >
                                        <ToggleControl
                                            label={__("Use latest design", "advanced-heading")}
                                            help={__(
                                                "Adds second and third titles, a heading link, Marquee and Waviy effects, the Dynamic Title source, gradient colours and per-title background, padding and border. New headings use this by default. Turning it on changes this heading's markup and may change how it looks.",
                                                "advanced-heading"
                                            )}
                                            checked={latestDesign}
                                            onChange={(checked) =>
                                                setAttributes(
                                                    checked
                                                        ? { designVersion: LATEST_DESIGN_VERSION }
                                                        : { designVersion: undefined, source: "custom" }
                                                )
                                            }
                                        />
                                    </PanelBody>

                                    <AdvancedControls attributes={attributes} setAttributes={setAttributes} />
                                </>
                            )}
                        </div>
                    )}
                </TabPanel>
            </div>
        </InspectorControls>
    );
}

export default Inspector;
