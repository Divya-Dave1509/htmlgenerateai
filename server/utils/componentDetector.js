/**
 * Component Detector - Analyzes Figma nodes to identify reusable UI components
 */

const detectComponents = (node) => {
    const components = {
        buttons: [],
        cards: [],
        navigation: [],
        forms: [],
        icons: []
    };

    const traverse = (currentNode, depth = 0) => {
        if (!currentNode) return;

        // Detect Buttons
        if (isButton(currentNode)) {
            components.buttons.push(analyzeButton(currentNode));
        }

        // Detect Cards
        if (isCard(currentNode)) {
            components.cards.push(analyzeCard(currentNode));
        }

        // Detect Navigation
        if (isNavigation(currentNode)) {
            components.navigation.push(analyzeNavigation(currentNode));
        }

        // Detect Form Elements
        if (isFormElement(currentNode)) {
            components.forms.push(analyzeFormElement(currentNode));
        }

        // Detect Icons
        if (isIcon(currentNode)) {
            components.icons.push(analyzeIcon(currentNode));
        }

        // Recursion
        if (currentNode.children) {
            currentNode.children.forEach(child => traverse(child, depth + 1));
        }
    };

    traverse(node);

    return {
        components,
        summary: {
            buttonCount: components.buttons.length,
            cardCount: components.cards.length,
            navigationCount: components.navigation.length,
            formCount: components.forms.length,
            iconCount: components.icons.length
        }
    };
};

// Button Detection
const isButton = (node) => {
    // Buttons typically have:
    // - Text content
    // - Background fill
    // - Border radius
    // - Padding
    // - Interactive properties (if available)

    const hasText = node.children?.some(child => child.type === 'TEXT');
    const hasFill = node.fills?.some(fill => fill.type === 'SOLID' && fill.visible !== false);
    const hasRadius = node.cornerRadius !== undefined || node.rectangleCornerRadii;
    const hasName = node.name?.toLowerCase().includes('button') ||
        node.name?.toLowerCase().includes('btn') ||
        node.name?.toLowerCase().includes('cta');

    return (hasText && hasFill && hasRadius) || hasName;
};

const analyzeButton = (node) => {
    const textNode = node.children?.find(child => child.type === 'TEXT');
    const bgFill = node.fills?.find(fill => fill.type === 'SOLID' && fill.visible !== false);

    return {
        type: 'button',
        variant: classifyButtonVariant(node),
        text: textNode?.characters || 'Button',
        properties: {
            bgColor: bgFill ? rgbToHex(bgFill.color.r, bgFill.color.g, bgFill.color.b) : null,
            textColor: textNode?.fills?.[0]?.color ?
                rgbToHex(textNode.fills[0].color.r, textNode.fills[0].color.g, textNode.fills[0].color.b) : null,
            borderRadius: node.cornerRadius || 0,
            padding: extractPadding(node),
            width: node.absoluteBoundingBox?.width || 0,
            height: node.absoluteBoundingBox?.height || 0
        }
    };
};

const classifyButtonVariant = (node) => {
    const name = node.name?.toLowerCase() || '';
    if (name.includes('primary')) return 'primary';
    if (name.includes('secondary')) return 'secondary';
    if (name.includes('outline')) return 'outline';
    if (name.includes('text') || name.includes('link')) return 'text';

    // Classify by fill
    const hasFill = node.fills?.some(fill => fill.type === 'SOLID' && fill.visible !== false);
    const hasStroke = node.strokes?.length > 0;

    if (hasFill && !hasStroke) return 'primary';
    if (!hasFill && hasStroke) return 'outline';
    if (!hasFill && !hasStroke) return 'text';

    return 'default';
};

// Card Detection
const isCard = (node) => {
    // Cards typically have:
    // - Multiple children (image, text, button)
    // - Background
    // - Border radius
    // - Padding
    // - Vertical layout

    const hasMultipleChildren = node.children?.length >= 2;
    const hasFill = node.fills?.some(fill => fill.visible !== false);
    const hasRadius = node.cornerRadius !== undefined || node.rectangleCornerRadii;
    const hasName = node.name?.toLowerCase().includes('card');
    const isVertical = node.layoutMode === 'VERTICAL';

    return (hasMultipleChildren && hasFill && hasRadius && isVertical) || hasName;
};

const analyzeCard = (node) => {
    const hasImage = node.children?.some(child =>
        child.type === 'RECTANGLE' && child.fills?.some(fill => fill.type === 'IMAGE')
    );
    const hasText = node.children?.some(child => child.type === 'TEXT');
    const hasButton = node.children?.some(child => isButton(child));

    return {
        type: 'card',
        variant: classifyCardVariant(node),
        hasImage,
        hasText,
        hasButton,
        properties: {
            bgColor: extractBgColor(node),
            borderRadius: node.cornerRadius || 0,
            padding: extractPadding(node),
            width: node.absoluteBoundingBox?.width || 0,
            height: node.absoluteBoundingBox?.height || 0
        }
    };
};

const classifyCardVariant = (node) => {
    const name = node.name?.toLowerCase() || '';
    if (name.includes('product')) return 'product';
    if (name.includes('blog') || name.includes('article')) return 'blog';
    if (name.includes('feature')) return 'feature';
    if (name.includes('testimonial')) return 'testimonial';
    return 'default';
};

// Navigation Detection
const isNavigation = (node) => {
    // Navigation typically has:
    // - Horizontal layout
    // - Multiple text/link children
    // - Top position in design

    const isHorizontal = node.layoutMode === 'HORIZONTAL';
    const hasMultipleChildren = node.children?.length >= 3;
    const hasTextChildren = node.children?.filter(child =>
        child.type === 'TEXT' || child.children?.some(c => c.type === 'TEXT')
    ).length >= 3;
    const hasName = node.name?.toLowerCase().includes('nav') ||
        node.name?.toLowerCase().includes('header') ||
        node.name?.toLowerCase().includes('menu');

    return (isHorizontal && hasMultipleChildren && hasTextChildren) || hasName;
};

const analyzeNavigation = (node) => {
    const links = node.children?.filter(child =>
        child.type === 'TEXT' || child.children?.some(c => c.type === 'TEXT')
    ) || [];

    return {
        type: 'navigation',
        variant: node.name?.toLowerCase().includes('footer') ? 'footer' : 'header',
        linkCount: links.length,
        properties: {
            bgColor: extractBgColor(node),
            gap: node.itemSpacing || 0,
            padding: extractPadding(node)
        }
    };
};

// Form Element Detection
const isFormElement = (node) => {
    const name = node.name?.toLowerCase() || '';
    return name.includes('input') ||
        name.includes('form') ||
        name.includes('field') ||
        name.includes('textarea') ||
        name.includes('select');
};

const analyzeFormElement = (node) => {
    const name = node.name?.toLowerCase() || '';
    let elementType = 'input';
    if (name.includes('textarea')) elementType = 'textarea';
    if (name.includes('select')) elementType = 'select';
    if (name.includes('checkbox')) elementType = 'checkbox';
    if (name.includes('radio')) elementType = 'radio';

    return {
        type: 'form',
        elementType,
        properties: {
            bgColor: extractBgColor(node),
            borderRadius: node.cornerRadius || 0,
            padding: extractPadding(node),
            width: node.absoluteBoundingBox?.width || 0,
            height: node.absoluteBoundingBox?.height || 0
        }
    };
};

// Icon Detection
const isIcon = (node) => {
    const size = node.absoluteBoundingBox?.width || 0;
    const isSmall = size <= 48;
    const isVector = node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION';
    const hasName = node.name?.toLowerCase().includes('icon');

    return (isSmall && isVector) || hasName;
};

const analyzeIcon = (node) => {
    return {
        type: 'icon',
        name: node.name,
        size: node.absoluteBoundingBox?.width || 0,
        color: extractBgColor(node)
    };
};

// Helper Functions
const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const extractBgColor = (node) => {
    const bgFill = node.fills?.find(fill => fill.type === 'SOLID' && fill.visible !== false);
    return bgFill ? rgbToHex(bgFill.color.r, bgFill.color.g, bgFill.color.b) : null;
};

const extractPadding = (node) => {
    if (!node.paddingLeft && !node.paddingTop) return null;
    return {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0
    };
};

module.exports = { detectComponents };
