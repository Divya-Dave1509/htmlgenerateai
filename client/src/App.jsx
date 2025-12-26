import React, { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import ResultView from './components/ResultView';
import './index.css';

function App() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState('light');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleConversionStart = () => {
        setResult(null);
        setError(null);
        setLoading(true);
    };

    const handleConversionSuccess = (data) => {
        setResult(data);
        setLoading(false);
    };

    const handleConversionError = (msg) => {
        setError(msg);
        setLoading(false);
    };

    return (
        <div className="app-container">
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <header>
                <h1>htmlgenerate.ai</h1>
                <p>Convert designs to clean, responsive HTML/CSS</p>
            </header>

            <main>
                <div className="layout">
                    <div className="sidebar">
                        <UploadZone
                            onConversionStart={handleConversionStart}
                            onConversionSuccess={handleConversionSuccess}
                            onConversionError={handleConversionError}
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="main-content">
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <div className="loading-text">Generating your code...</div>
                            </div>
                        ) : result ? (
                            <ResultView result={result} setResult={setResult} />
                        ) : (
                            <div className="placeholder">
                                <p>Upload a design to see the result here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
