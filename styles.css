// --- НАСТРОЙКИ ---
const PHASES = {
    menstruation: { name: 'Менструация', color: '#e74c3c' },
    follicular:   { name: 'Фолликулярная', color: '#3498db' },
    ovulation:    { name: 'Овуляция', color: '#f1c40f' },
    luteal:       { name: 'Лютеиновая', color: '#2ecc71' },
};
const CYCLE_DAYS = 28; // Длительность цикла в днях

// --- СОСТОЯНИЕ ---
let cycleDays = new Array(CYCLE_DAYS).fill(null); // Массив фаз для каждого дня (0-27)
let interactiveChart = null;
let summaryChart = null;

// --- ФУНКЦИИ РАБОТЫ С ЛУНОЙ ---
function getMoonPhase(date) {
    const synodicMonth = 29.53058867;
    const baseDate = new Date(2001, 0, 6, 18, 14);

    const diff = date - baseDate;
    const age = (diff / (1000 * 60 * 60 * 24)) % synodicMonth;

    if (age < synodicMonth / 8) return 'Растущий серп';
    if (age < synodicMonth / 4) return 'Первая четверть';
    if (age < synodicMonth / 2) return 'Растущая луна';
    if (age < synodicMonth * 3 / 4) return 'Полнолуние';

    return 'Убывающая луна';
}

function updateMoonInfo() {
    const now = new Date();
    
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    document.getElementById('current-month').textContent = months[now.getMonth()];
    
    // День лунного календаря (относительно новолуния)
    const baseDate = new Date(2001, 0, 6);
    const diffDays = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
    const lunarDay = ((diffDays % CYCLE_DAYS) + CYCLE_DAYS) % CYCLE_DAYS + 1; // Приводим к диапазону 1-28

    document.getElementById('lunar-day').textContent = lunarDay;
    
    // Фаза луны
    document.getElementById('moon-phase').textContent = getMoonPhase(now);
}

// --- ФУНКЦИИ ГРАФИКОВ ---
function destroyChart(chartRef) {
   if (chartRef) {
       chartRef.destroy();
   }
}

function updateSummaryChart() {
   const ctx = document.getElementById('summary-chart').getContext('2d');
   destroyChart(summaryChart);
   
   const counts = { menstruation: 0, follicular: 0, ovulation: 0, luteal: 0 };
   cycleDays.forEach(day => day && counts[day]++);
   
   summaryChart = new Chart(ctx, {
       type: 'doughnut',
       data: {
           labels: Object.values(PHASES).map(p => p.name),
           datasets: [{
               data: [counts.menstruation, counts.follicular, counts.ovulation, counts.luteal],
               backgroundColor: Object.values(PHASES).map(p => p.color),
               hoverOffset: 8,
               borderWidth: 2,
               borderColor: '#fff'
           }]
       },
       options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: {
               legend: { position: 'right' },
               tooltip: { enabled: true }
           }
       }
   });
}


function updateInteractiveCalendar() {
   const ctx = document.getElementById('interactive-chart').getContext('2d');
   destroyChart(interactiveChart);
   
   const labels = Array.from({length: CYCLE_DAYS}, (_, i) => i + 1);
   
   interactiveChart = new Chart(ctx, {
       type: 'pie',
       data: {
           labels: labels,
           datasets: [{
               data: Array(CYCLE_DAYS).fill(1),
               backgroundColor: cycleDays.map(day => day ? PHASES[day].color : '#ddd'),
               borderWidth: 1,
               borderColor: '#fff'
           }]
       },
       options: {
           responsive: true,
           maintainAspectRatio: false,
           rotation: -Math.PI / 2,
           circumference: Math.PI * 2,
           plugins: { legend: { display: false } },
           animation: { animateRotate: false }
       }
   });
   
   // --- ОБРАБОТЧИК КЛИКА ПО ДНЯМ ---
   ctx.canvas.addEventListener('click', function(evt) {
       const activePoints = interactiveChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
       
       if (activePoints.length > 0) {
           const dayIndex = activePoints[0].index; // Номер сектора (от 0 до CYCLE_DAYS-1)
           
           // Создаем меню выбора фазы прямо на странице для удобства
           let menuHtml = `<div style="
                position: fixed;
                top: calc(50% - 150px);
                left: calc(50% - 150px);
                background:#fff;
                padding:25px;
                border-radius:15px;
                box-shadow:0 15px 40px rgba(0,0,0,0.3);
                z-index:9999;
                width:${window.innerWidth > 550 ? '350px' : '95vw'};
            ">
                <h3 style="margin-top:-15px; margin-bottom:-15px; font-size:${window.innerWidth > 550 ? '1.6rem' : '1.4rem'};">День ${dayIndex + 1}</h3>
                <p style="font-size:.9rem; color:#777;">Выберите текущую фазу:</p>
                
                ${Object.keys(PHASES).map(key => `
                    <button onclick="setPhase( ${dayIndex}, '${key}')" 
                            style="width:${window.innerWidth > 550 ? 'calc(50% - .7rem)' : '100%'}; padding:.8rem; margin-bottom:.7rem; border:none; border-radius:.5rem; background:${PHASES[key].color}; color:#fff; font-weight:bolder; cursor:pointer;">
                        ${PHASES[key].name}
                    </button>
                `).join('')}
                
                <button onclick="setPhase( ${dayIndex}, null)" 
                        style="width:${window.innerWidth > 550 ? 'calc(50% - .7rem)' : '100%'}; padding:.8rem; border:none; border-radius:.5rem; background:#ccc; color:#fff; font-weight:bolder; cursor:pointer;">Сбросить</button>
                
            </div>`;
           
           // Вставляем меню в body и убираем при клике вне его
           const menuDiv = document.createElement('div');
           menuDiv.innerHTML = menuHtml;
           menuDiv.id = "phase-menu";
           document.body.appendChild(menuDiv);
           
           // Закрытие меню при клике вне его границ
           window.addEventListener('click', function closeMenu(e) {
               if (!menuDiv.contains(e.target)) {
                   menuDiv.remove();
                   window.removeEventListener('click', closeMenu);
               }
           });
       }
   });
}


// --- ОСНОВНАЯ ЛОГИКА ---
function setPhase(dayIndex, phase) {
   cycleDays[dayIndex] = phase;
   
   // Обновляем оба графика сразу после изменения данных
   updateInteractiveCalendar();
   updateSummaryChart();
   
   // Убираем меню выбора фазы
   const menu = document.getElementById("phase-menu");
   if (menu) menu.remove();
   
   // Сохраняем данные в localStorage
   localStorage.setItem('cycleDays', JSON.stringify(cycleDays));
}


// --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
window.onload = function() {
   // Загрузка данных из памяти браузера
   const savedData = localStorage.getItem('cycleDays');
   if (savedData) {
      cycleDays = JSON.parse(savedData);
      updateMoonInfo(); // Обновим луну сразу с учетом данных цикла
      updateInteractiveCalendar();
      updateSummaryChart();
      
      // Прокрутка к календарю при загрузке, если есть данные за сегодня
      setTimeout(() => {
         const todayIndex = new Date().getDate() % CYCLE_DAYS - 1;
         if (todayIndex >= 0 && cycleDays[todayIndex]) {
            document.querySelector('.calendar').scrollIntoView({ behavior:'smooth' });
         }
      }, 5);
      
   } else {
      // Если данных нет, просто обновляем луну и создаем пустые графики
      updateMoonInfo();
      updateInteractiveCalendar();
      updateSummaryChart();
   }
};
