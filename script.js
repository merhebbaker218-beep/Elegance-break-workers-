// تعريف المصفوفة الأساسية لتخزين البيانات محلياً
let breaksData = JSON.parse(localStorage.getItem('elegance_breaks')) || [];

// دالة لتسجيل دخول أو خروج العمال وتحديث الشاشة
function addBreakRecord(workerName, type) {
    if (!workerName) {
        alert("يرجى اختيار أو إدخال اسم العامل");
        return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    const record = {
        name: workerName,
        type: type, // دخول أو خروج
        time: timeString,
        date: dateString
    };

    breaksData.push(record);
    
    // حفظ البيانات في التخزين المحلي للمتصفح
    localStorage.setItem('elegance_breaks', JSON.stringify(breaksData));
    
    // تحديث الواجهة
    updateUI();
}

// دالة تحديث الواجهة وعرض العمال الحاليين
function updateUI() {
    // يمكنك ربط عناصر واجهة المستخدم هنا إذا كنت بحاجة لعرض القائمة
    console.log("تم تحديث البيانات:", breaksData);
}

// دالة التصدير إلى ملف إكسل (CSV) المتوافقة مع الهواتف والمتصفحات
function exportToCSV() {
    if (!breaksData || breaksData.length === 0) {
        alert("لا توجد بيانات للتصدير حالياً");
        return;
    }

    // تجهيز محتوى الـ CSV مع إضافة ترميز البداية لضمان قراءة اللغة العربية بشكل صحيح في إكسل
    let csvContent = "\uFEFF"; 
    
    // عناوين الأعمدة
    csvContent += "اسم العامل,الحالة,الوقت,التاريخ\n";

    // إضافة الصفوف
    breaksData.forEach(row => {
        csvContent += `"${row.name}","${row.type}","${row.time}","${row.date}"\n`;
    });

    // إنشاء رابط الـ Blob الآمن لتجاوز قيود التحميل في الهواتف
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "elegance_breaks_report.csv");
    
    document.body.appendChild(link);
    link.click();
    
    // تنظيف الرابط والذاكرة المؤقتة بعد التحميل
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

// ربط زر التصدير تلقائياً عند تحميل الصفحة (تأكد أن زر التصدير لديه الفئة أو المعرف المناسب)
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    // البحث عن زر التصدير (يمكنك تعديل المحدد حسب تصميمك، مثل جلب الزر عبر الـ ID)
    const exportBtn = document.querySelector('.btn-success') || document.querySelector('button:last-child');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToCSV();
        });
    }
});
