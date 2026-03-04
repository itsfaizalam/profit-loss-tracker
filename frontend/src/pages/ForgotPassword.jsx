import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiUrl}/auth/forgot-password`, { email });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Forgot Password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email and we'll send a reset link
                    </p>
                </div>

                {submitted ? (
                    <div className="mt-8 space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Check your inbox</h3>
                            <p className="text-sm">
                                If <span className="font-semibold">{email}</span> is registered,
                                you'll receive a password reset link shortly.
                            </p>
                            <p className="mt-4 text-xs opacity-75">
                                (In development mode, the link is printed to the Node.js terminal)
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="group relative w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:ring-offset-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors dark:ring-offset-gray-900 shadow-md hover:shadow-lg"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/login" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
