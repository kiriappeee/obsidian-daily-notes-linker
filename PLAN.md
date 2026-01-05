# Implementation Plan

## Phase 1: Foundation & Discovery (Read-Only)

**Goal:** Establish file retrieval and sorting logic without modifying data.

- **Step 1.1: Setup**
    
    - Initialize `main.ts` and `manifest.json`.
        
    - Install dependencies: `npm install obsidian-daily-notes-interface`.
        
    - Ensure `app.vault` is accessible.
        
- **Step 1.2: Implement `getAllNotesSorted()`**
    
    - Use `getAllDailyNotes()` from the library to fetch the Record of notes.
        
    - Extract keys (date strings), convert them to `Moment` objects, and sort them chronologically (oldest to newest).
        
    - Return a sorted array of `TFile` objects.
        
- **Step 1.3: Implement `getNeighbors(targetDate: Moment)`**
    
    - Input: The date of the note currently being created.
        
    - Logic:
        
        - Traverse the sorted array from Step 1.2.
            
        - **Previous:** Find the last file with a date _before_ `targetDate`.
            
        - **Next:** Find the first file with a date _after_ `targetDate`.
            
    - Output: Returns `IDailyNoteNeighbors`.
        

## Phase 2: Note Creation (Regex Hydration)

**Goal:** Create a new note where the links are populated based on the discovery phase.

- **Step 2.1: Implement `createDailyNoteWithLinks(date)`**
    
    - **Fetch Neighbors:** Call `getNeighbors(date)`.
        
    - **Read Template:** Fetch the user's configured Daily Note template content.
        
    - **Apply "Previous" Replacement:**
        
        - Match: `/\[\[(.*?)\|<- Previous\]\]/`
            
        - Logic: If `neighbors.previous` exists, replace the match with `[[${neighbors.previous.basename}|<- Previous]]`.
            
        - Fallback: If `neighbors.previous` is null, replace with `[[|<- Previous]]` (keep empty) or remove the link entirely (optional).
            
    - **Apply "Next" Replacement (Middle Insertion):**
        
        - Match: `/\[\[(.*?)\|Next ->\]\]/`
            
        - Logic: If `neighbors.next` exists (rare case: inserting a note in the past), replace the match with `[[${neighbors.next.basename}|Next ->]]`.
            
    - **Write File:** Use `createDailyNote(date)` (from library) or `app.vault.create` with the processed content.
        

## Phase 3: The Handshake (Updates)

**Goal:** Update existing files to point to the newly created note.

- **Step 3.1: Backward Update (Updating the Past)**
    
    - Function: `updateBacklink(previousFile: TFile, newNote: TFile)`
        
    - Action:
        
        - Use `app.vault.process(previousFile, (data) => { ... })`.
            
        - Inside the callback, perform a string replacement on `data`.
            
        - Target: `/\[\[(.*?)\|Next ->\]\]/`
            
        - Replacement: `[[${newNote.basename}|Next ->]]`
            
    - _Note: This ensures that the "Previous" note now points forward to the "New" note._
        
- **Step 3.2: Forward Update (Updating the Future)**
    
    - _Condition:_ Only runs if `neighbors.next` was not null (Middle Insertion).
        
    - Function: `updateForwardLink(nextFile: TFile, newNote: TFile)`
        
    - Action:
        
        - Use `app.vault.process(nextFile, (data) => { ... })`.
            
        - Target: `/\[\[(.*?)\|<- Previous\]\]/`
            
        - Replacement: `[[${newNote.basename}|<- Previous]]`
            
    - _Note: This ensures that the "Future" note now points backward to the "New" note._
        

## Phase 4: Safety & Edge Cases

**Goal:** Prevent data corruption.

- **Step 4.1: Template Validation**
    
    - Before creating a file, check if the raw template actually contains the strings `|<- Previous]]` and `|Next ->]]`.
        
    - If missing, throw a console warning or user notification: "Template missing required link anchors."
        
- **Step 4.2: Atomic Processing**
    
    - Ensure all file updates utilize `app.vault.process` to prevent race conditions if the user is actively typing in one of the neighbor files.
