"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatDay = formatDay;
exports.formatDateRange = formatDateRange;
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
/**
 * Format a date into a string in the format "dd MMMM yyyy".
 * @param {Date} d - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(d) {
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
/**
 * Returns the day of the week as a string (e.g. "Minggu", "Selasa", etc.)
 * @param {Date} d - The date to get the day of the week from.
 * @returns {string} The day of the week as a string.
 */
function formatDay(d) {
    return days[d.getDay()];
}
/**
 * Format a range of dates into a string in the format "dd MMMM yyyy"
 * E.g. "1, 2, 3 Mei 2022" or "1 Mei dan 2 Mei 2022".
 * If the range spans multiple months, the months will be separated by commas.
 * If the range spans multiple years, the year will be appended to the end.
 * @param {Date[]} dates - The range of dates to format.
 * @returns {string} The formatted date range string.
 */
function formatDateRange(dates) {
    dates.sort((a, b) => a.getTime() - b.getTime());
    const grouped = {};
    const year = dates[0].getFullYear();
    for (const d of dates) {
        const monthName = months[d.getMonth()];
        if (!grouped[monthName])
            grouped[monthName] = [];
        grouped[monthName].push(d.getDate());
    }
    const parts = Object.entries(grouped).map(([month, days]) => {
        return `${days.join(", ")} ${month}`;
    });
    return parts.join(", ").replace(/, ([^,]*)$/, " dan $1") + ` ${year}`;
}
