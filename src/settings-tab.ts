import { App, PluginSettingTab, Setting } from 'obsidian';
import DailyNotesLinker from '../main';
import { FolderSuggest } from './folder-suggest';

export class DailyNotesLinkerSettingTab extends PluginSettingTab {
    plugin: DailyNotesLinker;

    constructor(app: App, plugin: DailyNotesLinker) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Daily Notes Linker Settings' });

        new Setting(containerEl)
            .setName('Journal Folder Path')
            .setDesc('The folder where journal entries are created (e.g. Logs/Journal).')
            .addText(text => {
                new FolderSuggest(this.app, text.inputEl);
                text
                    .setPlaceholder('Logs/Journal')
                    .setValue(this.plugin.settings.journalPath)
                    .onChange(async (value) => {
                        this.plugin.settings.journalPath = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
