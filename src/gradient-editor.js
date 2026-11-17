import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { Button, ButtonGroup, RangeControl } from "@wordpress/components";

const { ColorControl } = window.EBAdvHeadingControls;

const MIN_STOPS = 2;
const MAX_STOPS = 5;
const STOP_NAMES = ["First", "Second", "Third", "Fourth", "Fifth"];
const NEW_STOP_COLORS = ["#551ef7", "#ff4fb0", "#ffb86b", "#2dd4bf", "#60a5fa"];

export const DEFAULT_GRADIENT_MODEL = {
    type: "linear",
    angle: 135,
    stops: [
        { color: "#551ef7", position: 0 },
        { color: "#ff4fb0", position: 100 },
    ],
};

/**
 * Split on commas that are not inside brackets, so rgba(0,0,0,.5) stays whole.
 */
const splitTopLevel = (value) => {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const char of value) {
        if (char === "(") depth++;
        if (char === ")") depth--;
        if (char === "," && depth === 0) {
            parts.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    if (current.trim() !== "") {
        parts.push(current.trim());
    }
    return parts;
};

/**
 * Read a linear/radial gradient string into the editor's model. Anything that
 * cannot be read falls back to the default model.
 */
export const parseGradient = (value) => {
    if (typeof value !== "string") {
        return DEFAULT_GRADIENT_MODEL;
    }
    const match = value.trim().match(/^(linear|radial)-gradient\((.*)\)$/is);
    if (!match) {
        return DEFAULT_GRADIENT_MODEL;
    }

    const type = match[1].toLowerCase();
    const args = splitTopLevel(match[2]);
    // A radial gradient has no angle, so switching back to linear starts from the default.
    let angle = type === "linear" ? 180 : DEFAULT_GRADIENT_MODEL.angle;

    const first = args[0] || "";
    const angleMatch = first.match(/^(-?\d+(?:\.\d+)?)deg$/i);
    const isShapeArg = /^(circle|ellipse|to\s|closest|farthest|at\s)/i.test(first);
    if (angleMatch) {
        angle = Math.round(parseFloat(angleMatch[1]));
        args.shift();
    } else if (isShapeArg) {
        args.shift();
    }

    const stops = args.map((arg, index) => {
        const posMatch = arg.match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%$/s);
        if (posMatch) {
            return {
                color: posMatch[1].trim(),
                position: Math.round(parseFloat(posMatch[2])),
            };
        }
        return {
            color: arg,
            position: Math.round((index / Math.max(args.length - 1, 1)) * 100),
        };
    });

    if (stops.length < MIN_STOPS) {
        return DEFAULT_GRADIENT_MODEL;
    }
    return { type, angle, stops: stops.slice(0, MAX_STOPS) };
};

export const serializeGradient = ({ type, angle, stops }) => {
    const list = stops
        .map(({ color, position }) => `${color || "transparent"} ${position}%`)
        .join(",");
    return type === "radial"
        ? `radial-gradient(circle,${list})`
        : `linear-gradient(${angle}deg,${list})`;
};

const evenPositions = (count) =>
    Array.from({ length: count }, (_, i) => Math.round((i / (count - 1)) * 100));

/**
 * Inline gradient editor: type, angle, and 2 to 5 colour stops, each with a
 * colour picker, a colour-code field and a position.
 */
const GradientEditor = ({ value, onChange }) => {
    const model = parseGradient(value);
    const { type, angle, stops } = model;
    // ColorControl reads its colour only when it mounts, so remount the colour
    // fields whenever stops are added or removed (not on every colour pick, which
    // would close the open picker).
    const [structureKey, setStructureKey] = useState(0);

    const commit = (next) => onChange(serializeGradient({ ...model, ...next }));

    const updateStop = (index, patch) =>
        commit({
            stops: stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)),
        });

    const addStop = () => {
        if (stops.length >= MAX_STOPS) return;
        const positions = evenPositions(stops.length + 1);
        const next = [...stops, { color: NEW_STOP_COLORS[stops.length], position: 100 }];
        setStructureKey((key) => key + 1);
        commit({ stops: next.map((stop, i) => ({ ...stop, position: positions[i] })) });
    };

    const removeStop = (index) => {
        if (stops.length <= MIN_STOPS) return;
        const remaining = stops.filter((_, i) => i !== index);
        const positions = evenPositions(remaining.length);
        setStructureKey((key) => key + 1);
        commit({ stops: remaining.map((stop, i) => ({ ...stop, position: positions[i] })) });
    };

    const stopLabel = (index) => `${STOP_NAMES[index]} ${__("Color", "advanced-heading")}`;

    return (
        <div className="eb-ah-gradient-editor">
            <div className="eb-ah-gradient-type">
                <span className="eb-ah-gradient-label">
                    {__("Gradient Type", "advanced-heading")}
                </span>
                <ButtonGroup>
                    {[
                        { value: "linear", label: __("Linear", "advanced-heading") },
                        { value: "radial", label: __("Radial", "advanced-heading") },
                    ].map((item) => (
                        <Button
                            key={item.value}
                            isPrimary={type === item.value}
                            isSecondary={type !== item.value}
                            onClick={() => commit({ type: item.value })}
                        >
                            {item.label}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>

            {stops.map((stop, index) => (
                <div className="eb-ah-gradient-stop-color" key={`${structureKey}-${index}`}>
                    <ColorControl
                        label={stopLabel(index)}
                        color={stop.color}
                        onChange={(color) => {
                            // ColorControl reports `null` while it mounts, before it has
                            // read `color`; ignore it so the stop keeps its colour.
                            if (color !== null && color !== undefined) {
                                updateStop(index, { color });
                            }
                        }}
                    />
                    {stops.length > MIN_STOPS && (
                        <Button
                            isLink
                            isDestructive
                            className="eb-ah-gradient-remove"
                            aria-label={`${__("Remove", "advanced-heading")} ${stopLabel(index)}`}
                            onClick={() => removeStop(index)}
                        >
                            {"\u00d7"}
                        </Button>
                    )}
                </div>
            ))}

            {stops.length < MAX_STOPS && (
                <Button isSecondary onClick={addStop} className="eb-ah-gradient-add">
                    {__("+ Add Color", "advanced-heading")}
                </Button>
            )}

            {stops.map((stop, index) => (
                <RangeControl
                    key={index}
                    label={`${STOP_NAMES[index]} ${__("Color Position", "advanced-heading")}`}
                    value={stop.position}
                    min={0}
                    max={100}
                    onChange={(position) => updateStop(index, { position: Number(position) || 0 })}
                />
            ))}

            {type === "linear" && (
                <RangeControl
                    label={__("Angle", "advanced-heading")}
                    value={angle}
                    min={0}
                    max={360}
                    onChange={(next) => commit({ angle: Number(next) || 0 })}
                />
            )}
        </div>
    );
};

export default GradientEditor;
