
const moment = require('moment');

const journalFiles = [
    { name: 'journal-2024-01-01 - Mon.md', path: 'Logs/Journal/journal-2024-01-01 - Mon.md', extension: 'md' },
    { name: 'journal-2023-12-31 - Sun.md', path: 'Logs/Journal/journal-2023-12-31 - Sun.md', extension: 'md' },
    { name: 'journal-2024-02-01 - Thu.md', path: 'Logs/Journal/journal-2024-02-01 - Thu.md', extension: 'md' },
    { name: 'journal-2024-01-15 - Mon.md', path: 'Logs/Journal/journal-2024-01-15 - Mon.md', extension: 'md' }
];

const journalPath = 'Logs/Journal';

// Filter logic
const filtered = journalFiles.filter(file => {
    return file.path.startsWith(journalPath) &&
           file.extension === 'md' &&
           /journal-\d{4}-\d{2}-\d{2} - \w+/.test(file.name);
});

console.log('Filtered files:', filtered.map(f => f.name));

// Sort logic
const sortedFiles = filtered.sort((a, b) => {
    const extractDate = (name) => {
        const match = name.match(/journal-(\d{4}-\d{2}-\d{2})/);
        return match ? moment(match[1], 'YYYY-MM-DD').valueOf() : 0;
    };

    const dateA = extractDate(a.name);
    const dateB = extractDate(b.name);

    console.log(`Comparing ${a.name} (${dateA}) vs ${b.name} (${dateB}) -> ${dateA - dateB}`);

    return dateA - dateB;
});

console.log('Sorted files:', sortedFiles.map(f => f.name));

const latestFile = sortedFiles[sortedFiles.length - 1];
console.log('Latest file:', latestFile.name);

if (latestFile.name === 'journal-2024-02-01 - Thu.md') {
    console.log('PASS: Correctly identified latest file.');
} else {
    console.log('FAIL: Identified wrong file.');
}
