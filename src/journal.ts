import { App, TFile, Notice, moment } from 'obsidian';
import { getDailyNote, getAllDailyNotes } from 'obsidian-daily-notes-interface';
import { DailyNotesLinkerSettings } from './settings';

async function getLatestJournalEntry(app: App, journalPath: string): Promise<string | null> {
    const journalFiles = app.vault.getFiles().filter(file => {
        return file.path.startsWith(journalPath) &&
               file.extension === 'md' &&
               /journal-\d{4}-\d{2}-\d{2} - \w+/.test(file.name);
    });

    if (journalFiles.length === 0) {
        return null;
    }

    const sortedFiles = journalFiles.sort((a, b) => {
        // Extract date from "journal-YYYY-MM-DD - ddd"
        // Filename: journal-2026-01-05 - Mon.md
        const extractDate = (name: string) => {
            const match = name.match(/journal-(\d{4}-\d{2}-\d{2})/);
            if (!match) return 0;
            // @ts-ignore
            const m = moment(match[1], 'YYYY-MM-DD');
            return m.isValid() ? m.valueOf() : 0;
        };

        const dateA = extractDate(a.name);
        const dateB = extractDate(b.name);

        return dateA - dateB;
    });

    const latestFile = sortedFiles[sortedFiles.length - 1];
    console.log('Latest journal entry found:', latestFile.name);

    // return date string from filename
    const match = latestFile.name.match(/journal-(\d{4}-\d{2}-\d{2} - \w+)/);
    return match ? match[1] : null;
}

export async function createJournalEntry(app: App, settings: DailyNotesLinkerSettings) {
    const { journalPath } = settings;
    // @ts-ignore
    const now = moment();
    const todayDateString = now.format('YYYY-MM-DD');
    const weekday = now.format('ddd'); // Short weekday, e.g. Mon
    const dailyNoteString = `${todayDateString} - ${weekday}`;
    const newJournalFilename = `journal-${dailyNoteString}.md`;
    const newJournalPath = `${journalPath}/${newJournalFilename}`;

    // 1. Check if journal entry for today already exists
    const existingFile = app.vault.getAbstractFileByPath(newJournalPath);
    if (existingFile) {
        new Notice('Journal entry for today already exists');
        return;
    }

    // 2. Check for today's daily note
    const allDailyNotes = getAllDailyNotes();
    const dailyNote = getDailyNote(now, allDailyNotes);

    if (!dailyNote) {
        new Notice("Today's daily note file does not exist. Please create it manually");
        return;
    }

    // Check if daily note has headers loaded (sometimes cache is slow, but we'll try to read content directly to be safe)
    let dailyNoteContent = await app.vault.read(dailyNote);
    if (!dailyNoteContent.includes('# Reflections')) {
        new Notice("Today's daily note does not contain '# Reflections' header.");
        return;
    }

    // 3. Get latest journal entry
    const latestJournalEntryDateString = await getLatestJournalEntry(app, journalPath);
    let previousEntryLink = "";

    if (latestJournalEntryDateString) {
        previousEntryLink = `[[journal-${latestJournalEntryDateString}|<--Previous entry]]`;
    } else {
        // First entry ever?
        previousEntryLink = `[[|<--Previous entry]]`;
    }

    // 4. Create new journal entry
    const newContent = `${previousEntryLink}\n\n`;

    // Ensure the directory exists
    if (!await app.vault.adapter.exists(journalPath)) {
        await app.vault.createFolder(journalPath);
    }

    const createdFile = await app.vault.create(newJournalPath, newContent);
    new Notice('Created journal entry for today');

    // 5. Modify previous journal entry
    if (latestJournalEntryDateString) {
        const previousJournalFilename = `journal-${latestJournalEntryDateString}.md`;
        const previousJournalPath = `${journalPath}/${previousJournalFilename}`;
        const previousFile = app.vault.getAbstractFileByPath(previousJournalPath);

        if (previousFile instanceof TFile) {
            console.log('Modifying previous journal entry to link to today\'s journal entry');
            await app.vault.process(previousFile, (data) => {
                const insertIndex = data.indexOf(']]') + 2;
                if (insertIndex > 1) { // ensure we found valid link end
                     return data.slice(0, insertIndex) + ` | [[journal-${dailyNoteString}|Next entry-->]]` + data.slice(insertIndex);
                }
                return data;
            });
            console.log('Previous journal entry modified successfully');
        }
    }

    // 6. Insert reference into daily notes file
    console.log('Inserting a reference into the daily notes file');
    await app.vault.process(dailyNote, (data) => {
        const marker = '# Reflections';
        const index = data.indexOf(marker);
        if (index !== -1) {
            const insertionPoint = index + marker.length;
            return data.slice(0, insertionPoint) + `\n\n[[journal-${dailyNoteString}|Journal entry]]` + data.slice(insertionPoint);
        }
        return data;
    });
    console.log("Today's daily note file modified successfully");
}
