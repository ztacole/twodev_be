"use strict";
// ============================================================================
// 📅 Date & Time Helpers (Indonesian Locale)
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.months = exports.days = void 0;
exports.formatDate = formatDate;
exports.formatDay = formatDay;
exports.formatDateRange = formatDateRange;
exports.formatDateRangeSD = formatDateRangeSD;
exports.formatTimeRange = formatTimeRange;
/** Nama hari dalam bahasa Indonesia */
exports.days = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];
/** Nama bulan dalam bahasa Indonesia */
exports.months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
// ============================================================================
// 🔹 Utility Functions
// ============================================================================
/**
 * Ekstraksi bagian tanggal (hari, bulan, tahun) dari objek Date.
 * Bisa memilih mode UTC (true) atau lokal (false).
 */
function extractDateParts(date, useUTC) {
    return {
        day: useUTC ? date.getUTCDate() : date.getDate(),
        month: useUTC ? date.getUTCMonth() : date.getMonth(),
        year: useUTC ? date.getUTCFullYear() : date.getFullYear(),
    };
}
// ============================================================================
// 📆 Date Formatting
// ============================================================================
/**
 * Format tanggal tunggal menjadi string seperti "30 April 2025".
 * Bisa memilih mode UTC (true) atau lokal (false).
 */
function formatDate(d, useUTC = false) {
    const day = useUTC ? d.getUTCDate() : d.getDate();
    const month = useUTC ? d.getUTCMonth() : d.getMonth();
    const year = useUTC ? d.getUTCFullYear() : d.getFullYear();
    return `${day} ${exports.months[month]} ${year}`;
}
/**
 * Mengembalikan nama hari dari tanggal, misal "Senin", "Rabu", dll.
 * Bisa memilih mode UTC (true) atau lokal (false).
 */
function formatDay(d, useUTC = false) {
    const dayIndex = useUTC ? d.getUTCDay() : d.getDay();
    return exports.days[dayIndex];
}
/**
 * Format kumpulan tanggal menjadi rentang seperti:
 * "28, 29, 30 April dan 2 Mei 2025"
 */
function formatDateRange(dates) {
    var _a;
    if (!dates || dates.length === 0)
        return "-";
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const grouped = {};
    const year = sorted[0].getFullYear();
    for (const d of sorted) {
        const monthName = exports.months[d.getMonth()];
        (_a = grouped[monthName]) !== null && _a !== void 0 ? _a : (grouped[monthName] = []);
        grouped[monthName].push(d.getDate());
    }
    const parts = Object.entries(grouped).map(([month, days]) => `${days.join(", ")} ${month}`);
    return `${parts.join(", ").replace(/, ([^,]*)$/, " dan $1")} ${year}`;
}
/**
 * Format rentang tanggal menggunakan format "s.d.".
 * Contoh:
 *  - "30 April 2025 s.d. 02 Mei 2025"
 *  - "30 April 2025" (jika hanya satu tanggal)
 * Mendukung mode UTC atau lokal (default: lokal).
 */
function formatDateRangeSD(dates, useUTC = false) {
    if (!dates || dates.length === 0)
        return "-";
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const s = extractDateParts(start, useUTC);
    const e = extractDateParts(end, useUTC);
    const sameDay = start.getTime() === end.getTime();
    const sameMonth = s.month === e.month;
    const sameYear = s.year === e.year;
    const startDay = String(s.day).padStart(2, "0");
    const endDay = String(e.day).padStart(2, "0");
    const startMonth = exports.months[s.month];
    const endMonth = exports.months[e.month];
    if (sameDay)
        return `${startDay} ${startMonth} ${s.year}`;
    if (sameMonth && sameYear)
        return `${startDay} s.d. ${endDay} ${startMonth} ${s.year}`;
    if (sameYear)
        return `${startDay} ${startMonth} s.d. ${endDay} ${endMonth} ${s.year}`;
    return `${startDay} ${startMonth} ${s.year} s.d. ${endDay} ${endMonth} ${e.year}`;
}
// ============================================================================
// 🕓 Time Formatting
// ============================================================================
/**
 * Format rentang waktu dalam gaya Indonesia:
 * - "07.00 WIB"
 * - "07.00 - 17.00 WIB"
 * Bisa menerima string ("07:00") atau objek Date.
 * Mendukung mode UTC (true) atau lokal (false).
 */
function formatTimeRange(start, end, useUTC = false) {
    if (!start && !end)
        return "-";
    const parseTime = (t) => {
        if (!t)
            return undefined;
        if (t instanceof Date) {
            const hours = useUTC ? t.getUTCHours() : t.getHours();
            const minutes = useUTC ? t.getUTCMinutes() : t.getMinutes();
            return `${String(hours).padStart(2, "0")}.${String(minutes).padStart(2, "0")}`;
        }
        // Untuk input string "07:00" atau "07.00"
        const [h, m = "00"] = t.replace(".", ":").split(":");
        return `${h.padStart(2, "0")}.${m.padStart(2, "0")}`;
    };
    const startStr = parseTime(start);
    const endStr = parseTime(end);
    if (startStr && endStr)
        return `${startStr} - ${endStr} WIB`;
    if (startStr)
        return `${startStr} WIB`;
    if (endStr)
        return `${endStr} WIB`;
    return "-";
}
