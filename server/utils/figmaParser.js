const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const parseFigmaNode = (node) => {
    const designSystem = {
        colors: new Set(),
        gradients: new Set(),
        fonts: new Set(),
        typography: {
            headings: new Set(),
            body: new Set(),
            captions: new Set()
        },
        layout: {
            gaps: new Set(),
            paddings: new Set()
        },
        effects: {
            shadows: new Set(),
            blurs: new Set()
        },
        borders: {
            radius: new Set(),
            widths: new Set()
        },
        spacing: new Set()
    };

    const traverse = (currentNode) => {
        if (!currentNode) return;

        // 1. Extract Colors (Fills)
        if (currentNode.fills) {
            currentNode.fills.forEach(fill => {
                if (fill.visible !== false) {
                    if (fill.type === 'SOLID' && fill.color) {
                        designSystem.colors.add(rgbToHex(fill.color.r, fill.color.g, fill.color.b));
                    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
                        // Extract gradient colors
                        if (fill.gradientStops) {
                            const gradientColors = fill.gradientStops.map(stop =>
                                rgbToHex(stop.color.r, stop.color.g, stop.color.b)
                            );
                            designSystem.gradients.add(gradientColors.join(' → '));
                        }
                    }
                }
            });
        }

        // 2. Extract Colors (Strokes)
        if (currentNode.strokes) {
            currentNode.strokes.forEach(stroke => {
                if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
                    designSystem.colors.add(rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b));
                }
            });
            // Extract border widths
            if (currentNode.strokeWeight) {
                designSystem.borders.widths.add(`${currentNode.strokeWeight}px`);
            }
        }

        // 3. Extract Typography with categorization
        if (currentNode.style) {
            const { fontFamily, fontWeight, fontSize, lineHeightPx, letterSpacing, textAlign } = currentNode.style;
            if (fontFamily) {
                const lh = lineHeightPx ? `${Math.round(lineHeightPx)}px` : 'Auto';
                const ls = letterSpacing ? `${letterSpacing.toFixed(2)}px` : '0px';
                const fontInfo = `Family: ${fontFamily}, Weight: ${fontWeight || 400}, Size: ${fontSize}px, LineHeight: ${lh}, LetterSpacing: ${ls}, Align: ${textAlign || 'left'}`;

                designSystem.fonts.add(fontInfo);

                // Categorize by size
                if (fontSize >= 32) {
                    designSystem.typography.headings.add(fontInfo);
                } else if (fontSize >= 14) {
                    designSystem.typography.body.add(fontInfo);
                } else {
                    designSystem.typography.captions.add(fontInfo);
                }
            }
        }

        // 4. Extract Layout (AutoLayout)
        if (currentNode.layoutMode) {
            if (currentNode.itemSpacing) {
                designSystem.layout.gaps.add(`${currentNode.itemSpacing}px`);
                designSystem.spacing.add(currentNode.itemSpacing);
            }
            if (currentNode.paddingLeft || currentNode.paddingTop) {
                const p = `${currentNode.paddingTop || 0}px ${currentNode.paddingRight || 0}px ${currentNode.paddingBottom || 0}px ${currentNode.paddingLeft || 0}px`;
                designSystem.layout.paddings.add(p);

                // Add individual padding values to spacing
                [currentNode.paddingTop, currentNode.paddingRight, currentNode.paddingBottom, currentNode.paddingLeft]
                    .filter(val => val && val > 0)
                    .forEach(val => designSystem.spacing.add(val));
            }
        }

        // 5. Extract Border Radius
        if (currentNode.cornerRadius !== undefined) {
            designSystem.borders.radius.add(`${currentNode.cornerRadius}px`);
        } else if (currentNode.rectangleCornerRadii) {
            // Individual corner radii
            currentNode.rectangleCornerRadii.forEach(r => {
                if (r > 0) designSystem.borders.radius.add(`${r}px`);
            });
        }

        // 6. Extract Effects (Shadows, Blurs)
        if (currentNode.effects) {
            currentNode.effects.forEach(effect => {
                if (effect.visible !== false) {
                    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                        const { offset, radius, color } = effect;
                        const shadowColor = color ? rgbToHex(color.r, color.g, color.b) : '#000000';
                        const shadowStr = `${offset?.x || 0}px ${offset?.y || 0}px ${radius || 0}px ${shadowColor}`;
                        designSystem.effects.shadows.add(shadowStr);
                    } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
                        designSystem.effects.blurs.add(`${effect.radius || 0}px`);
                    }
                }
            });
        }

        // Recursion
        if (currentNode.children) {
            currentNode.children.forEach(child => traverse(child));
        }
    };

    traverse(node);

    // Create spacing scale from collected values
    const spacingScale = Array.from(designSystem.spacing)
        .sort((a, b) => a - b)
        .map(val => `${val}px`);

    return {
        colors: Array.from(designSystem.colors),
        gradients: Array.from(designSystem.gradients),
        fonts: Array.from(designSystem.fonts),
        typography: {
            headings: Array.from(designSystem.typography.headings),
            body: Array.from(designSystem.typography.body),
            captions: Array.from(designSystem.typography.captions)
        },
        layout: {
            gaps: Array.from(designSystem.layout.gaps),
            paddings: Array.from(designSystem.layout.paddings)
        },
        effects: {
            shadows: Array.from(designSystem.effects.shadows),
            blurs: Array.from(designSystem.effects.blurs)
        },
        borders: {
            radius: Array.from(designSystem.borders.radius),
            widths: Array.from(designSystem.borders.widths)
        },
        spacingScale: spacingScale
    };
};

module.exports = { parseFigmaNode };
