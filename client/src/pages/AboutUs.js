import 'bootstrap/dist/css/bootstrap.min.css';

const AboutUs = () => {
    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">About Us</h1>
            <div className="mb-5">
                <h2>CEN3031 Group 8</h2>
                <p><strong>Team Name:</strong> Budget Berserkers</p>
            </div>

            <div className="mb-5">
                <h2>Team Roles</h2>
                <ul>
                    <li><strong>Frontend:</strong> Desmond Arms</li>
                    <li><strong>Backend:</strong> Bryan Gonzalez, Krivi Chabra</li>
                    <li><strong>Full Stack:</strong> Jose Bohorquez</li>
                    <li><strong>Project Manager:</strong> Bryan Gonzalez, Krivi Chabra</li>
                    <li><strong>Github Manager:</strong> Jose Bohorquez</li>
                </ul>
            </div>

            <div className="mb-5">
                <h2>Challenge Statement Solution</h2>
                <p>
                    The challenge is to develop a tool that helps track users’ habits. One habit we all engage in every day is spending. We spend money on both necessities and wants, and in most cases, we overspend on wants leaving little for our necessities. In certain situations, it proves difficult to track our savings in correlation to the money we regularly use. This is where our spending tracker app can help. 
                </p>
                <p>
                    The spending tracker app helps the user gain an insight into their spending habits by offering a platform where they can record and categorize expenses. The application can help by revealing the spending pattern of the user, allowing them to better make informed decisions about their spending. The goal is to empower individuals with tools to increase financial literacy and improve budgeting practices.
                </p>
                <h3>Features:</h3>
                <ul>
                    <li>Expense categorization</li>
                    <li>Spending reports (weekly, monthly, yearly)</li>
                    <li>Budget tracking with alerts</li>
                    <li>Data visualization using charts and graphs</li>
                    <li>Secure user accounts with authentication</li>
                    <li>Goal setting for financial targets</li>
                </ul>
            </div>

        </div>
    );
};

export default AboutUs;
