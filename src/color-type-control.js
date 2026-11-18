import { __ } from "@wordpress/i18n";
import { useRef } from "@wordpress/element";
import { BaseControl, Button, ButtonGroup } from "@wordpress/components";

import { isGradientColor } from "./helpers";
import GradientEditor, { serializeGradient, DEFAULT_GRADIENT_MODEL } from "./gradient-editor";

const { ColorControl } = window.EBAdvHeadingControls;

const DEFAULT_SOLID = "#551ef7";
const DEFAULT_GRADIENT = serializeGradient(DEFAULT_GRADIENT_MODEL);

/**
 * A colour field with an explicit Solid / Gradient switch.
 *
 * The shared ColorControl hides the gradient picker behind a tab inside its
 * popover, which is easy to miss. This puts the choice in front of the user and
 * keeps the last solid colour so switching back and forth loses nothing.
 */
const ColorTypeControl = ({ label, color, onChange }) => {
    const isGradient = isGradientColor(color);
    const lastSolid = useRef(isGradient ? "" : color || "");
    const lastGradient = useRef(isGradient ? color : "");

    if (isGradient) {
        lastGradient.current = color;
    } else if (color) {
        lastSolid.current = color;
    }

    const switchTo = (toGradient) => {
        if (toGradient === isGradient) {
            return;
        }
        onChange(
            toGradient
                ? lastGradient.current || DEFAULT_GRADIENT
                : lastSolid.current || DEFAULT_SOLID
        );
    };

    const id = `eb-ah-color-type-${label.replace(/\s+/g, "-").toLowerCase()}`;

    return (
        <BaseControl label={label} id={id} className="eb-ah-color-type">
            <ButtonGroup id={id} className="eb-ah-color-type-buttons">
                <Button
                    isPrimary={!isGradient}
                    isSecondary={isGradient}
                    onClick={() => switchTo(false)}
                >
                    {__("Solid", "advanced-heading")}
                </Button>
                <Button
                    isPrimary={isGradient}
                    isSecondary={!isGradient}
                    onClick={() => switchTo(true)}
                >
                    {__("Gradient", "advanced-heading")}
                </Button>
            </ButtonGroup>
            {isGradient ? (
                <GradientEditor value={color} onChange={onChange} />
            ) : (
                // ColorControl only reads `color` on mount, so remount when the type flips.
                <ColorControl
                    key="solid"
                    label={__("Click to pick colour", "advanced-heading")}
                    color={color}
                    onChange={(value) => {
                        // ColorControl reports `null` while it mounts, before it has read
                        // `color`; passing that through would wipe the value just chosen.
                        if (value !== null && value !== undefined) {
                            onChange(value);
                        }
                    }}
                />
            )}
        </BaseControl>
    );
};

export default ColorTypeControl;
