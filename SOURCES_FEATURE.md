# Add and Remove Sources Feature

## Overview

The Add and Remove Sources feature allows users to dynamically manage source citations for each research question response. Users can:
- **Remove** existing sources that are not relevant
- **Add** new custom sources with name, URL, and type
- See visual feedback for all actions
- Regenerate responses with updated source lists

## Implementation Details

### JavaScript Functions

#### 1. `addSourcesCitation(responseContainer, sources, questionNumber)`
Creates and displays the sources section with all source items and controls.

**Parameters:**
- `responseContainer`: DOM element containing the response
- `sources`: Array of source objects `{name, url, type}`
- `questionNumber`: Unique identifier for the question

**Features:**
- Displays sources in a clean, organized list
- Shows source number, name, type, and link
- Adds remove button for each source
- Includes "Add Source" button at the bottom

#### 2. `handleRemoveSource(event, questionNumber, allSources)`
Handles the removal of a source from the list.

**Behavior:**
- Marks source as removed in state management
- Applies visual feedback (opacity, strikethrough)
- Disables the remove button
- Shows notification to regenerate response

**State Management:**
```javascript
state.sourcesManagement[questionNumber] = {
    removed: [source1, source2, ...],
    added: []
}
```

#### 3. `handleAddSourceClick(responseContainer, questionNumber)`
Opens the add source form when user clicks "Add Source" button.

**Features:**
- Prevents multiple forms from opening
- Creates inline form with three fields:
  - Source Name (text input)
  - URL (url input)
  - Type (dropdown select)
- Provides Cancel and Add buttons
- Auto-focuses on name input

#### 4. `handleAddSource(formDiv, questionNumber, responseContainer)`
Processes the new source submission.

**Validation:**
- Ensures both name and URL are provided
- Shows alert if validation fails

**Behavior:**
- Adds source to state management
- Creates new source item with special styling
- Animates the new source into view
- Removes the form
- Shows success notification

### CSS Styling

#### Source Container
```css
.response-sources {
    margin-top: var(--space-lg);
    padding: var(--space-md);
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
}
```

#### Source Items
```css
.source-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background-color: var(--color-bg-primary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
}
```

**Hover Effects:**
- Background color change
- Slight upward translation
- Remove button appears

#### Remove Button
```css
.source-item__remove {
    opacity: 0; /* Hidden by default */
    transition: all var(--transition-base);
}

.source-item:hover .source-item__remove {
    opacity: 1; /* Visible on hover */
}
```

**Hover State:**
- Red background color
- Scale animation
- Error color for icon

#### New Source Indicator
```css
.source-item--new {
    animation: slideIn 0.3s ease-out;
    border: 1px solid var(--color-accent);
}
```

#### Add Source Button
```css
.add-source-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-md);
    margin-top: var(--space-md);
    border: 1px dashed var(--color-border-medium);
    border-radius: var(--radius-sm);
}
```

**Hover State:**
- Solid border
- Background color change
- Upward translation

#### Add Source Form
```css
.add-source-form {
    margin-top: var(--space-md);
    padding: var(--space-md);
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border-medium);
    border-radius: var(--radius-md);
    animation: fadeIn 0.2s ease-out;
}
```

**Form Fields:**
- Full-width inputs and select
- Consistent padding and styling
- Focus states with accent color
- Placeholder text styling

**Action Buttons:**
- Cancel: Secondary style (transparent background)
- Add: Primary style (accent background)
- Hover effects with elevation

## User Experience Flow

### Removing a Source

1. User hovers over a source item
2. Remove button (X icon) appears
3. User clicks remove button
4. Source item gets visual feedback:
   - 50% opacity
   - Strikethrough text
   - Disabled remove button
5. Notification appears: "Source removed. Click Regenerate to update response."
6. Source is tracked in `state.sourcesManagement[questionNumber].removed`

### Adding a Source

1. User clicks "Add Source" button
2. Form slides in with animation
3. User fills in:
   - Source Name (required)
   - URL (required)
   - Type (dropdown with 7 options)
4. User clicks "Add" or "Cancel"
5. If Add:
   - Validation checks for name and URL
   - New source item appears with highlight border
   - Slide-in animation plays
   - Form disappears
   - Notification: "Source added. Click Regenerate to include in response."
6. If Cancel:
   - Form simply disappears

### Source Types Available

1. Web Source
2. Research
3. News
4. Company Data
5. Financial Report
6. Tech News
7. Documentation

## State Management

### Structure
```javascript
state.sourcesManagement = {
    [questionNumber]: {
        removed: [
            { name: "...", url: "...", type: "..." }
        ],
        added: [
            { name: "...", url: "...", type: "..." }
        ]
    }
}
```

### Usage in Regeneration

When user clicks "Regenerate" button:
1. Get original sources for the question
2. Filter out sources in `removed` array
3. Append sources from `added` array
4. Pass updated source list to AI generation
5. Clear the `removed` and `added` arrays after successful regeneration

## Accessibility Features

- **Keyboard Navigation**: All buttons and inputs are keyboard accessible
- **ARIA Labels**: Buttons have descriptive titles
- **Focus States**: Clear visual indicators for focused elements
- **Screen Reader Support**: Semantic HTML structure

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- ES6+ JavaScript features used

## Testing

### Test File
Open `test-sources.html` in a browser to test the functionality:

```bash
# From project root
open prospecting-board/test-sources.html
```

### Manual Test Cases

1. **Remove Source**
   - Hover over source item
   - Click remove button
   - Verify visual feedback
   - Check state management

2. **Add Source - Success**
   - Click "Add Source"
   - Fill in all fields
   - Click "Add"
   - Verify new source appears
   - Check animation

3. **Add Source - Validation**
   - Click "Add Source"
   - Leave name or URL empty
   - Click "Add"
   - Verify alert appears

4. **Add Source - Cancel**
   - Click "Add Source"
   - Click "Cancel"
   - Verify form disappears

5. **Remove Added Source**
   - Add a new source
   - Remove it immediately
   - Verify it's removed from state

## Future Enhancements

1. **Drag and Drop**: Reorder sources
2. **Bulk Operations**: Select multiple sources to remove
3. **Source Preview**: Show preview of URL content
4. **Source Validation**: Check if URLs are accessible
5. **Source Categories**: Group sources by type
6. **Import Sources**: Import from bibliography formats
7. **Export Sources**: Export source list as BibTeX or other formats

## Integration with Main App

The feature is fully integrated into `app.js`:
- Called from `generateFollowUpResponseWithSources()`
- Called from `generateMockResponseWithSources()`
- State persisted via `saveData()` function
- Notifications via `showNotification()` function

## Code Location

- **JavaScript**: `prospecting-board/js/app.js` (lines 514-725)
- **CSS**: `prospecting-board/css/components.css` (lines 737-1020)
- **Variables**: `prospecting-board/css/variables.css` (error colors added)
- **Test Page**: `prospecting-board/test-sources.html`

## Support

For issues or questions about this feature, refer to:
- Main documentation: `prospecting-board-architecture.md`
- Implementation roadmap: `implementation-roadmap.md`