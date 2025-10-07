"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.months = exports.days = void 0;
exports.formatDate = formatDate;
exports.formatDay = formatDay;
exports.formatDateRange = formatDateRange;
exports.formatDateRangeSD = formatDateRangeSD;
exports.formatTime = formatTime;
exports.formatTimeRange = formatTimeRange;
// helpers/date-time.ts
exports.days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
exports.months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
/**
 * Format a date into a string in the format "dd MMMM yyyy".
 * @param {Date} d - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(d) {
    return `${d.getDate()} ${exports.months[d.getMonth()]} ${d.getFullYear()}`;
}
/**
 * Returns the day of the week as a string (e.g. "Minggu", "Selasa", etc.)
 * @param {Date} d - The date to get the day of the week from.
 * @returns {string} The day of the week as a string.
 */
function formatDay(d) {
    return exports.days[d.getDay()];
}
/**
 * Format a range of dates into a string in the format "dd MMMM yyyy"
 * Example: "28, 29, 30 April dan 2 Mei 2025"
 * @param {Date[]} dates - The range of dates to format.
 * @returns {string} The formatted date range string.
 */
function formatDateRange(dates) {
    if (!dates || dates.length === 0)
        return "-";
    dates.sort((a, b) => a.getTime() - b.getTime());
    const grouped = {};
    const year = dates[0].getFullYear();
    for (const d of dates) {
        const monthName = exports.months[d.getMonth()];
        if (!grouped[monthName])
            grouped[monthName] = [];
        grouped[monthName].push(d.getDate());
    }
    const parts = Object.entries(grouped).map(([month, days]) => {
        return `${days.join(", ")} ${month}`;
    });
    return parts.join(", ").replace(/, ([^,]*)$/, " dan $1") + ` ${year}`;
}
/**
 * Format a date range into a string using "s.d." notation.
 * Example output: "30 April 2025 s.d. 02 Mei 2025"
 * - If there is only 1 date: "30 April 2025"
 * - If the month changes: "30 April 2025 s.d. 02 May 2025"
 * - If the year changes: "30 December 2025 s.d. 02 January 2026"
 *
 * @param {Date[]} dates - Array of dates to format (will be sorted automatically).
 * @returns {string} The formatted date range string.
 */
function formatDateRangeSD(dates) {
    if (!dates || dates.length === 0)
        return "-";
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const sameDay = start.getTime() === end.getTime();
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();
    const startDay = String(start.getDate()).padStart(2, "0");
    const endDay = String(end.getDate()).padStart(2, "0");
    const startMonth = exports.months[start.getMonth()];
    const endMonth = exports.months[end.getMonth()];
    if (sameDay) {
        return `${startDay} ${startMonth} ${start.getFullYear()}`;
    }
    if (sameMonth && sameYear) {
        return `${startDay} s.d. ${endDay} ${startMonth} ${start.getFullYear()}`;
    }
    if (sameYear) {
        return `${startDay} ${startMonth} s.d. ${endDay} ${endMonth} ${start.getFullYear()}`;
    }
    return `${startDay} ${startMonth} ${start.getFullYear()} s.d. ${endDay} ${endMonth} ${end.getFullYear()}`;
}
/**
 * Format a single time string ("07:00") into Indonesian-style format ("07.00 WIB")
 * @param {string} time - The time string in HH:mm format.
 * @returns {string} The formatted time string.
 */
function formatTime(time) {
    if (!time)
        return "-";
    // Replace ":" with ".", ensure leading zero
    const formatted = time.replace(":", ".");
    return `${formatted} WIB`;
}
/**
 * Format a time range object into a string in the format "HH.mm - HH.mm WIB".
 * Example: { start: "07:00", end: "17:00" } → "07.00 - 17.00 WIB"
 *
 * @param {{ start?: string, end?: string }} [timeRange] - The time range object.
 * @returns {string} The formatted time range string.
 */
function formatTimeRange(timeRange) {
    if (!timeRange || (!timeRange.start && !timeRange.end))
        return "-";
    const formatTime = (time) => {
        if (!time)
            return undefined;
        // Ambil hanya jam dan menit
        const [h, m = "00"] = time.replace(".", ":").split(":");
        const hour = h.padStart(2, "0");
        const minute = m.padStart(2, "0");
        return `${hour}.${minute}`;
    };
    const startStr = formatTime(timeRange.start);
    const endStr = formatTime(timeRange.end);
    if (startStr && endStr)
        return `${startStr} - ${endStr} WIB`;
    if (startStr && !endStr)
        return `${startStr} WIB`;
    if (!startStr && endStr)
        return `${endStr} WIB`;
    return "-";
}
