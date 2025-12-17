import React, { useState } from 'react';
import axios from 'axios';

const CopilotAssistant = ({ code, onCodeUpdate }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleRefine = async () => {
        if (!prompt.trim() || !code) return;

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/convert/refine', {
                code,
                prompt
            });

            if (response.data.html) {
                onCodeUpdate(response.data.html);
                setPrompt('');
                setIsOpen(false); // Close after success
            }
        } catch (error) {
            console.error('Refinement failed:', error);
            alert('Failed to refine code. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="copilot-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                        cursor: 'pointer',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ✨
                </button>
            )}

            {isOpen && (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    width: '350px',
                    padding: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>✨ AI Copilot</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                        >
                            ×
                        </button>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Make the background dark blue..."
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            marginBottom: '15px',
                            resize: 'none',
                            fontFamily: 'inherit'
                        }}
                    />

                    <button
                        onClick={handleRefine}
                        disabled={loading || !prompt.trim()}
                        style={{
                            width: '100%',
                            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginBottom: 0 }}></div>
                                Refining...
                            </div>
                        ) : 'Update Code'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CopilotAssistant;
