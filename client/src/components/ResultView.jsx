import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import CopilotAssistant from './CopilotAssistant';
import ComponentPreview from './ComponentPreview';

const ResultView = ({ result, setResult }) => {
    const [view, setView] = useState('preview'); // 'preview', 'code', 'components'
    const [previewWidth, setPreviewWidth] = useState('100%');
    const [copied, setCopied] = useState(false);

    // Destructure result, handling both old (string) and new (object) formats
    const code = typeof result === 'string' ? result : result?.html || '';
    const designTokens = typeof result === 'object' ? result?.designTokens : null;
    const components = typeof result === 'object' ? result?.components : null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCodeUpdate = (newCode) => {
        if (typeof result === 'object') {
            setResult({ ...result, html: newCode });
        } else {
            setResult(newCode);
        }
    };

    return (
        <div className="result-view">
            <CopilotAssistant code={code} onCodeUpdate={handleCodeUpdate} />
            <div className="result-header">
                <div className="view-toggles">
                    <button
                        className={view === 'preview' ? 'active' : ''}
                        onClick={() => setView('preview')}
                    >
                        Live Preview
                    </button>
                    <button
                        className={view === 'code' ? 'active' : ''}
                        onClick={() => setView('code')}
                    >
                        View Code
                    </button>
                    <button
                        className={view === 'components' ? 'active' : ''}
                        onClick={() => setView('components')}
                    >
                        Components
                    </button>
                    <button
                        onClick={handleCopy}
                        style={{
                            background: copied ? '#10b981' : '',
                            color: copied ? 'white' : '',
                            borderColor: copied ? '#10b981' : '',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {copied ? '✓ Copied!' : 'Copy Code'}
                    </button>
                </div>

                {view === 'preview' && (
                    <div className="responsive-controls">
                        <button onClick={() => setPreviewWidth('100%')} title="Desktop (Full)">🖥️</button>
                        <button onClick={() => setPreviewWidth('1024px')} title="Laptop">💻</button>
                        <button onClick={() => setPreviewWidth('768px')} title="Tablet">📱</button>
                        <button onClick={() => setPreviewWidth('375px')} title="Mobile">📲</button>
                    </div>
                )}
            </div>

            <div className="result-content" style={{ display: 'flex', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
                {view === 'preview' ? (
                    <iframe
                        title="Preview"
                        srcDoc={code}
                        style={{
                            width: previewWidth,
                            height: '600px',
                            border: 'none',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            transition: 'width 0.3s ease'
                        }}
                    />
                ) : view === 'code' ? (
                    <div style={{ width: '100%', maxHeight: '600px', overflow: 'auto', borderRadius: '8px', border: '1px solid #334155' }}>
                        <SyntaxHighlighter
                            language="html"
                            style={vscDarkPlus}
                            showLineNumbers
                            customStyle={{ margin: 0, width: '100%', minWidth: '100%' }}
                            wrapLines={true}
                        >
                            {code}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <div style={{ width: '100%', maxHeight: '600px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #334155' }}>
                        <ComponentPreview components={components} designTokens={designTokens} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultView;
