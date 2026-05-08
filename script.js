const phases = ['Менструация', 'Фолликулярная фаза', 'Овуляция', 'Лютеиновая фаза'];
const phaseColors = ['#ff9999', '#99ff99', '#ffff99', '#ffcc99'];

function getCurrentDate() {
    const date = new Date();
    return date;
}

function drawMoonPhase(date) {
    const canvas = document.getElementById('moon-phase-canvas');
    const ctx = canvas.getContext('2d');
    
    const moonPhase = calculateMoonPhase(date);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2);
    
    if (moonPhase < 0.5) {
        ctx.fillStyle = 'lightgray';
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.arc(150, 150, 100, Math.PI * 2 * moonPhase, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = 'lightgray';
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.arc(150, 150, 100, Math.PI * 2 * moonPhase, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(150, 150, 100, Math.PI * 2 * (moonPhase - 1), Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalCompositeOperation = 'source-over';
}

function calculateMoonPhase(date) {
    const knownNewMoon = new Date('2023-01-21T00:00:00Z'); // Задайте известную дату новолуния
    const lunarCycle = 29.53; // Средняя длина лунного цикла в днях
    const diffInDays = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
    
    return (diffInDays % lunarCycle) / lunarCycle;
}

function createCalendar() {
    const calendar = document.getElementById('calendar');
    
    for (let i = 1; i <= 28; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.innerText = i;
        
        dayDiv.addEventListener('click', () => {
            const phase = prompt(Выберите фазу для дня ${i}:\n${phases.join(', ')});
            if (phases.includes(phase)) {
                dayDiv.style.backgroundColor = phaseColors[phases.indexOf(phase)];
                dayDiv.dataset.phase = phase;
            } else {
                alert('Неверная фаза!');
            }
        });
        
        calendar.appendChild(dayDiv);
    }
}

function displayCurrentDate() {
    const currentDate = getCurrentDate();
    document.getElementById('current-date').innerText = Сегодня: ${currentDate.toLocaleDateString()};
}

function init() {
    displayCurrentDate();
    drawMoonPhase(getCurrentDate());
    createCalendar();
}

init();
