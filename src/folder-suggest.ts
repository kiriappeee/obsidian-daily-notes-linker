import { AbstractInputSuggest, App, TAbstractFile, TFolder } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    textInputEl: HTMLInputElement;

    constructor(app: App, textInputEl: HTMLInputElement) {
        super(app, textInputEl);
        this.textInputEl = textInputEl;
    }

    getSuggestions(query: string): TFolder[] {
        const lowerCaseQuery = query.toLowerCase();
        const files = this.app.vault.getAllLoadedFiles();
        const folders: TFolder[] = [];

        for (const file of files) {
            if (file instanceof TFolder && file.path.toLowerCase().includes(lowerCaseQuery)) {
                folders.push(file);
            }
        }

        return folders;
    }

    renderSuggestion(file: TFolder, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFolder, evt: MouseEvent | KeyboardEvent): void {
        this.textInputEl.value = file.path;
        this.textInputEl.dispatchEvent(new Event('input', { bubbles: true }));
        this.close();
    }
}
