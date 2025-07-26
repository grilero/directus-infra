# AI Question Review Layout Extension

A Directus layout extension that provides an accordion-style interface for reviewing AI-generated questions in the Grile.ro educational platform.

## Features

- **Accordion Interface**: Expandable question cards showing full details
- **Two-Section Layout**: 
  - Pending Review: Questions awaiting approval/decline
  - Reviewed: Previously processed questions with status
- **Answer Options Display**: Shows all answer choices with correct answers highlighted
- **Accept/Decline Actions**: One-click approval or decline with mandatory reason
- **Real-time Stats**: Live counts of pending and reviewed questions
- **Responsive Design**: Works on desktop and mobile devices

## Installation

This extension is automatically included in the Directus bootstrap system. It will be available as a layout option for the `ai_question_staging` collection.

## Usage

1. Navigate to the `ai_question_staging` collection in Directus
2. Switch to the "AI Question Review" layout from the layout picker
3. Review questions in the pending section:
   - Click on a question to expand and see details
   - View all answer options (correct answers are highlighted)
   - Click "Accept" to move question to production
   - Click "Decline" to reject (requires reason comment)

## Database Dependencies

This extension requires the following stored procedures to be available:

- `accept_ai_question(INTEGER)`: Moves question from staging to production
- `decline_ai_question(INTEGER, TEXT)`: Marks question as declined with reason

These procedures are automatically created by the migration `20250725000002_ai_review_procedures.sql`.

## Collections Used

- **ai_question_staging**: Main questions awaiting review
- **ai_answer_options_staging**: Answer options for staging questions
- **questions**: Production questions table (destination for accepted questions)
- **answer_options**: Production answer options table

## Development

To modify this extension:

```bash
# Navigate to extension directory
cd extensions/directus-extension-layout-ai-review

# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build
```

## File Structure

```
src/
├── index.js              # Extension entry point
└── ai-review-layout.vue  # Main Vue component
```

## Permissions

Users need the following permissions to use this layout effectively:

- **Read** access to `ai_question_staging` and `ai_answer_options_staging`
- **Update** access to `ai_question_staging` (for status changes)
- **Create** access to `questions` and `answer_options` (for accepted questions)
- **Execute** access to stored procedures `accept_ai_question` and `decline_ai_question`

## Troubleshooting

### Layout not appearing
- Ensure the extension is built (`npm run build`)
- Check that Directus has `EXTENSIONS_AUTO_RELOAD=true` or restart Directus
- Verify you're viewing the `ai_question_staging` collection

### Accept/Decline not working
- Check that the stored procedures exist in your database
- Ensure user has execute permissions on the stored procedures
- Check browser console for API errors

### Empty question list
- Verify you have questions in `ai_question_staging` with status `pending_review`
- Check database connection and permissions
- Ensure the AI question generation system is working

## Version History

- **1.0.0**: Initial release with accordion interface and accept/decline functionality