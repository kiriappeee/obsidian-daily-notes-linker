import { Plugin, Notice, Editor, MarkdownView } from 'obsidian';
import { getDateFromFile } from 'obsidian-daily-notes-interface';
import { linkDailyNote } from './src/core';
import { createJournalEntry } from './src/journal';
import { DailyNotesLinkerSettings, DEFAULT_SETTINGS } from './src/settings';
import { DailyNotesLinkerSettingTab } from './src/settings-tab';

export default class DailyNotesLinker extends Plugin {
	settings: DailyNotesLinkerSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'link-current-daily-note',
			name: 'Link current daily note',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const file = view.file;
				if (!file) {
					return;
				}

				const fileDate = getDateFromFile(file, "day");

		        if (!fileDate) {
		            new Notice("The current file is not a daily note.");
		            return;
		        }

				try {
					await linkDailyNote(this.app, file);
					new Notice(`Links updated for ${file.basename}.`);
				} catch (err) {
					console.error('Failed to link daily note:', err);
					new Notice('Error linking daily note. Check the console.');
				}
			}
		});

		this.addCommand({
			id: 'create-journal-entry',
			name: 'Create journal entry',
			callback: async () => {
				await createJournalEntry(this.app, this.settings);
			}
		});

		this.addSettingTab(new DailyNotesLinkerSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
