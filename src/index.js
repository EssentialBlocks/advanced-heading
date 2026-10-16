import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";

import "./style.scss";
import Edit from "./edit";
import save from "./save";
// import { HeadingIcon } from "../../../util/icons";
import { HeadingIcon } from "./icon";
import attributes from "./attributes";
import deprecated from "./deprecated";
import Example from "./example";
import metadata from "../block.json";
import { LATEST_DESIGN_VERSION } from "./helpers";
const { ebConditionalRegisterBlockType } = EBAdvHeadingControls;

const { name, category } = metadata;

ebConditionalRegisterBlockType(metadata, {
	keywords: [
		__("heading", "essential-blocks"),
		__("Advanced Heading", "essential-blocks"),
		__("heading block", "essential-blocks"),
		__("heading box", "essential-blocks"),
		__("dynamic title", "essential-blocks"),
	],
	icon: HeadingIcon,
	attributes,
	edit: Edit,
	save,
	example: Example,
	deprecated,
	// Every heading inserted from now on starts on the latest design. Blocks that
	// already exist in posts are untouched: a variation only applies on insertion.
	variations: [
		{
			name: "advanced-heading-default",
			title: __("Advanced Heading", "essential-blocks"),
			icon: HeadingIcon,
			isDefault: true,
			scope: ["inserter", "transform"],
			attributes: {
				designVersion: LATEST_DESIGN_VERSION,
			},
		},
	],
});