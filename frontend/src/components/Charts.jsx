import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Format tooltip currency values
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: ₹{Number(entry.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const CumulativeProfitChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>;

    return (
        <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="cumulativeProfit"
                        name="Cumulative Profit"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WinLossPieChart = ({ winCount, lossCount }) => {
    const data = [
        { name: 'Wins', value: winCount },
        { name: 'Losses', value: lossCount },
    ];

    const COLORS = ['#10b981', '#ef4444'];

    if (winCount === 0 && lossCount === 0) return <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">No trades yet</div>;

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', border: 'none', color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
