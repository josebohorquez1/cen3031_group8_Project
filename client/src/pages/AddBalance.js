import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const AddBalance = () => {
    const [profile, setProfile] = useState(null);
    const [selected_balance, setSelectedBalance] = useState("");
    const [selected_goal, setGoalSelected] = useState("");
    const [balance_name, setBalanceName] = useState("");
    const [show_new_balance_input, setShowNewBalanceInput] = useState(false);
    const [show_goal_input, setShowGoalInput] = useState(false);
    const [amount, setAmount] = useState(0);
    const [goalA, setgoalA] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/profile', {
            method: 'GET',
            credentials: 'include', // Important to send cookies with the request
        }).then((response) => response.json()).then((data) => {
            if (data.profile) {
                setProfile(data.profile);
            }
            else if (data.message) {
                setError(data.message);
            }
        }).catch((err) => {
            setError("Error fetching profile.");

        });
    }, []);

    const handleSubmit = async () => {
        if(!selected_balance){
            setError("Error: Please select a Balance Option.");
            return;
        }

        if (amount < 1) {//check if amount is less than 1 and give error before submission. If this is the case, return to prevent submission.
            setError('Error: Amount must be greater than or equal to 1.');
            return;
        }
        if(selected_goal){
            if(goalA > amount){
                setError('Error: Goal amount must be less than or equal to the amount sent to main balance.')
                return;
            }
        }
        let data;
        let url;
        let urlGoals;
        if (show_new_balance_input) {
            if (!balance_name) {
                setError("Error: Balance name cannot be empty.");
                return;
            }
            url = "http://localhost:5000/add-balance";
            data = {
                balance_type: balance_name,
                category: "Transfer",
                description: `Transfer from main balance to ${balance_name}.`,
                amount: amount

            };
        }
        else {
            url = "http://localhost:5000/update-balance"
            data = {
                balance_type: selected_balance,
                category: "Income",
                amount: amount,
                description: "Update to Main balance",
                date: new Date(),
            };

    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include', // Important to send cookies with the request
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            if(!selected_goal){
                setError(show_new_balance_input ? 'Balance added successfully!' : 'Balance Updated Successfully!');
            }
            //clear the form fields after submission.
            setAmount(0);
            setBalanceName("");
            setGoalSelected("");
            setgoalA(0);
        }
        else {
            setError('Error: Could not update balance');
        }
    }
    catch (error) {
        console.error('Error:', error);
        setError('Failed to process the request.');
    }
        if(selected_goal){
            urlGoals = "http://localhost:5000/update-goals"
            try {
                const response = await fetch(urlGoals, {
                    method: 'POST',
                    credentials: 'include', // Important to send cookies with the request
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        goalType: selected_goal,
                        amountGoal: goalA
                    }),
                });
                if (response.ok) {
                    setError(show_new_balance_input ? 'Balance added successfully!' : 'Balance and goals updated successfully!');
                    //clear the form fields after submission.
                    setAmount(0);
                    setBalanceName("");
                    setGoalSelected("");
                    setgoalA(0);
                }
                else {
                    setError('Error: Could not update goal progress, please ensure the goal has not been met!');
                }
            }
            catch (error) {
                console.error('Error:', error);
                setError('Failed to process the request.');
            }
        }
};

return (
    <main className="container mt-5">
        <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Back</button>
        <h1 className="text-center mb-4">Add or update balance</h1>
        {error && <div role="alert" className="alert alert-danger">{error}</div>} {/* Display error message */}
        <p>If adding to "main balance", only that balance increases. If adding to or creating new balances, you will be
            transfering from your main balance. Your main balance is your overall balance.</p>
        <div className="form-group">
            <label htmlFor="balance-dropdown">Select Balance:</label>
            <select
                className='form-control"'
                id="balance-dropdown"
                value={selected_balance}
                onChange={(e) => {
                    const selected = e.target.value;
                    setSelectedBalance(selected);
                    setShowNewBalanceInput(selected === "add-new");
                    //setShowGoalInput(selected !== "add-new");
                }}
                required
                autoFocus
            >
                <option value="">-- Select Balance --</option>
                {profile && profile.balances.map((balance, index) => (
                    <option key={index} value={balance.balance_type}>{balance.balance_type}</option>
                ))}
                <option value="add-new">Add New Balance</option>
            </select>
            {show_new_balance_input && (
                <div>
                    <label htmlFor="new-balance-name">New Balance Name:</label>
                    <input
                        type="text"
                        id="new-balance-name"
                        className="form-control"
                        value={balance_name}
                        onChange={(e) => setBalanceName(e.target.value)}
                        required
                    />
                </div>
            )}
            {selected_balance && (<div>
                <label htmlFor="balance">Amount:</label>
                <input
                    type="number"
                    id="balance"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>)}


            {(selected_balance === "Main Balance" && !show_new_balance_input) && (<div>
                <label htmlFor="goal-dropdown">Select Goal (Optional):</label>
                <select
                    className='form-control"'
                    id="goal-dropdown"
                    value={selected_goal}
                    onChange={(e) => {
                        const selected_g = e.target.value;
                        setGoalSelected(selected_g);
                        setShowNewBalanceInput(selected_g === "add-new");
                    }}
                    required
                    autoFocus
                >
                    <option value="">-- Select Goal --</option>
                    {profile && profile.goals.map((goal, index) => (
                        <option key={index} value={goal.goal_type}>{goal.goal_type}</option>
                    ))}
                </select>
                {(selected_balance && !show_new_balance_input) && (<div>
                    <label htmlFor="balance">Amount Sent to Goal:</label>
                    <input
                        type="number"
                        id="goalAmount"
                        className="form-control"
                        value={goalA}
                        onChange={(e) => setgoalA(e.target.value)}
                        required
                    />
                </div>)}
            </div>)}
        </div>

        <button className="btn btn-primary mt-3"
                onClick={handleSubmit}>{show_new_balance_input ? 'Add New Balance' : 'Update Balance'}</button>
    </main>
)
}
export default AddBalance;