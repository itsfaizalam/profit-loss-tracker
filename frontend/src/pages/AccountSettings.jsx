import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Save, AlertCircle, CheckCircle, Camera, Loader2 } from 'lucide-react';

const AccountSettings = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'

    // Profile State
    const [name, setName] = useState('');
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setName(user.name);
            if (user.profilePic) setProfilePicPreview(user.profilePic);
        }
    }, [user]);

    // Handle Profile Picture Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                setProfileMsg({ type: 'error', text: 'Image size must be less than 2MB' });
                return;
            }
            setSelectedFile(file);
            setProfilePicPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (selectedFile) {
                formData.append('profilePic', selectedFile);
            }

            const token = JSON.parse(localStorage.getItem('user'))?.token;

            const response = await API.put(`/api/users/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            updateUser({ name: response.data.name, profilePic: response.data.profilePic });
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
            setSelectedFile(null); // Reset file input
        } catch (err) {
            setProfileMsg({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        setSecurityLoading(true);
        setSecurityMsg({ type: '', text: '' });

        if (newPassword !== confirmNewPassword) {
            setSecurityMsg({ type: 'error', text: "New passwords don't match" });
            setSecurityLoading(false);
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;

            await API.put(`/api/users/password`, {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSecurityMsg({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setSecurityMsg({
                type: 'error',
                text: err.response?.data?.message || 'Failed to change password'
            });
        } finally {
            setSecurityLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center transition-colors ${activeTab === 'profile'
                            ? 'bg-gray-50 dark:bg-gray-900/50 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <User className="w-4 h-4 mr-2" /> Profile Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center transition-colors ${activeTab === 'security'
                            ? 'bg-gray-50 dark:bg-gray-900/50 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <Lock className="w-4 h-4 mr-2" /> Security & Password
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
                            {profileMsg.text && (
                                <div className={`p-4 rounded-md flex items-center ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {profileMsg.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                    {profileMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                                <div className="flex items-center space-x-6">
                                    <div className="relative group h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500">
                                        {profilePicPreview ? (
                                            <img src={profilePicPreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <User className="h-10 w-10" />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 w-full h-full bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Camera className="h-6 w-6 text-white mb-1" />
                                            <span className="text-white text-xs font-medium">Change</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/jpeg, image/png, image/webp"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p>Click image to upload new avatar.</p>
                                        <p>JPG, PNG, or WEBP. Max 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none rounded-lg block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address (Cannot be changed directly)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="appearance-none rounded-lg block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed sm:text-sm"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    {profileLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleSecuritySubmit} className="space-y-6 max-w-xl">
                            {securityMsg.text && (
                                <div className={`p-4 rounded-md flex items-center ${securityMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {securityMsg.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                    {securityMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="appearance-none rounded-lg block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="appearance-none rounded-lg block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="appearance-none rounded-lg block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={securityLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    {securityLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
