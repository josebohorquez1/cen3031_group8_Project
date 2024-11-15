import 'bootstrap/dist/css/bootstrap.min.css';
    import { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const GoalPage = () => {
    const [profile, setProfile] = useState(null);
    const [description, setDescription] = useState("");
    const [goal_type, setGoalType] = useState("");
    const [category, setCategory] = useState("");
    const [target_amount, setTargetAmount] = useState(0);
    const [due_date, setDueDate] = useState("");
    const [error, setError] = useState("");
    const [show_modal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/profile", {
            method: 'GET',
            credentials: 'include'
        }).then((response) => response.json()).then((data) => {
            if(data.profile) {
                setProfile(data.profile);
            }
            else if (data.message) {
                setError(data.message);
            }
        }).catch((err) => {
            setError("Error fetching goals.");
        });
    }, [profile]);

    const handleAddGoal = async () => {
        if (target_amount < 1) {
            setError("Target amount to low.");
            return;
        }
        const data = {
            description: description,
            goal_type: goal_type,
            category: category,
            target_amount: target_amount,
            due_date: due_date
        };
        try {
            const response = await fetch("http://localhost:5000/add-goal", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                setError("Goal added sucessfully.");
                setDescription("");
                setGoalType("");
                setCategory("");
                setTargetAmount(0);
                setDueDate("");
                setShowModal(false);
                    }
            else {
                setError("Unable to add goal.");
            }
        }
        catch (error) {
            console.error('Error:', error);
            setError('Failed to process the request.');
        }
    };

    function convertDate(date_string) {
        const [year, month, day] = date_string.split('-');
        return `${month}/${day}/${year}`;
    }

    return (
        <div className='container-fluid'>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Back</button>
            <h1 className="text-center mb-4">Goals</h1>
            <p>Add or view your goals here.</p>
            {error &&<p className="text-danger">{error}</p>}
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Goal</button>
            {show_modal && (
                <div className="modal show" style={{ display: "block" }}>
                    <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">Add New Goal</h5>
                    <button type="button" className="close" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                    <div className="modal-body">
                        <div className='form-group'>
                        <label htmlFor='goal-type'>Goal Type</label>
                            <input
                                type="text"
                                className='form-control'
                                value={goal_type}
                                onChange={(e) => setGoalType(e.target.value)}
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label>Description</label>
                            <input
                                type="text"
                                className='form-control'
                                value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        />
                        </div>
            {goal_type === "savings" && (
                        <div className='form-group'>
                        <label htmlFor='select-category'>Select a balance for your goal.</label>
                        <select
                        className='form-control'
                        id='select-category'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        >
                            <option value="">-- Select Balance --</option>
                            {profile && profile.balances.map((balance, index) => (
                                <option key={index} value={balance.balance_type}>{balance.balance_type}</option>
                            ))}
                        </select>
                        </div>)}
                        {goal_type === "spending" && (
                        <div className='form-group'>
                        <label htmlFor='select-category'>Select a spending category for your goal.</label>
                        <select
                        id='select-category'
                        className='form-control'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        >
                            <option value="">-- Select Balance --</option>
                            {profile && Array.from(new Set(profile.expenses.map(expense => expense.category).filter(category => category !== "income" && category !== "transfer"))).map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                        </div>)}
                        <div className='form-group'>
                        <label>Target Amount</label>
                        <input
                        type='number'
                        className='form-control'
                        value={target_amount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        required
                        />
                        </div>
                        <div className='form-group'>
                        <label>Target Amount</label>
                        <input
                        type="date"
                        className='form-control'
                        value={due_date}
                        onChange={(e) => setDueDate(e.target.value)}
                        />
                        </div>
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={handleAddGoal} disabled={goal_type === ""}>Add Goal</button>
                    </div>
                    </div>
                    </div>
                </div>
            )}
            <main>
                {profile && profile.goals.length === 0 ? (
                    <h1>
                        <p>There are no goals to show here.</p>
                    <p>Click the "Add Goal" button to add a goal.</p>
                    </h1>
                ) : (
                    <table>
                        <thead>
                            <tr>
                            <th>Goal Type</th>
                            <th>Target Category</th>
                            <th>Description</th>
                            <th>Current Amount Towards Goal</th>
                            <th>Target Amount</th>
                            <th>Progress</th>
                            <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profile && profile.goals.map((goal, index) => (
                                <tr key={index}>
                                    <td>{goal.goal_type}</td>
                                    <td>{goal.category}</td>
                                    <td>{goal.description}</td>
                                    <td>${goal.current_amount}</td>
                                    <td>${goal.target_amount}</td>
                                    <td>
                                        <progress
                                        value={goal.current_amount}
                                        max={goal.target_amount}
                                        style={{ width: '100%' }}
                                        />
                                        <span>{goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0}%</span>
                                    </td>
                                    <td>{goal.due_date ? convertDate(goal.due_date) : 'No Due Date'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
};
export default GoalPage;