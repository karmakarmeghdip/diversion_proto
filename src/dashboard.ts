import { Chart, registerables } from 'chart.js';
import type { 
    ChartConfiguration,
    ChartType,
    ChartOptions,
    ChartData
} from 'chart.js';

Chart.register(...registerables);

interface DashboardData {
    activity: {
        days: string[];
        values: number[];
    };
    performance: {
        categories: string[];
        stats: number[];
        palette: string[];
    };
}

const initializeChart = <T extends ChartType>(
    canvasId: string, 
    config: ChartConfiguration<T>
): Chart<T> | null => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) {
        console.error(`Canvas element with id ${canvasId} not found`);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context from canvas');
        return null;
    }
    
    return new Chart<T>(ctx, config);
};

const graphData: DashboardData = {
    activity: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [12, 19, 7, 14, 10, 22, 30]
    },
    performance: {
        categories: ['Productivity', 'Breaks', 'Focus', 'Distractions'],
        stats: [80, 15, 70, 30],
        palette: ['#E11D48', '#FACC15', '#22C55E', '#3B82F6']
    }
};

const activityChartConfig: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
        labels: graphData.activity.days,
        datasets: [{
            label: 'User Engagement',
            data: graphData.activity.values,
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.15)' },
                ticks: { color: 'rgba(255, 255, 255, 0.85)' }
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.15)' },
                ticks: { color: 'rgba(255, 255, 255, 0.85)' }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.85)'
                }
            }
        }
    }
};

const performanceChartConfig: ChartConfiguration<'pie'> = {
    type: 'pie',
    data: {
        labels: graphData.performance.categories,
        datasets: [{
            data: graphData.performance.stats,
            backgroundColor: graphData.performance.palette,
            borderWidth: 1.2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'rgba(255, 255, 255, 0.85)',
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
};

const initializeNavbar = () => {
    const profileMenu = document.querySelector('.group-hover\\:block') as HTMLElement | null;
    if (profileMenu) {
        document.addEventListener('click', (event) => {
            if (!profileMenu.contains(event.target as Node)) {
                profileMenu.classList.add('hidden');
            }
        });
    }
};

const initializeButton = () => {
    const button = document.getElementById('session-btn');
    if (!button) {
        console.error('Session button not found');
        return;
    }

    button.addEventListener('click', () => {
        button.classList.add('scale-95');
        setTimeout(() => button.classList.remove('scale-95'), 180);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Dashboard...");

    const activityChart = initializeChart('activityChart', activityChartConfig);
    const performanceChart = initializeChart('performanceChart', performanceChartConfig);
    initializeButton();
    initializeNavbar();

    if (!activityChart) console.error('Failed to initialize activity chart');
    if (!performanceChart) console.error('Failed to initialize performance chart');
});
