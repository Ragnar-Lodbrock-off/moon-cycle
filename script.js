class LunarMenstrualCalendar {
    constructor() {
        this.canvas = document.getElementById('circular-calendar');
        this.ctx = this.canvas.getContext('2d');
        this.phaseSelect = document.getElementById('phase-select');
        this.saveButton = document.getElementById('save-phase');
        
        // Данные о фазах менструального цикла
        this.cycleData = JSON.parse(localStorage.getItem('cycleData')) || {};
        
        this.init();
    }

    init() {
        this.updateCurrentInfo();
        this.drawCircularCalendar();
        this.setupEventListeners();
    }

    updateCurrentInfo() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = 
            `Текущая дата: ${now.toLocaleDateString('ru-RU', options)}`;

        // Расчёт лунной фазы
        const lunarDay = this.calculateLunarDay(now);
        const moonPhase = this.getMoonPhaseName(lunarDay);
        
        document.getElementById('moon-phase').textContent = `Фаза луны: ${moonPhase}`;
        document.getElementById('lunar-day').textContent = `День лунного календаря: ${lunarDay}`;
    }

    // Точный расчёт дня лунного цикла (29.53 дня)
    calculateLunarDay(date) {
        // Базовая дата — новолуние 6 января 2000 года
        const baseDate = new Date('2000-01-06T00:00:00');
        const lunarCycle = 29.530588853; // дней
        
        const diff = date - baseDate;
        const days = diff / (1000 * 60 * 60 * 24);
        const lunarDay = (days % lunarCycle) + 1;
        
        return Math.floor(lunarDay);
    }

    getMoonPhaseName(day) {
        if (day === 1) return 'Новолуние';
        else if (day <= 7) return 'Растущая луна (первая четверть)';
        else if (day <= 14) return 'Растущая луна (вторая четверть)';
        else if (day === 15) return 'Полнолуние';
        else if (day <= 22) return 'Убывающая луна (третья четверть)';
        else if (day <= 29) return 'Убывающая луна (четвёртая четверть)';
        else return 'Новолуние (приближается)';
    }

    drawCircularCalendar() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        const startAngle = -Math.PI / 2; // Начинаем сверху

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < 28; i++) {
            const angle = startAngle + (i * 2 * Math.PI / 28);
            const endAngle = angle + (2 * Math.PI / 28);

            // Определяем цвет для дня
            const dateKey = this.getDateKey(i + 1);
            let color = '#f0f0f0'; // Цвет по умолчанию

            if (this.cycleData[dateKey]) {
                color = this.getPhaseColor(this.
