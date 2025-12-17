import React from 'react';

const ComponentPreview = ({ components, designTokens }) => {
    if (!components && !designTokens) {
        return (
            <div className="component-preview-empty">
                <p>No component data available. Try converting a Figma URL to see detected components.</p>
            </div>
        );
    }

    return (
        <div className="component-preview">
            <div className="preview-section">
                <h3>Detected Components</h3>
                {components && components.summary ? (
                    <div className="component-grid">
                        <ComponentCard
                            title="Buttons"
                            count={components.summary.buttonCount}
                            icon="🔘"
                            items={components.components.buttons}
                        />
                        <ComponentCard
                            title="Cards"
                            count={components.summary.cardCount}
                            icon="📦"
                            items={components.components.cards}
                        />
                        <ComponentCard
                            title="Navigation"
                            count={components.summary.navigationCount}
                            icon="🧭"
                            items={components.components.navigation}
                        />
                        <ComponentCard
                            title="Forms"
                            count={components.summary.formCount}
                            icon="📝"
                            items={components.components.forms}
                        />
                        <ComponentCard
                            title="Icons"
                            count={components.summary.iconCount}
                            icon="🎨"
                            items={components.components.icons}
                        />
                    </div>
                ) : (
                    <p className="no-data">No components detected.</p>
                )}
            </div>

            <div className="preview-section">
                <h3>Design Tokens</h3>
                {designTokens ? (
                    <div className="tokens-grid">
                        <TokenGroup title="Colors" tokens={designTokens.colors} type="color" />
                        <TokenGroup title="Typography" tokens={designTokens.fonts} type="font" />
                        <TokenGroup title="Spacing" tokens={designTokens.spacingScale} type="spacing" />
                        <TokenGroup title="Border Radius" tokens={designTokens.borders?.radius} type="radius" />
                    </div>
                ) : (
                    <p className="no-data">No design tokens extracted.</p>
                )}
            </div>
        </div>
    );
};

const ComponentCard = ({ title, count, icon, items }) => (
    <div className={`component-card ${count > 0 ? 'has-items' : 'empty'}`}>
        <div className="card-header">
            <span className="icon">{icon}</span>
            <span className="title">{title}</span>
            <span className="count">{count}</span>
        </div>
        {count > 0 && (
            <div className="card-details">
                {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="detail-item">
                        <span className="variant">{item.variant || item.type}</span>
                        {item.text && <span className="text-preview">"{item.text}"</span>}
                    </div>
                ))}
                {count > 3 && <div className="more-items">+{count - 3} more</div>}
            </div>
        )}
    </div>
);

const TokenGroup = ({ title, tokens, type }) => {
    if (!tokens || tokens.length === 0) return null;

    return (
        <div className="token-group">
            <h4>{title}</h4>
            <div className="token-list">
                {tokens.slice(0, 10).map((token, idx) => (
                    <div key={idx} className="token-item">
                        {type === 'color' && (
                            <div className="color-swatch" style={{ backgroundColor: token }}></div>
                        )}
                        <span className="token-value">{token}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComponentPreview;
