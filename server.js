const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cors_options = {
    origin: 'http://localhost:3000',
    credentials: true,
};
const User = require('./users');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors(cors_options));
app.use(express.json());

//MongoDB Connect
const dbURI = "mongodb+srv://BryanG156:Brohood156@cen3031budgetbuddy.kumw8.mongodb.net/?retryWrites=true&w=majority&appName=CEN3031BudgetBuddy"
mongoose.connect(dbURI)
    .then((result) => console.log("Connected to DB"))
    .catch((err)=> console.log(err));

app.get('/', (req, res) => {res.send("Welcome to the project!");});
const bcrypt = require('bcrypt');
const salt_rounds = 10;
app.post('/signup', (req, res) => {
    console.log("Received request for signup:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }
    User.findOne({ email: email }).then(user => {
        if (user) {
            res.status(400).json({ error: "User with this email already exists." });
        }
        else {
            bcrypt.hash(password, salt_rounds, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to hash password." });
                }
                const newUser = new User({
                    email,
                    password: hash
                });
                newUser.save().then((result) => res.status(201).json(result)).catch((err) => {
                    console.error("Error saving user:", err);
                    res.status(500).json({ error: "Failed to create user."});
                });
                });
            }
    }).catch((err) => res.status(500).json({ error: "Error checking existing user." }));
});
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.post('/login', (req, res) => {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }
    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(400).json({ error: "User with this email does not exist." });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Password comparison error." });
            }
            if (result) {
                const session_options = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict'//Prevents cookies from being sent from different websites.
                };
                if (rememberMe) {
                    session_options.maxAge = 14 * 24 * 60 * 60 * 1000;
                }
                res.cookie('user_email', email, session_options);
                res.status(200).json({ message: "Login successful" });
            }
            else {
                res.status(400).json({ error: "Invalid email or password." });
            }
        });
}).catch((err) => {
    console.error("Error finding user:", err);
    res.status(500).json({ error: "Server error" });
});
});
app.post("/logout", (req, res) => {
    res.clearCookie('user_email', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.status(200).json({ message: "Logout successful." });
});
app.get('/user', (req, res) => {
    const user_email = req.cookies.user_email;
    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    User.findOne({email: user_email}).then(user => {
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: user });
    }).catch(err => {
        res.status(500).json({ message: 'Error fetching profile', err });
    });
});
app.get('/profile', (req, res) => {
    const user_email = req.cookies.user_email;
    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    User.findOne({email: user_email}).select('email profile').then(user => {
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ profile: user.profile });
    }).catch(err => {
        res.status(500).json({ message: 'Error fetching profile', err });
    });
});
app.get("/checkout-session", (req, res) => {
    const user_email = req.cookies.user_email;
    if (!user_email) {
        return res.status(401).json({ is_loggedin: false, message: "No active session." });
    }
    User.findOne({email: user_email}).then((user) => {
        if (!user) {
            return res.status(401).json({ is_loggedin: false, message: "Invalid session." });
        }
        res.status(200).json({ is_loggedin: true, message: "Logged in successfully." });
    }).catch((err) => {
        console.error("Error verifying session:", err);
        res.status(500).json({ is_loggedin: false, message: "Server error." });
    });
});
app.post('/onboarding', (req, res) => {
    const {first_name, last_name, balances, budget} = req.body;
    const user_email = req.cookies.user_email;
    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    User.findOneAndUpdate({email: user_email}, {
        profile: {
            first_name,
            last_name,
            balances: {
                balance_type: "Main Balance",
                amount: balances.amount
            },
            budget: {
                amount: budget.amount,
                last_set: Date.now()
            }
        }
    }, {new: true}).then((updated_user) => {
        if (!updated_user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    }).catch(err => {
        res.status(500).json({ message: 'Error updating profile', err });
    });
});
app.post('/add-expense', (req, res) => {
    const {category, description, amount} = req.body;
    const user_email = req.cookies.user_email;
    if (amount < 1) {
        return res.status(400).json({ error: "Amount must be greater than or equal to 1." });
    }
    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    User.findOneAndUpdate({email: user_email, "profile.balances.balance_type": "Main Balance"}, {
        $push: {
            "profile.expenses": {
                category,
                amount,
                date: Date.now(),
                description,
            }
        }, 
        $inc: {
            "profile.balances.$.amount": -amount,
            "profile.budget.amount": -amount
        }
    }, {new: true}).then((updated_user) => {
        if (!updated_user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'Expense added successfully!' });
    }).catch (error => {
        console.error(error);
        res.status(500).json({ message: 'Error adding expense', error });
    });
});
app.post("/update-balance", (req, res) => {
    const { balance_type, category, description, amount } = req.body;
    const user_email = req.cookies.user_email;

    if (amount < 1) {
        return res.status(400).json({ error: "Amount must be greater than or equal to 1." });
    }

    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // If balance_type is "Main Balance", just increase it
    if (balance_type === "Main Balance") {
        User.findOneAndUpdate(
            { email: user_email, "profile.balances.balance_type": "Main Balance" },
            {
                $push: {
                    "profile.expenses": {
                        category,
                        amount,
                        date: Date.now(),
                        description,
                    }
                },
                $inc: {
                    "profile.balances.$.amount": amount,  // Increment Main Balance
                }
            },
            { new: true }
        ).then((updated_user) => {
            if (!updated_user) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'Balance updated successfully!' });
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'Error updating balance', error });
        });
    } else {
        // Check if Main Balance will be less than 0 after decrementing
        User.findOne({ email: user_email, "profile.balances.balance_type": "Main Balance" })
            .then((user) => {
                if (!user) return res.status(404).json({ message: 'User not found' });

                const mainBalance = user.profile.balances.find(b => b.balance_type === "Main Balance").amount;

                if (mainBalance - amount < 0) {
                    // If the main balance would be negative after the decrement, return an error
                    return res.status(400).json({ message: 'Insufficient funds in Main Balance' });
                }

                // Decrement Main Balance by amount
                return User.findOneAndUpdate(
                    { email: user_email, "profile.balances.balance_type": "Main Balance" },
                    {
                        $inc: { "profile.balances.$.amount": -amount }  // Decrease Main Balance by amount
                    },
                    { new: true }
                );
            })
            .then((user) => {
                if (!user) return res.status(404).json({ message: 'User not found' });

                // Now increment the selected balance by the specified amount
                return User.findOneAndUpdate(
                    { email: user_email, "profile.balances.balance_type": balance_type },
                    {
                        $push: {
                            "profile.expenses": {
                                category,
                                amount,
                                date: Date.now(),
                                description,
                            }
                        },
                        $inc: {
                            "profile.balances.$.amount": amount,  // Increment the specified balance
                        }
                    },
                    { new: true }
                );
            })
            .then((updated_user) => {
                if (!updated_user) return res.status(404).json({ message: 'User not found' });
                res.status(200).json({ message: 'Balance updated successfully!' });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ message: 'Error updating balance', error });
            });
    }
});
app.post("/add-balance", (req, res) => {
    const { balance_type, category, description, amount } = req.body;
    const user_email = req.cookies.user_email;

    if (amount < 1) {
        return res.status(400).json({ error: "Amount must be greater than or equal to 1." });
    }

    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user by email
    User.findOne({ email: user_email }).then((user) => {
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get the current main balance
        const mainBalance = user.profile.balances.find(b => b.balance_type === "Main Balance");

        // Check if the main balance is sufficient
        if (!mainBalance || mainBalance.amount < amount) {
            return res.status(400).json({ error: 'Insufficient funds in Main Balance.' });
        }

        // Ensure Main Balance will not drop below zero after decrementing
        if (mainBalance.amount - amount < 0) {
            return res.status(400).json({ error: 'Main Balance will be negative after this transaction.' });
        }

        // Proceed with decrementing the main balance
        const updatedBalances = user.profile.balances.map(b => {
            if (b.balance_type === "Main Balance") {
                b.amount -= amount; // Decrement main balance by the amount
            }
            return b;
        });

        // Check if the specified balance already exists and increment it, or create a new one
        const existingBalance = user.profile.balances.find(b => b.balance_type === balance_type);
        if (existingBalance) {
            existingBalance.amount += amount; // Increment the existing balance
        } else {
            updatedBalances.push({
                balance_type,
                amount  // Add the new balance
            });
        }

        // Add the expense entry
        const updatedExpenses = [...user.profile.expenses, {
            category,
            amount,
            date: Date.now(),
            description
        }];

        // Update the user document with new balances and expenses
        User.findOneAndUpdate(
            { email: user_email },
            {
                "profile.balances": updatedBalances,
                "profile.expenses": updatedExpenses
            },
            { new: true }
        ).then(updated_user => {
            if (!updated_user) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'Balance and expense added successfully!' });
        }).catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Error adding balance or expense', error });
        });

    }).catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user', error });
    });
});
app.post("/add-goal", (req, res) => {
    const {description, goal_type, category, target_amount, due_date} = req.body;
    user_email = req.cookies.user_email;
    if (target_amount < 1) {
        return res.status(400).json({ error: "Goal amount must be greater than or equal to 1." });
    }
    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    User.findOneAndUpdate({email: user_email}, {
        $push: {
            "profile.goals": {
                description,
                goal_type,
                category,
                current_amount: 0,
                target_amount,
                goal_progress: 0,
                due_date
            }
        }, 
    }, {new: true}).then((updated_user) => {
        if (!updated_user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'Goal added successfully!' });
    }).catch (error => {
        console.error(error);
        res.status(500).json({ message: 'Error adding goal', error });
    });
});

app.post("/update-profile", async (req, res) => {
    const {first_name, last_name, email, new_password, current_password} = req.body;
    user_email = req.cookies.user_email;
    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await User.findOne({email: user_email});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const password_matches = await bcrypt.compare(current_password, user.password);
        if (!password_matches) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }
        const has_new_info = (
            (first_name && first_name !== user.profile.first_name) ||
            (last_name && last_name !== user.profile.last_name) ||
            (email && email !== user.email) ||
            (new_password && !(await bcrypt.compare(new_password, user.password)))
        );
        if (!has_new_info) {
            return res.status(400).json({ message: 'No new information to update' });
        }
        if (first_name && first_name !== user.profile.first_name) user.profile.first_name = first_name;
        if (last_name && last_name !== user.profile.last_name) user.profile.last_name = last_name;
        if (email && email !== user.email) {
            const check_email = await User.findOne({email: email});
            if (check_email) return res.status(400).json({ message: 'Email is already in use' });
            user.email = email;
            const session_options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'//Prevents cookies from being sent from different websites.
            };
        res.cookie('user_email', email, session_options);
        }
        if (new_password && !(await bcrypt.compare(new_password, user.password))) user.password = await bcrypt.hash(new_password, salt_rounds);
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user });
    }
    catch(err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

app.post("/update-goals", (req, res) => {
    const {amountGoal, goalType} = req.body;
    const user_email = req.cookies.user_email;

    if (amountGoal < 1) {
        return res.status(400).json({ error: "Amount must be greater than or equal to 1." });
    }

    if (!user_email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user by email
    User.findOne({ email: user_email }).then((user) => {
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get the current main balance
        const currGoal = user.profile.goals.findIndex(b => b.goal_type === goalType);

        if (currGoal === -1) {
            return res.status(404).json({ message: "Goal not found" });
        }
        //Checks if goal was met
        if(+user.profile.goals[currGoal].current_amount === +user.profile.goals[currGoal].target_amount){
            return res.status(404).json({ message: "Goal status has been met" });
        }
        //Check if goal will overlap.
        if((+user.profile.goals[currGoal].current_amount + +amountGoal) >= +user.profile.goals[currGoal].target_amount){
            user.profile.goals[currGoal].current_amount = +user.profile.goals[currGoal].target_amount;
        }
        else {
            let tempCurrA = user.profile.goals[currGoal].current_amount;
            let tempSum = +tempCurrA + +amountGoal;
            user.profile.goals[currGoal].current_amount = tempSum;
        }
        //currGoal.current_amount += amountGoal;

        // Check if the main balance is sufficient
        /*
        if (!mainBalance || mainBalance.amount < amount) {
            return res.status(400).json({ error: 'Insufficient funds in Main Balance.' });
        }
        */

        // Add the expense entry
        /* Add Goal update entry !!!!
        const updatedExpenses = [...user.profile.expenses, {
            category,
            amount,
            date: Date.now(),
            description
        }];
        */

        // Update the user document with new balances and expenses
        User.findOneAndUpdate(
            { email: user_email },
            {
                "profile.goals": user.profile.goals
            },
            { new: true }
        ).then(updated_user => {
            if (!updated_user) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'Goal Amount Added Successfully!' });
        }).catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Error adding amount to Goal.', error });
        });

    }).catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user', error });
    });
});



app.delete("/delete-account", async (req, res) => {
    const {current_password} = req.body;
    const user_email = req.cookies.user_email;
    if (!user_email) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const user = await User.findOne({email: user_email});
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!current_password) return res.status(400).json({ message: 'Current password is required' });
        const match_password = await bcrypt.compare(current_password, user.password);
        if (!match_password) return res.status(400).json({ message: 'Incorrect current password' });
        const delete_result = await User.deleteOne({email: user_email});
        if (delete_result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
        res.clearCookie('user_email', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        res.status(200).json({ message: 'Account deleted successfully' });
    }
    catch(err) {
        console.error("Error deleting account:", err);
        res.status(500).json({ message: 'Error deleting account', error: err.message });
    }
});

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
