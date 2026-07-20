// تهيئة البيانات من التخزين المحلي
let workersList = JSON.parse(localStorage.getItem('elegance_workers')) || [];
let breaksData = JSON.parse(localStorage.getItem('elegance_breaks')) || [];

// تحديث القائمة المنسدلة للعمال والواجهة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateWorkersDropdown();
    updateUI();

    // ربط زر التصدير بدالة الـ CSV
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToCSV();
        });
    }
});

// إضافة عامل جديد
function addNewWorker() {
    const input = document.getElementById('newWorkerInput');
    const workerName = input.value.trim();

    if (!workerName) {
        alert("الرجاء إدخال اسم العامل");
        return;
    }

    if (workersList.includes(workerName)) {
        alert("هذا العامل موجود مسبقاً");
        return;
    }

    workersList.push(workerName);
    localStorage.setItem('elegance_workers', JSON.stringify(workersList));
    
    input.value = "";
    updateWorkersDropdown();
    alert("تم إضافة العامل بنجاح");
}

// تحديث القائمة المنسدلة (Dropdown)
function updateWorkersDropdown() {
    const select = document.getElementById('workerSelect');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>اختر عاملاً...</option>';
    workersList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// تسجيل الدخول أو الخروج للاستراحة
function registerAction(actionType) {
    const select = document.getElementById('workerSelect');
    const workerName = select.value;

    if (!workerName) {
        alert("الرجاء اختيار عامل من القائمة");
        return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    const record = {
        name: workerName,
        type: actionType,
        time: timeString,
        date: dateString
    };

    breaksData.push(record);
    localStorage.setItem('elegance_breaks', JSON.stringify(breaksData));
    updateUI();
    
    alert(`تم تسجيل ${actionType} للعامل: ${workerName}`);
}

// تحديث الواجهة وعرض العمال المتواجدين
function updateUI() {
    const activeList = document.getElementById('activeWorkersList');
    if (!activeList) return;

    if (breaksData.length === 0) {
        activeList.innerHTML = '<li>لا يوجد عمال داخل الاستراحة حالياً</li>';
        return;
    }

    activeList.innerHTML = "";
    breaksData.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.type} (الساعة: ${item.time})`;
        activeList.appendChild(li);
    });
}

// دالة التصدير إلى إكسل (CSV) المتوافقة تماماً مع الهواتف
function exportToCSV() {
    if (!breaksData || breaksData.length === 0) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    // إضافة ترميز UTF-8 BOM لضمان قراءة اللغة العربية بشكل صحيح في أكسل
    let csvContent = "\uFEFF"; 
    csvContent += "اسم العامل,نوع العملية,الوقت,التاريخ\n";

    breaksData.forEach(row => {
        csvContent += `"${row.name}","${row.type}","${row.time}","${row.date}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "elegance_breaks_report.csv");
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
