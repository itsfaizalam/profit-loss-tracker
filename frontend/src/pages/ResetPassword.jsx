import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            await API.put(`/api/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
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
                        <Lock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Choose a strong password for your account
                    </p>
                </div>

                {success ? (
                    <div className="mt-8 space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Password Reset Successful</h3>
                            <p className="text-sm">
                                Redirecting you to the login page...
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:ring-offset-gray-900 shadow-md hover:shadow-lg"
                        >
                            Go to Login Now
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
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoFocus
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className={`appearance-none rounded-lg relative block w-full px-3 py-2 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors ${confirmPassword && password !== confirmPassword
                                        ? 'border-red-300 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                                )}
                            </div>
                        </div>

                        {password && (
                            <div className="space-y-1 mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${password.length >= i * 3
                                            ? i <= 2 ? 'bg-amber-400' : 'bg-emerald-400'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                            }`} />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {password.length < 6 ? 'Too short' : password.length < 9 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                                </p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || (confirmPassword && password !== confirmPassword)}
                                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors dark:ring-offset-gray-900 shadow-md hover:shadow-lg"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
