document.addEventListener('DOMContentLoaded', function () {
    updateWorkerList();
    updateDisplay();
});

// إضافة عامل جديد للقائمة
function addWorker() {
    const input = document.getElementById('newWorkerName');
    const newName = input.value.trim();
    
    if (!newName) {
        alert('الرجاء إدخال اسم صحيح!');
        return;
    }
    
    let workers = JSON.parse(localStorage.getItem('workerList') || '[]');
    
    if (!workers.includes(newName)) {
        workers.push(newName);
        localStorage.setItem('workerList', JSON.stringify(workers));
        updateWorkerList();
        alert('تمت إضافة العامل بنجاح: ' + newName);
    } else {
        alert('هذا الاسم موجود مسبقاً في القائمة!');
    }
    
    input.value = '';
}

// تحديث القائمة المنسدلة للأسماء
function updateWorkerList() {
    const select = document.getElementById('workerName');
    const workers = JSON.parse(localStorage.getItem('workerList') || '[]');
    select.innerHTML = '<option value="">اختر عاملاً...</option>';
    workers.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}

// تسجيل وقت الدخول أو الخروج
function saveTime(type) {
    const workerName = document.getElementById('workerName').value;
    if (!workerName) {
        alert('يرجى اختيار اسم العامل!');
        return;
    }

    const now = new Date();
    const entry = {
        name: workerName,
        type: type,
        timestamp: now.getTime(),
        formattedTime: now.toLocaleString('ar-EG')
    };

    let logs = JSON.parse(localStorage.getItem('breakLogs') || '[]');
    logs.unshift(entry);
    localStorage.setItem('breakLogs', JSON.stringify(logs));
    updateDisplay();
}

// تحديث الواجهة وحساب الحالات وساعات الاستراحة
function updateDisplay() {
    const list = document.getElementById('logList');
    const activeList = document.getElementById('activeWorkersList');
    const hoursList = document.getElementById('totalHoursList');
    
    if (!list) return;
    
    list.innerHTML = '';
    activeList.innerHTML = '';
    hoursList.innerHTML = '';

    const logs = JSON.parse(localStorage.getItem('breakLogs') || '[]');
    
    // عرض السجلات الأخيرة
    logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log.name + " - " + log.type + ": " + log.formattedTime;
        list.appendChild(li);
    });

    // تتبع من هو داخل الاستراحة حالياً وحساب مجموع الساعات
    let workerStatus = {};
    let workerTotalMinutes = {};

    // قراءة السجلات تصاعدياً للحساب الصحيح
    const sortedLogs = [...logs].reverse();
    sortedLogs.forEach(log => {
        if (!workerTotalMinutes[log.name]) workerTotalMinutes[log.name] = 0;

        if (log.type === 'دخول') {
            workerStatus[log.name] = log.timestamp;
        } else if (log.type === 'خروج' && workerStatus[log.name]) {
            let diffMs = log.timestamp - workerStatus[log.name];
            let diffMins = Math.floor(diffMs / 60000);
            workerTotalMinutes[log.name] += diffMins;
            delete workerStatus[log.name];
        }
    });

    // عرض العمال المتواجدين حالياً في الاستراحة للـ مدير
    const currentlyInside = Object.keys(workerStatus);
    if (currentlyInside.length === 0) {
        activeList.innerHTML = '<li>لا يوجد أحد داخل الاستراحة حالياً.</li>';
    } else {
        currentlyInside.forEach(name => {
            const li = document.createElement('li');
            let enterTime = new Date(workerStatus[name]).toLocaleTimeString('ar-EG');
            li.textContent = `${name} (داخل الاستراحة منذ الساعة: ${enterTime})`;
            activeList.appendChild(li);
        });
    }

    // عرض مجموع ساعات الاستراحة لكل موظف
    for (let worker in workerTotalMinutes) {
        const li = document.createElement('li');
        let hours = (workerTotalMinutes[worker] / 60).toFixed(2);
        li.textContent = `${worker}: إجمالي ${hours} ساعة (${workerTotalMinutes[worker]} دقيقة)`;
        hoursList.appendChild(li);
    }
}

// تصدير البيانات إلى جدول إكسل (CSV) متوافق تماماً
function exportToCSV() {
    const logs = JSON.parse(localStorage.getItem('breakLogs') || '[]');
    if (logs.length === 0) return alert('لا توجد بيانات للتصدير');

    let csvContent = "\uFEFFاسم العامل,نوع الحركة,التوقيت\n";
    logs.forEach(log => {
        csvContent += `"${log.name}","${log.type}","${log.formattedTime}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `سجلات_الاستراحات_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}
