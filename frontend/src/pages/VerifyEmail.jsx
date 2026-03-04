import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Determine API URL based on environment since we are outside the standard API client context here sometimes
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/auth/verify/${token}`);

                setStatus('success');
                setMessage(response.data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
            }
        };

        if (token) {
            verifyToken();
        } else {
            setStatus('error');
            setMessage('No verification token provided.');
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Email Verification
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">

                    {status === 'verifying' && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                            <p className="text-gray-600 text-lg">Verifying your email address...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <h3 className="text-xl font-medium text-gray-900">Verification Successful!</h3>
                            <p className="text-gray-600">{message}</p>
                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Proceed to Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <XCircle className="h-16 w-16 text-red-500" />
                            <h3 className="text-xl font-medium text-gray-900">Verification Failed</h3>
                            <p className="text-gray-600">{message}</p>
                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="text-indigo-600 hover:text-indigo-500"
                                >
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
