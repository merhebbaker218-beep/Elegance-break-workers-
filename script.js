function saveTime(type) {
    const isConfirmed = confirm("هل تريد تسجيل " + type + " الاستراحة الآن؟");
    
    if (isConfirmed) {
        const now = new Date().toLocaleString('ar-EG');
        const entry = { type: type, time: now };
        
        let logs = JSON.parse(localStorage.getItem('breakLogs') || '[]');
        logs.unshift(entry);
        localStorage.setItem('breakLogs', JSON.stringify(logs));
        
        // تحديث القائمة
        updateDisplay();
    }
}

function updateDisplay() {
    const list = document.getElementById('logList');
    list.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('breakLogs') || '[]');
    logs.forEach(log => {
        const li = document.createElement('li');
li.textContent = log.type + ": " + log.time;
        list.appendChild(li);
    });
}

// تنفيذ عند التحميل
updateDisplay();