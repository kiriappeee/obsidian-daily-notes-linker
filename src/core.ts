import { App, TFile } from 'obsidian';
import { getAllDailyNotes, getDailyNoteSettings, getDateFromFile } from 'obsidian-daily-notes-interface';
import moment, { Moment } from 'moment';

export interface IDailyNoteNeighbors {
    previous: TFile | null;
    next: TFile | null;
}

export function getAllNotesSorted(): TFile[] {
    const dailyNotes = getAllDailyNotes();
    const sortedDates = Object.keys(dailyNotes).sort((a, b) => {
        return moment(a, 'YYYY-MM-DD').valueOf() - moment(b, 'YYYY-MM-DD').valueOf();
    });
    return sortedDates.map(date => dailyNotes[date]);
}

export function getNeighbors(sortedNotes: TFile[], currentNote: TFile): IDailyNoteNeighbors {
    const currentIndex = sortedNotes.findIndex(note => note.path === currentNote.path);
    if (currentIndex === -1) {
        return { previous: null, next: null };
    }

    const previous = currentIndex > 0 ? sortedNotes[currentIndex - 1] : null;
    const next = currentIndex < sortedNotes.length - 1 ? sortedNotes[currentIndex + 1] : null;

    return { previous, next };
}

const PREV_LINK_REGEX = /\[\[[^|]*\|<--\s*previous\]\]/i;
const NEXT_LINK_REGEX = /\[\[[^|]*\|next\s*-->\]\]/i;

async function updateBacklink(app: App, previousFile: TFile, newNote: TFile) {
    await app.vault.process(previousFile, (data) => {
        return data.replace(NEXT_LINK_REGEX, `[[${newNote.basename}|next -->]]`);
    });
}

async function updateForwardLink(app: App, nextFile: TFile, newNote: TFile) {
    await app.vault.process(nextFile, (data) => {
        return data.replace(PREV_LINK_REGEX, `[[${newNote.basename}|<-- previous]]`);
    });
}

async function updateCurrentNoteLinks(app: App, currentNote: TFile, neighbors: IDailyNoteNeighbors) {
    await app.vault.process(currentNote, (data) => {
        let newContent = data;
        if (neighbors.previous) {
            newContent = newContent.replace(PREV_LINK_REGEX, `[[${neighbors.previous.basename}|<-- previous]]`);
        } else {
            newContent = newContent.replace(PREV_LINK_REGEX, `[[|<-- previous]]`);
        }

        if (neighbors.next) {
            newContent = newContent.replace(NEXT_LINK_REGEX, `[[${neighbors.next.basename}|next -->]]`);
        } else {
            newContent = newContent.replace(NEXT_LINK_REGEX, `[[|next -->]]`);
        }
        return newContent;
    });
}

export async function linkDailyNote(app: App, currentNote: TFile) {
    const sortedNotes = getAllNotesSorted();
    const neighbors = getNeighbors(sortedNotes, currentNote);

    await updateCurrentNoteLinks(app, currentNote, neighbors);

    if (neighbors.previous) {
        await updateBacklink(app, neighbors.previous, currentNote);
    }
    if (neighbors.next) {
        await updateForwardLink(app, neighbors.next, currentNote);
    }
}