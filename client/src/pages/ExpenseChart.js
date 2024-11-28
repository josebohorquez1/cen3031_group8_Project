import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = () => {
    const [error, setError] = useState("");
    const [chartData, setChartData] = useState({});
    const [expenses, setExpenses] = useState([]); // New state to hold expenses

    // Function to generate chart data from expenses
    const generateChartData = (expenses) => {
        const categories = {};
        expenses.forEach((expense) => {
            if (categories[expense.category]) {
                categories[expense.category] += expense.amount;
            } else {
                categories[expense.category] = expense.amount;
            }
        });

        const chartLabels = Object.keys(categories);
        const chartAmounts = Object.values(categories);

        return {
            labels: chartLabels,
            datasets: [{
                data: chartAmounts,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#f77477', '#c9c9c9'],
                borderColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#f77477', '#c9c9c9'],
                borderWidth: 1,
            }],
        };
    };

    useEffect(() => {
        fetch('http://localhost:5000/expenses', {
            method: 'GET',
            credentials: 'include', // Important to send cookies with the request
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.expenses) {
                    setExpenses(data.expenses);
                        const chartDataSet = generateChartData(data.expenses);
                        setChartData(chartDataSet);
                            } else if (data.message) {
                    setError(data.message);
                }
            }).catch((err) => {
                setError("Error fetching expenses.");
            });
    }, []);
    return (
        <div className="container">
            <h1>Expense Category Chart</h1>
            {error && <div className="alert alert-danger">{error}</div>}
                    {expenses && <Pie data={chartData}/>}
        </div>
    );
};

export default ExpenseChart;
