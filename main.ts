import { Plugin, Notice, Editor, MarkdownView } from 'obsidian';
import { getDateFromFile } from 'obsidian-daily-notes-interface';
import { linkDailyNote } from './src/core'; // This function will be created next

export default class DailyNotesLinker extends Plugin {
	async onload() {
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
	}

	onunload() {

	}
}
