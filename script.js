// Массив для хранения фаз цикла по дням (1-28)
let cycleDays = new Array(28).fill(null);

// Цвета для фаз
const phaseColors = {
    menstruation: '#e74c3c',
    follicular: '#3498db',
    ovulation: '#f1c40f',
    luteal: '#2ecc71',
    none: '#ddd'
};

// Точный расчёт лунной фазы (по алгоритму Jean Meeus)
function getMoonPhase(date) {
    const synodicMonth = 29.53058867; // дней
    const baseDate = new Date(2001, 0, 6, 18, 14); // Новолуние 2001 года
    
    const diffDays = (date - baseDate) / (1000 * 60 * 60 * 24);
    const age = diffDays % synodicMonth;
    
    if (age < 1) return 'Новолуние';
    if (age < synodicMonth / 8) return 'Растущий серп';
    if (age < synodicMonth / 4) return 'Первая четверть';
    if (age < synodicMonth / 2) return 'Растущая луна';
    if (age < synodicMonth * 3 / 4) return 'Полнолуние';
    if (age < synodicMonth * 7 / 8) return 'Убывающая луна';
    if (age < synodicMonth) return 'Последняя четверть';
    
    return 'Новолуние';
}

// Функция обновления информации о луне и месяце
function updateMoonInfo() {
    const now = new Date();
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    document.getElementById('current-month').textContent = monthNames[now.getMonth()];
    document.getElementById('moon-phase').textContent = getMoonPhase(now);
}

// Функция добавления фазы цикла в текущий день (по модулю 28)
function addCycleDay() {
    const select = document.getElementById('cycle-phase');
    const phase = select.value;
    
    // Определяем "текущий день" цикла (от 0 до 27)
    const todayIndex = new Date().getDate() % 28 - 1;
    
    cycleDays[todayIndex] = phase;
    
    updateCycleChart();
}

// Функция обновления круговой диаграммы цикла
function updateCycleChart() {
    const ctx = document.getElementById('cycle-chart').getContext('2d');
    
    // Подсчёт количества дней для каждой фазы
    const counts = { menstruation: 0, follicular: 0, ovulation: 0, luteal: 0 };
    cycleDays.forEach(day => {
        if (day) counts[day]++;
    });
    
    const data = {
        labels: Object.keys(counts),
        datasets: [{
            data: Object.values(counts),
            backgroundColor: Object.keys(counts).map(key => phaseColors[key]),
            hoverOffset: 4
        }]
    };
    
    if (window.myChart) window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: { legend: { position: 'right' } }
        }
    });
}

// Функция обновления интерактивного календаря (круг из 28 дней)
function updateInteractiveCalendar() {
    const ctx = document.getElementById('interactive-chart').getContext('2d');
    
    // Удаляем старую диаграмму, если есть
    if (window.interactiveChart) window.interactiveChart.destroy();

    // Создаём данные для круговой диаграммы с 28 секторами
    const labels = Array.from({length: 28}, (_, i) => i + 1);
    
    window.interactiveChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: Array(28).fill(1), // Все сектора одинакового размера
                backgroundColor: cycleDays.map(day => phaseColors[day] || phaseColors.none),
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            rotation: -Math.PI / 2, // Начинаем с верхней точки
            circumference: Math.PI * 2,
            animation: { animateRotate: false }
        }
    });

    // Добавляем обработчик клика по секторам
    ctx.canvas.addEventListener('click', function(evt) {
        const activePoints = window.interactiveChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        
        if (activePoints.length > 0) {
            const dayIndex = activePoints[0].index; // Индекс дня (0-27)
            
            // Покажем селектор для выбора фазы прямо на месте или через prompt
            const selectedPhase = prompt(
                "Выберите фазу для дня " + (dayIndex + 1) + ":\n" +
                "menstruation - Менструация\n" +
                "follicular - Фолликулярная фаза\n" +
                "ovulation - Овуляция\n" +
                "luteal - Лютеиновая фаза\n" +
                "(или оставьте пустым для сброса)",
                cycleDays[dayIndex] || ''
            );
            
            if (selectedPhase === null) return; // Отмена

            const validPhases = ['menstruation', 'follicular', 'ovulation', 'luteal'];
            
            if (validPhases.includes(selectedPhase)) {
                cycleDays[dayIndex] = selectedPhase;
                updateInteractiveCalendar(); // Обновим календарь
                updateCycleChart();          // Обновим сводную диаграмму
            } else if (selectedPhase === '') {
                cycleDays[dayIndex] = null;
                updateInteractiveCalendar();
                updateCycleChart();
            } else {
                alert("Неверный ввод. Используйте только указанные значения.");
            }
        }
    });
}

// Инициализация при загрузке страницы
window.onload = function() {
    updateMoonInfo();
    
    // Загрузка из localStorage, если есть сохранённые данные
    const savedCycle = localStorage.getItem('cycleDays');
    if (savedCycle) {
        cycleDays = JSON.parse(savedCycle);
        updateInteractiveCalendar();
        updateCycleChart();
        
        // Если сегодня уже отмечен — выделим его в интерактивном календаре
        const todayIndex = new Date().getDate() % 28 - 1;
        if (cycleDays[todayIndex]) {
            alert("Сегодня — день " + (todayIndex + 1) + " цикла. Фаза отмечена.");
        }
        
        setTimeout(() => {
          const el = document.querySelector('.interactive-calendar');
          el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
        
      }
};

// Сохранение данных при закрытии/обновлении страницы
window.addEventListener('beforeunload', () => {
   localStorage.setItem('cycleDays', JSON.stringify(cycleDays));
});
