export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Add 1 because months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');  // Pad with zero if day is single digit

    return `${year}-${month}-${day}`;
}