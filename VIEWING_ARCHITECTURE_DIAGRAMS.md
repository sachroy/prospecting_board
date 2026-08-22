# How to View Architecture Diagrams in VS Code

## Option 2: Using VS Code Extension (Recommended)

### Step 1: Install the Mermaid Extension

1. **Open VS Code Extensions Panel**:
   - Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
   - OR click the Extensions icon in the left sidebar (looks like 4 squares)

2. **Search for Mermaid Extension**:
   - Type "Markdown Preview Mermaid Support" in the search box
   - Look for the extension by **Matt Bierner**
   - Click the **Install** button

   Alternative extension names to search for:
   - "Markdown Preview Mermaid Support"
   - "Mermaid Markdown Syntax Highlighting"
   - "Mermaid Preview"

### Step 2: Open the Architecture Diagram File

1. The file `ARCHITECTURE_DIAGRAM.md` should already be open in VS Code
2. If not, navigate to: `prospecting-board/ARCHITECTURE_DIAGRAM.md`

### Step 3: Open Markdown Preview

**Method A - Using Command Palette:**
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Markdown: Open Preview to the Side"
3. Press Enter

**Method B - Using Keyboard Shortcut:**
1. With the `ARCHITECTURE_DIAGRAM.md` file open
2. Press `Cmd+K V` (Mac) or `Ctrl+K V` (Windows/Linux)

**Method C - Using Button:**
1. Look for the preview button in the top-right corner of the editor
2. Click the icon that looks like a split screen with a magnifying glass

### Step 4: View the Diagrams

- The preview pane will open on the right side
- All 7 Mermaid diagrams will be rendered as visual graphics
- You can scroll through to see each diagram

### Step 5: Export Diagrams to PowerPoint

**Option A - Screenshot Method:**
1. Take screenshots of each diagram from the preview pane
2. Use `Cmd+Shift+4` (Mac) or Snipping Tool (Windows)
3. Paste screenshots into PowerPoint

**Option B - Right-Click Export (if supported):**
1. Right-click on a diagram in the preview
2. Look for "Copy Image" or "Save Image As"
3. Save as PNG or SVG
4. Insert into PowerPoint

---

## Alternative: Option 1 - Using Mermaid Live Editor (No Installation Required)

If the VS Code extension doesn't work, use this web-based method:

### Step 1: Open Mermaid Live Editor
1. Go to: https://mermaid.live/
2. You'll see a split-screen editor

### Step 2: Copy Diagram Code
1. Open `ARCHITECTURE_DIAGRAM.md` in VS Code
2. Find a diagram code block (starts with ` ```mermaid `)
3. Copy everything between ` ```mermaid ` and ` ``` `

### Step 3: Paste and View
1. Paste the code into the left panel of Mermaid Live Editor
2. The diagram will render automatically on the right side

### Step 4: Export
1. Click the **"Actions"** button in the top-right
2. Choose export format:
   - **PNG** - Best for PowerPoint (recommended)
   - **SVG** - Vector format (scalable)
   - **PDF** - For printing
3. Download the file
4. Insert into PowerPoint

### Step 5: Repeat for All Diagrams
Repeat steps 2-4 for each of the 7 diagrams:
1. System Architecture Overview
2. Component Architecture
3. Data Flow Architecture
4. Technology Stack
5. Deployment Architecture
6. Security Architecture
7. Module Interaction Flow

---

## Troubleshooting

### Extension Not Rendering Diagrams
- **Solution 1**: Reload VS Code window (`Cmd+Shift+P` → "Reload Window")
- **Solution 2**: Try a different Mermaid extension from the marketplace
- **Solution 3**: Use the Mermaid Live Editor method instead

### Preview Not Opening
- **Solution**: Make sure you have the `.md` file active/selected before opening preview
- **Solution**: Try closing and reopening VS Code

### Diagrams Look Broken
- **Solution**: The Mermaid syntax might need the extension to be properly installed
- **Solution**: Use Mermaid Live Editor as a fallback

---

## Quick Reference: Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Open Extensions | `Cmd+Shift+X` | `Ctrl+Shift+X` |
| Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Markdown Preview | `Cmd+K V` | `Ctrl+K V` |
| Screenshot | `Cmd+Shift+4` | Snipping Tool |

---

## Next Steps After Viewing

Once you can see the diagrams:
1. Review each diagram for accuracy
2. Export the ones you need for your presentation
3. Customize colors/styling in PowerPoint if needed
4. Add your own annotations or notes

The diagrams are designed to be presentation-ready and cover all aspects of the Prospecting Board architecture.