// Sound Control
const soundToggle = document.getElementById('soundToggle');
const clickSound = document.getElementById('clickSound');
const alarmSound = document.getElementById('alarmSound');
let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.querySelector('i').className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    playSound();
}

function playSound() {
    if (!soundEnabled) return;
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
}

soundToggle.addEventListener('click', toggleSound);

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

function toggleTheme() {
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    playSound();
}

themeToggle.addEventListener('click', toggleTheme);

// Clock with Timezone
function updateClock() {
    const now = new Date();
    const timezone = document.getElementById('timezone').value;
    let time;
    
    switch(timezone) {
        case 'UTC':
            time = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
            break;
        case 'EST':
            time = new Date(now.getTime() + (now.getTimezoneOffset() + 300) * 60000);
            break;
        case 'PST':
            time = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
            break;
        case 'GMT':
            time = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
            break;
        default:
            time = now;
    }
    
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = time.toLocaleDateString(undefined, options);
}

setInterval(updateClock, 1000);
updateClock();

// Stopwatch with Lap Times and Save Feature
let stopwatchInterval = null;
let elapsed = 0;
let running = false;
let lapTimes = [];
let lastLapTime = 0;

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const hundredths = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${hundredths}`;
}

function updateStopwatchDisplay() {
    document.getElementById('stopwatch').textContent = formatTime(elapsed);
}

function startStopwatch() {
    if (running) return;
    running = true;
    let last = Date.now();
    stopwatchInterval = setInterval(() => {
        const now = Date.now();
        elapsed += now - last;
        last = now;
        updateStopwatchDisplay();
    }, 10);
    playSound();
}

function stopStopwatch() {
    if (!running) return;
    running = false;
    clearInterval(stopwatchInterval);
    playSound();
}

function resetStopwatch() {
    stopStopwatch();
    elapsed = 0;
    lapTimes = [];
    lastLapTime = 0;
    updateStopwatchDisplay();
    updateLapTimes();
    playSound();
}

function addLapTime() {
    if (!running) return;
    const lapTime = elapsed - lastLapTime;
    lastLapTime = elapsed;
    lapTimes.unshift({
        lapNumber: lapTimes.length + 1,
        totalTime: elapsed,
        lapTime: lapTime
    });
    updateLapTimes();
    playSound();
}

function updateLapTimes() {
    const lapTimesContainer = document.getElementById('lapTimes');
    lapTimesContainer.innerHTML = lapTimes.map(lap => `
        <div class="lap-time">
            <span>Lap ${lap.lapNumber}</span>
            <span>${formatTime(lap.lapTime)}</span>
            <span>${formatTime(lap.totalTime)}</span>
        </div>
    `).join('');
}

function saveLapTimes() {
    if (lapTimes.length === 0) return;
    const data = JSON.stringify(lapTimes);
    localStorage.setItem('savedLapTimes', data);
    playSound();
    alert('Lap times saved successfully!');
}

// Timer with Presets
let countdownInterval = null;
let timeLeft = 0;

function startCountdown() {
    if (countdownInterval) return;
    
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    timeLeft = (minutes * 60 + seconds) * 1000;
    
    if (timeLeft <= 0) return;
    
    let last = Date.now();
    countdownInterval = setInterval(() => {
        const now = Date.now();
        timeLeft -= now - last;
        last = now;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(countdownInterval);
            countdownInterval = null;
            if (soundEnabled) {
                alarmSound.play().catch(() => {});
            }
        }
        
        updateCountdownDisplay();
    }, 10);
    playSound();
}

function stopCountdown() {
    if (!countdownInterval) return;
    clearInterval(countdownInterval);
    countdownInterval = null;
    playSound();
}

function resetCountdown() {
    stopCountdown();
    timeLeft = 0;
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    updateCountdownDisplay();
    playSound();
}

function updateCountdownDisplay() {
    const totalSeconds = Math.ceil(timeLeft / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById('countdown').textContent = `${minutes}:${seconds}`;
}

function setPresetTimer(minutes) {
    document.getElementById('minutes').value = minutes;
    document.getElementById('seconds').value = '00';
    playSound();
}

// Alarm System
let alarms = [];

function setAlarm() {
    const alarmTime = document.getElementById('alarmTime').value;
    if (!alarmTime) return;
    
    const [hours, minutes] = alarmTime.split(':');
    const now = new Date();
    const alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    if (alarmDate < now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    const alarm = {
        id: Date.now(),
        time: alarmTime,
        date: alarmDate
    };
    
    alarms.push(alarm);
    updateAlarmsList();
    playSound();
}

function clearAlarm(alarmId) {
    alarms = alarms.filter(alarm => alarm.id !== alarmId);
    updateAlarmsList();
    playSound();
}

function updateAlarmsList() {
    const alarmsContainer = document.getElementById('activeAlarms');
    alarmsContainer.innerHTML = alarms.map(alarm => `
        <div class="alarm-item">
            <span class="time">${alarm.time}</span>
            <button class="delete-alarm" onclick="clearAlarm(${alarm.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function checkAlarms() {
    const now = new Date();
    alarms.forEach(alarm => {
        if (alarm.date <= now) {
            if (soundEnabled) {
                alarmSound.play().catch(() => {});
            }
            clearAlarm(alarm.id);
        }
    });
}

// Event Listeners
document.getElementById('start').addEventListener('click', startStopwatch);
document.getElementById('stop').addEventListener('click', stopStopwatch);
document.getElementById('reset').addEventListener('click', resetStopwatch);
document.getElementById('lap').addEventListener('click', addLapTime);
document.getElementById('saveLaps').addEventListener('click', saveLapTimes);

document.getElementById('startTimer').addEventListener('click', startCountdown);
document.getElementById('stopTimer').addEventListener('click', stopCountdown);
document.getElementById('resetTimer').addEventListener('click', resetCountdown);

document.getElementById('setAlarm').addEventListener('click', setAlarm);
document.getElementById('clearAlarm').addEventListener('click', () => {
    alarms = [];
    updateAlarmsList();
    playSound();
});

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => setPresetTimer(parseInt(btn.dataset.minutes)));
});

// Check alarms every second
setInterval(checkAlarms, 1000);

// Initialize displays
updateStopwatchDisplay();
updateCountdownDisplay(); 