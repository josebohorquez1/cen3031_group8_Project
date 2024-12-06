import React, { useState, useEffect } from 'react';

const Chatbot = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);

    // Fetching user profile
    useEffect(() => {
        fetch('http://localhost:5000/profile', {
            method: 'GET',
            credentials: 'include', // Send cookies with the request
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.profile) {
                    setProfile(data.profile);
                } else {
                    setError('Error loading profile data.');
                }
            })
            .catch(() => setError('Error fetching profile.'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile) {
            setError('Profile data not loaded. Please try again later.');
            return;
        }

        setLoading(true);
        setResponse('');
        setError('');

        try {
            const res = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ question, profile }), // Include profile data
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to get response from the server.');
            }

            const data = await res.json();
            setResponse(data.answer);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Chat with Financial Assistant</h1>
            {error && (
                <div className="alert alert-danger">
                    <p>{error}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="mb-3">
                <div className="mb-3">
                    <label htmlFor="question" className="form-label">Ask a question:</label>
                    <input
                        type="text"
                        id="question"
                        className="form-control"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question here"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Loading...' : 'Ask'}
                </button>
            </form>
            {response && (
                <div className="alert alert-success">
                    <h5>Response:</h5>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
