import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: 'Day 1', uv: 4000 },
    { name: 'Day 2', uv: 3000 },
    { name: 'Day 3', uv: 2000 },
    { name: 'Day 4', uv: 2780 },
    { name: 'Day 5', uv: 1890 },
    { name: 'Day 6', uv: 2390 },
    { name: 'Day 7', uv: 3490 },
];

export default function ChartComponent() {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="uv" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
