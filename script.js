// Массив для хранения фаз цикла по дням (1-28)
let cycleDays = new Array(28).fill(null);

// Цвета для фаз
const phaseColors = {
    menstruation: '#e74c3c',
    follicular: '#3498db',
    ovulation: '#f1c40f',
    luteal: '#2ecc71'
};

// Функция обновления информации о луне и месяце
function updateMoonInfo() {
    const now = new Date();
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    document.getElementById('current-month').textContent = monthNames[now.getMonth()];
    
    // Простая аппроксимация фазы луны (для примера)
    const age = Math.floor((now - new Date(2001, 0, 6)) / (1000 * 60 * 60 * 24)) % 29.53;
    let phase = '';
    if (age < 1) phase = 'Новолуние';
    else if (age < 7.38) phase = 'Растущая луна';
    else if (age < 14.77) phase = 'Полнолуние';
    else if (age < 22.15) phase = 'Убывающая луна';
    else phase = 'Новолуние';
    
    document.getElementById('moon-phase').textContent = phase;
}

// Функция добавления фазы цикла в текущий день (по модулю 28)
function addCycleDay() {
    const select = document.getElementById('cycle-phase');
    const phase = select.value;
    
    // Определяем "текущий день" цикла (от 0 до 27)
    const todayIndex = new Date().getDate() % 28 - 1;
    
    cycleDays[todayIndex] = phase;
    
    updateChart();
}

// Функция обновления круговой диаграммы
function updateChart() {
    const ctx = document.getElementById('cycle-chart').getContext('2d');
    
    // Подсчёт количества дней для каждой фазы
    const counts = { menstruation: 0, follicular: 0, ovulation: 0, luteal: 0 };
    cycleDays.forEach(day => {
        if (day) counts[day]++;
    });
    
    // Данные для диаграммы
    const data = {
        labels: Object.keys(counts),
        datasets: [{
            data: Object.values(counts),
            backgroundColor: Object.keys(counts).map(key => phaseColors[key]),
            hoverOffset: 4
        }]
    };
    
    // Удаляем старую диаграмму, если есть
    if (window.myChart) window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                tooltip: { enabled: true }
            }
        }
    });
}

// Инициализация при загрузке страницы
window.onload = function() {
    updateMoonInfo();
};
