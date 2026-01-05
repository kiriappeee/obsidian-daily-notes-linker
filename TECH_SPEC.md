# Technical Specification: Chronological Daily Notes Linker

## 1. Project Overview

A specialized Obsidian plugin to manage chronological navigation between Daily Notes. Unlike standard plugins that calculate dates (T±1), this plugin performs **Stateful Discovery** to link notes based on the file system state. This ensures correct linking even when there are gaps in the daily entries (e.g., Friday links directly to Monday).

## 2. Core Requirements

- **Dependencies:** `obsidian-daily-notes-interface`, `moment`.
    
- **Link Format:** The plugin relies on existing Wikilink structures in the user's template acting as anchors.
    
    - Previous Anchor: `[[|<- Previous]]`
        
    - Next Anchor: `[[|Next ->]]`
        
- **Logic:**
    
    1. **Discovery:** Scan existing notes to find the true chronological neighbors.
        
    2. **Creation:** Create the new note with its links pre-filled.
        
    3. **Handshake:** Update the neighboring notes to point to the new note.
        

---

## 3. Data Structures & Regex

### A. Regex Patterns

The plugin must use these patterns to identify links in both "clean" templates and "existing" files (for updates).

|Type|Regex Pattern|Description|
|---|---|---|
|**Previous Link**|`/\[\[(.*?)\|<- Previous\]\]/`|Captures the filename (if any) before the pipe. Matches `[[|
|**Next Link**|`/\[\[(.*?)\|Next ->\]\]/`|Captures the filename (if any) before the pipe. Matches `[[|
