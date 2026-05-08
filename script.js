// --- НАСТРОЙКИ И КОНСТАНТЫ ---
const PHASES = {
    menstruation: { name: 'Менструация', color: '#e74c3c' },
    follicular:   { name: 'Фолликулярная', color: '#3498db' },
    ovulation:    { name: 'Овуляция', color: '#f1c40f' },
    luteal:       { name: 'Лютеиновая', color: '#2ecc71' },
};
const CYCLE_DAYS = 28; // Длительность цикла в днях

// --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---
let cycleDays = new Array(CYCLE_DAYS).fill(null); // Массив фаз для каждого дня (0-27)
let interactiveChart = null;
let summaryChart = null;

// --- ФУНКЦИИ РАБОТЫ С ЛУНОЙ ---
function getMoonPhase(date) {
    // Алгоритм расчета лунной фазы (упрощенная модель)
    const synodicMonth = 29.53058867;
    const baseDate = new Date(2001, 0, 6, 18, 14); // Эталонное новолуние

    const diff = date - baseDate;
    const age = (diff / (1000 * 60 * 60 * 24)) % synodicMonth;

    if (age < 1) return 'Новолуние';
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
    
    // Находим ближайший день цикла к текущей дате
    const todayIndex = now.getDate() % CYCLE_DAYS - 1;
    
    // Если сегодня отмечен в цикле, показываем его фазу
    const currentPhase = cycleDays[todayIndex];
    
    let moonText = getMoonPhase(now);
    
    if (currentPhase) {
        moonText += `\n(Сегодня день ${todayIndex + 1} цикла — ${PHASES[currentPhase].name})`;
        document.getElementById('moon-phase').style.color = PHASES[currentPhase].color;
        document.getElementById('moon-phase').style.fontWeight = 'bold';
        document.getElementById('moon-phase').style.fontSize = '1.2rem';
        document.getElementById('moon-phase').style.lineHeight = '1.4';
        document.getElementById('moon-phase').style.whiteSpace = 'pre-wrap';
        document.getElementById('moon-phase').style.textAlign = 'center';
        document.getElementById('moon-phase').style.display = 'block'; // Для переноса строк
        document.getElementById('moon-phase').style.width = '100%';
        
        // Прокручиваем к календарю, если это первый запуск и есть отметка на сегодня
        if (!window.hasScrolledToCalendar && todayIndex >= 0 && currentPhase) {
            window.hasScrolledToCalendar = true;
            document.querySelector('.calendar').scrollIntoView({ behavior: 'smooth' });
        }
        
        // Прокручиваем к сводной диаграмме, если есть данные
        if (!window.hasScrolledToSummary && Object.values(cycleDays).filter(v => v).length > 5) {
            window.hasScrolledToSummary = true;
            document.querySelector('.summary').scrollIntoView({ behavior: 'smooth' });
        }
        
        
        

} else {
        document.getElementById('moon-phase').style.color = '#333';
        document.getElementById('moon-phase').style.fontWeight = 'normal';
        document.getElementById('moon-phase').style.fontSize = '';
        document.getElementById('moon-phase').style.lineHeight = '';
        document.getElementById('moon-phase').style.whiteSpace = '';
        document.getElementById('moon-phase').style.textAlign = '';
        document.getElementById('moon-phase').style.display = '';
        document.getElementById('moon-phase').style.width = '';
     }

     document.getElementById('moon-phase').textContent = moonText;
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
                width:300px;"
            >
                <h3 style="margin-top:-15px; margin-bottom:-15px; font-size:1.6rem;">День ${dayIndex + 1}</h3>
                <p style="font-size:.9rem; color:#777;">Выберите текущую фазу:</p>
                
                <button onclick="setPhase( ${dayIndex}, 'menstruation')" 
                        style="width:100%; padding:.8rem; margin-bottom:.7rem; border:none; border-radius:.5rem; background:${PHASES.menstruation.color}; color:#fff; font-weight:bolder; cursor:pointer;">
                    ${PHASES.menstruation.name}
                </button>
                
                <button onclick="setPhase( ${dayIndex}, 'follicular')" 
                        style="width:100%; padding:.8rem; margin-bottom:.7rem; border:none; border-radius:.5rem; background:${PHASES.follicular.color}; color:#fff; font-weight:bolder; cursor:pointer;">
                    ${PHASES.follicular.name}
                </button>
                
                <button onclick="setPhase( ${dayIndex}, 'ovulation')" 
                        style="width:100%; padding:.8rem; margin-bottom:.7rem; border:none; border-radius:.5rem; background:${PHASES.ovulation.color}; color:#fff; font-weight:bolder; cursor:pointer;">
                    ${PHASES.ovulation.name}
                </button>
                
                <button onclick="setPhase( ${dayIndex}, 'luteal')" 
                        style="width:100%; padding:.8rem; margin-bottom:.7rem; border:none; border-radius:.5rem; background:${PHASES.luteal.color}; color:#fff; font-weight:bolder; cursor:pointer;">
                    ${PHASES.luteal.name}
                </button>
                
                <button onclick="setPhase( ${dayIndex}, null)" 
                        style="width:100%; padding:.8rem; border:none; border-radius:.5rem; background:#ccc; color:#fff; font-weight:bolder; cursor:pointer;">Сбросить</button>
                
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
   
   // Убираем меню выбора фазы (оно вставляется в updateInteractiveCalendar)
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
