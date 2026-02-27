"use client";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
);

const spendingCategories = [
    { name: "Housing", amount: 2100, color: "#C4704B" },
    { name: "Food & Dining", amount: 780, color: "#7A8B6F" },
    { name: "Transportation", amount: 520, color: "#C4A04B" },
    { name: "Shopping", amount: 440, color: "#8B6F5C" },
    { name: "Utilities", amount: 280, color: "#A3B398" },
    { name: "Health", amount: 220, color: "#B85C5C" },
    { name: "Entertainment", amount: 180, color: "#E8A988" },
    { name: "Other", amount: 380, color: "#9B9590" },
];

const trendMonths = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
const trendData = {
    Housing: [2100, 2100, 2100, 2100, 2100, 2100],
    "Food & Dining": [650, 720, 810, 890, 750, 780],
    Transportation: [480, 510, 490, 560, 530, 520],
};

export function DonutChart() {
    const data = {
        labels: spendingCategories.map((c) => c.name),
        datasets: [
            {
                data: spendingCategories.map((c) => c.amount),
                backgroundColor: spendingCategories.map((c) => c.color),
                borderWidth: 2,
                borderColor: "#FFFFFF",
                hoverBorderWidth: 3,
                hoverOffset: 6,
            },
        ],
    };

    const options = {
        cutout: "68%",
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#2C2825",
                titleFont: { family: "Inter", size: 12 },
                bodyFont: { family: "Inter", size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => ` $${ctx.raw.toLocaleString()}`,
                },
            },
        },
        animation: {
            animateRotate: true,
            duration: 1200,
            easing: "easeOutQuart",
        },
    };

    return (
        <div className="donut-container">
            <div className="donut-chart-wrap">
                <Doughnut data={data} options={options} />
            </div>
            <div className="donut-legend">
                {spendingCategories.map((cat) => (
                    <div className="legend-item" key={cat.name}>
                        <span className="legend-dot" style={{ background: cat.color }} />
                        <span className="legend-label">{cat.name}</span>
                        <span className="legend-amount">${cat.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TrendsChart() {
    const colors = ["#C4704B", "#7A8B6F", "#C4A04B"];
    const categories = Object.keys(trendData);

    const data = {
        labels: trendMonths,
        datasets: categories.map((cat, i) => ({
            label: cat,
            data: trendData[cat],
            borderColor: colors[i],
            backgroundColor: "transparent",
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: colors[i],
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            tension: 0.35,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 20,
                    font: { family: "Inter", size: 11 },
                    color: "#6B6560",
                },
            },
            tooltip: {
                backgroundColor: "#2C2825",
                titleFont: { family: "Inter", size: 12 },
                bodyFont: { family: "Inter", size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) =>
                        ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: "Inter", size: 11 }, color: "#9B9590" },
                border: { display: false },
            },
            y: {
                grid: { color: "#F3F0EC" },
                ticks: {
                    font: { family: "Inter", size: 11 },
                    color: "#9B9590",
                    callback: (val) => `$${val.toLocaleString()}`,
                    maxTicksLimit: 5,
                },
                border: { display: false },
                beginAtZero: false,
                suggestedMin: 400,
            },
        },
        animation: { duration: 1000, easing: "easeOutQuart" },
    };

    return (
        <div className="trends-chart-wrap">
            <Line data={data} options={options} />
        </div>
    );
}
