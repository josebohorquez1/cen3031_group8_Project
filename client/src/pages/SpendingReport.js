import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SpendingReport = () => {
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get('http://localhost:5000/spending-report', { withCredentials: true });
                setReport(response.data);
            } catch (err) {
                setError('Error fetching report. Please try again.');
            }
        };

        fetchReport();
    }, []);

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    if (!report) {
        return <p>Loading report...</p>;
    }

    return (
        <div className="container mt-5">
            <h1 className="text-center">Spending & Balance Report</h1>
            <p><strong>Total Income:</strong> ${report.totalIncome}</p>
            <p><strong>Total Amount Spent:</strong> ${report.totalSpent}</p>
            <h2>Spending by Category:</h2>
            <ul>
                {Object.entries(report.spendingByCategory).map(([category, amount]) => (
                    <li key={category}>{category}: ${amount}</li>
                ))}
            </ul>
            <h2>Recommendations:</h2>
            <ul>
                {report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
        </div>
    );
};

export default SpendingReport;
