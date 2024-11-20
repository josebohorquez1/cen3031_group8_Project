import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
            <h1 className="display-1 fw-bold text-danger">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="lead mb-5">
                The page you are looking for does not exist or an error occurred.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;
