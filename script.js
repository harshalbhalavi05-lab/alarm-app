// DOM Elements
const digitalClock = document.getElementById('digital-clock');
const currentDate = document.getElementById('current-date');
const hourPicker = document.getElementById('hour-picker');
const minutePicker = document.getElementById('minute-picker');
const ampmPicker = document.getElementById('ampm-picker');
const alarmLabelInput = document.getElementById('alarm-label');
const soundSelection = document.getElementById('sound-selection');
const startBtn = document.getElementById('start-btn');
const testBtn = document.getElementById('test-btn');
const nextAlarmTimeDisp = document.getElementById('next-alarm-time');
const alarmCountdownDisp = document.getElementById('alarm-countdown');

const ringingScreen = document.getElementById('ringing-screen');
const ringingLabel = document.getElementById('ringing-label');
const autoStopTimerDisp = document.getElementById('auto-stop-timer');
const stopBtn = document.getElementById('stop-btn');
const snoozeBtn = document.getElementById('snooze-btn');
const alarmAudio = document.getElementById('alarm-audio');
const audioSource = document.getElementById('audio-source');

// State
let alarmTime = null;
let alarmTimeout = null;
let countdownInterval = null;
let autoStopTimeout = null;
let autoStopCounter = 60;
let autoStopInterval = null;

// Audio URLs
const sounds = {
    beep: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    tone: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3',
    music: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
};

// Initialization
function init() {
    populatePickers();
    updateClock();
    setInterval(updateClock, 1000);
    loadAlarm();
}

function populatePickers() {
    for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i < 10 ? '0' + i : i;
        hourPicker.appendChild(opt);
    }
    for (let i = 0; i < 60; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i < 10 ? '0' + i : i;
        minutePicker.appendChild(opt);
    }
}

function updateClock() {
    const now = new Date();
    digitalClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    currentDate.textContent = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

    if (alarmTime) {
        updateCountdown();
    }
}

function updateCountdown() {
    const now = new Date();
    const diff = alarmTime - now;

    if (diff <= 0) {
        triggerAlarm();
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    alarmCountdownDisp.textContent = `Rings in ${hours}h ${minutes}m ${seconds}s`;
}

function setAlarm() {
    const hour = parseInt(hourPicker.value);
    const minute = parseInt(minutePicker.value);
    const ampm = ampmPicker.value;
    const label = alarmLabelInput.value || 'Alarm';
    const sound = soundSelection.value;

    let alarmDate = new Date();
    let alarmHour = hour;
    if (ampm === 'PM' && hour < 12) alarmHour += 12;
    if (ampm === 'AM' && hour === 12) alarmHour = 0;

    alarmDate.setHours(alarmHour, minute, 0, 0);

    if (alarmDate <= new Date()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }

    alarmTime = alarmDate;
    const timeString = alarmDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayString = alarmDate.getDate() === new Date().getDate() ? 'today' : 'tomorrow';

    nextAlarmTimeDisp.textContent = `${timeString} ${dayString}`;
    saveAlarm(alarmDate, label, sound);
    updateCountdown();
}

function triggerAlarm() {
    const label = alarmLabelInput.value || 'Alarm';
    const sound = soundSelection.value;

    ringingLabel.textContent = label;
    audioSource.src = sounds[sound];
    alarmAudio.load();
    alarmAudio.play();

    ringingScreen.classList.remove('hidden');
    alarmTime = null;
    nextAlarmTimeDisp.textContent = 'No Alarm Set';
    alarmCountdownDisp.textContent = 'Set a time to start';
    localStorage.removeItem('activeAlarm');

    // Auto stop after 60 seconds
    autoStopCounter = 60;
    autoStopTimerDisp.textContent = `Auto-stopping in ${autoStopCounter}s`;
    autoStopInterval = setInterval(() => {
        autoStopCounter--;
        autoStopTimerDisp.textContent = `Auto-stopping in ${autoStopCounter}s`;
        if (autoStopCounter <= 0) stopAlarm();
    }, 1000);
}

function stopAlarm() {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    ringingScreen.classList.add('hidden');
    clearInterval(autoStopInterval);
}

function snoozeAlarm() {
    stopAlarm();
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
    alarmTime = snoozeTime;

    const timeString = alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    nextAlarmTimeDisp.textContent = `${timeString} (Snoozed)`;
    saveAlarm(alarmTime, alarmLabelInput.value, soundSelection.value);
}

function saveAlarm(time, label, sound) {
    const data = {
        time: time.getTime(),
        label: label,
        sound: sound
    };
    localStorage.setItem('activeAlarm', JSON.stringify(data));
}

function loadAlarm() {
    const saved = localStorage.getItem('activeAlarm');
    if (saved) {
        const data = JSON.parse(saved);
        const savedTime = new Date(data.time);

        if (savedTime > new Date()) {
            alarmTime = savedTime;
            alarmLabelInput.value = data.label;
            soundSelection.value = data.sound;

            const timeString = alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dayString = alarmTime.getDate() === new Date().getDate() ? 'today' : 'tomorrow';
            nextAlarmTimeDisp.textContent = `${timeString} ${dayString}`;
        } else {
            localStorage.removeItem('activeAlarm');
        }
    }
}

// Event Listeners
startBtn.addEventListener('click', () => {
    setAlarm();
    startBtn.textContent = 'Alarm Set!';
    setTimeout(() => startBtn.textContent = 'Start Alarm', 2000);
});

testBtn.addEventListener('click', () => {
    triggerAlarm();
});

stopBtn.addEventListener('click', stopAlarm);
snoozeBtn.addEventListener('click', snoozeAlarm);

init();