import {Routes, Route } from "react-router-dom";
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from "./pages/Signup";
import AboutUs from "./pages/AboutUs";
import Profile from "./pages/Profile";
import AddExpense from './pages/AddExpense';
import AddBalance from "./pages/AddBalance";
import GoalPage from './pages/GoalPage';
import UpdateProfile from './pages/UpdateProfile';
import Footer from "./pages/Footer";
import NotFound from "./pages/NotFound";
import SpendingReport from "./pages/SpendingReport";


const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/about" element={<AboutUs/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/add-expense" element={<AddExpense/>}/>
      <Route path="/add-balance" element={<AddBalance/>}/>
      <Route path="/goals" element={<GoalPage/>}/>
      <Route path="/update-profile" element={<UpdateProfile/>}/>
      <Route path="/spending-report" element={<SpendingReport/>}/>
      <Route path="*" element={<NotFound/>}/>
      <Route path="/chatbot" element={<Chatbot />} />
                </Routes>
    <Footer/>
    </div>
      );
};

export default App;
