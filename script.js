// ==========================================
تهيئة المتغيرات والاتصال بقاعدة البيانات (Supabase)
// ==========================================
// تأكد من ضبط مفاتيح ورابط Supabase الخاصة بك هنا أو جلبها من الملف الأساسي
// const supabaseUrl = 'YOUR_SUPABASE_URL';
// const supabaseKey = 'YOUR_SUPABASE_KEY';
// const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// مصفوفة لتخزين البيانات الحالية محلياً لعرضها وتصديرها
window.breaksData = [];

// دالة لتحديث وعرض العمال المتواجدين حالياً في الاستراحة وإجمالي الساعات
async function fetchBreaksData() {
    try {
        // استبدل 'breaks_records' باسم الجدول الفعلي لديك في Supabase
        const { data, error } = await _supabase
            .from('breaks_records')
            .select('*');

        if (error) {
            console.error('خطأ في جلب البيانات:', error.message);
            return;
        }

        if (data) {
            // تخزين البيانات في المصفوفة العامة لتكون جاهزة للتصدير
            window.breaksData = data;
            
            // تحديث الواجهة الرسومية بناءً على البيانات المستلمة
            updateUI(data);
        }
    } catch (err) {
        console.error('حدث خطأ غير متوقع:', err);
    }
}

// دالة لتحديث الواجهة وعرض الأسماء والتواريخ بشكل سليم لتجنب ظهور undefined أو Invalid Date
function updateUI(data) {
    const activeWorkersContainer = document.getElementById('active-workers-container'); // مثال لعنصر الحاوية
    // يمكنك ربط هذه الدالة بالعناصر الموجودة في واجهتك HTML
    
    data.forEach(row => {
        // معالجة الحقول لضمان عدم ظهور undefined
        const workerName = row.worker_name || row.name || 'عمل غير معروف';
        const entryTime = row.entry_time ? new Date(row.entry_time).toLocaleTimeString() : 'وقت غير متوفر';
        
        // طباعة تحققية في الكونسول
        console.log(`العامل: ${workerName}, وقت الدخول: ${entryTime}`);
    });
}

// ==========================================
// دالة التصدير إلى جدول إكسل (CSV) المحدثة والمصححة
// ==========================================
function exportToCSV() {
    // 1. التحقق من وجود بيانات للتصدير
    if (!window.breaksData || window.breaksData.length === 0) {
        alert("لا توجد بيانات متاحة للتصدير حالياً.");
        return;
    }

    // 2. تجهيز محتوى ملف الـ CSV مع إضافة ترميز UTF-8 (BOM) لدعم اللغة العربية بشكل صحيح في Excel
    let csvContent = "\uFEFF"; 
    
    // إضافة ترويسة الأعمدة (Headers)
    csvContent += "اسم العامل,نوع العملية,الوقت,التاريخ\n";

    // 3. إضافة الصفوف وترتيب البيانات من الجدول
    window.breaksData.forEach(row => {
        // استخدام الأسماء الصحيحة للأعمدة من قاعدة البيانات وتجنب أي قيم فارغة أو undefined
        const workerName = row.worker_name || row.name || '';
        const operationType = row.type || row.operation_type || '';
        const timeVal = row.time || row.entry_time || '';
        const dateVal = row.date || '';

        let line = `"${workerName}","${operationType}","${timeVal}","${dateVal}"`;
        csvContent += line + "\n";
    });

    // 4. إنشاء كائن Blob وتوليد الرابط بطريقة آمنة ومتوافقة تماماً مع الهواتف الذكية ومتصفحات الويب
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    if (navigator.msSaveBlob) { 
        // لدعم متصفحات إنترنت إكسبلورر القديمة إن وجدت
        navigator.msSaveBlob(blob, "elegance_breaks_report.csv");
    } else {
        // الطريقة الحديثة والآمنة لتفادي خطأ blob URI على الهواتف
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "elegance_breaks_report.csv");
        
        // إضافة الرابط مؤقتاً لصفحة المستند وتفعيل النقر برمجياً
        document.body.appendChild(link);
        link.click();
        
        // تنظيف الذاكرة وحذف العنصر بعد إتمام عملية التحميل
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// ربط زر التصدير في الواجهة بدالة التصدير تلقائياً عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.querySelector('.btn-success, button:has-text("تصدير"), [onclick*="export"]');
    // أو إذا كان الزر يحمل معرفاً معيناً مثل id="exportBtn" يمكنك استخدامه مباشرة:
    // const exportBtn = document.getElementById('exportBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToCSV();
        });
    }
});
