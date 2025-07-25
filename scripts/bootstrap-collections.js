#!/usr/bin/env node

/**
 * Bootstrap Directus Collections
 * 
 * This script automatically configures Directus collections and fields
 * for tables that exist in the database but aren't properly configured.
 * 
 * Usage: node bootstrap-collections.js
 */

import { createDirectus, staticToken, rest, createCollection, createField, updateField } from '@directus/sdk';
import 'dotenv/config';

const directus = createDirectus(process.env.PUBLIC_URL || 'https://content.grile.ro')
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
  .with(rest());

// Field interface mappings based on data type
const getFieldInterface = (dataType, columnName) => {
  if (columnName === 'id') return 'input-hash';
  if (columnName === 'status') return 'select-dropdown-m2o';
  if (columnName === 'sort') return 'input';
  if (columnName.includes('user_created') || columnName.includes('user_updated')) return 'select-dropdown-m2o';
  if (columnName.includes('date_created') || columnName.includes('date_updated') || columnName.includes('created_at') || columnName.includes('updated_at')) return 'datetime';
  
  switch (dataType) {
    case 'uuid': return 'input-hash';
    case 'integer': return 'input';
    case 'boolean': return 'boolean';
    case 'character varying': return 'input';
    case 'text': return 'input-multiline';
    case 'timestamp with time zone': return 'datetime';
    case 'ARRAY': return 'tags';
    default: return 'input';
  }
};

// Collection configurations
const collectionsConfig = {
  quiz_instance_questions: {
    collection: 'quiz_instance_questions',
    icon: 'quiz',
    note: 'Questions within quiz instances',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'quiz_instance_id', interface: 'select-dropdown-m2o', display: 'related-values' },
      { field: 'question_id', interface: 'select-dropdown-m2o', display: 'related-values' },
      { field: 'question_order', interface: 'input', width: 'half' },
      { field: 'correct_option_ids', interface: 'tags', width: 'full' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },
  
  subchapters: {
    collection: 'subchapters',
    icon: 'menu_book',
    note: 'Book subchapters for content organization',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'status', interface: 'select-dropdown', options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }, { text: 'Archived', value: 'archived' }] } },
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true },
      { field: 'subchapter_name', interface: 'input', required: true, width: 'full' },
      { field: 'chapter_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'start_page', interface: 'input', width: 'half' }
    ]
  },
  
  user_settings: {
    collection: 'user_settings',
    icon: 'settings',
    note: 'User preference settings',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'user_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true },
      { field: 'enable_timer', interface: 'boolean', width: 'half' },
      { field: 'show_correct_answers', interface: 'boolean', width: 'half' },
      { field: 'randomize_questions', interface: 'boolean', width: 'half' },
      { field: 'study_reminders', interface: 'boolean', width: 'half' },
      { field: 'quiz_results', interface: 'boolean', width: 'half' },
      { field: 'theme', interface: 'select-dropdown', options: { choices: [{ text: 'System', value: 'system' }, { text: 'Light', value: 'light' }, { text: 'Dark', value: 'dark' }] }, width: 'half' },
      { field: 'language', interface: 'select-dropdown', options: { choices: [{ text: 'English', value: 'en' }, { text: 'Romanian', value: 'ro' }] }, width: 'half' },
      { field: 'created_at', interface: 'datetime', readonly: true, hidden: true },
      { field: 'updated_at', interface: 'datetime', readonly: true, hidden: true }
    ]
  }
};

async function bootstrapCollections() {
  console.log('🚀 Starting Directus collections bootstrap...\n');
  
  try {
    // Get existing collections
    const existingCollections = await directus.request(rest().collections.read());
    const existingCollectionNames = existingCollections.map(c => c.collection);
    
    // Get existing fields for collections that need interface updates
    const existingFields = await directus.request(rest().fields.read());
    
    // Process each collection configuration
    for (const [collectionName, config] of Object.entries(collectionsConfig)) {
      console.log(`📋 Processing collection: ${collectionName}`);
      
      // Create collection if it doesn't exist
      if (!existingCollectionNames.includes(collectionName)) {
        console.log(`  ➕ Creating collection: ${collectionName}`);
        
        await directus.request(createCollection({
          collection: collectionName,
          icon: config.icon,
          note: config.note,
          fields: config.fields
        }));
        
        console.log(`  ✅ Created collection: ${collectionName}`);
      } else {
        console.log(`  ℹ️  Collection exists: ${collectionName}`);
        
        // Update fields that have null interfaces
        const collectionFields = existingFields.filter(f => f.collection === collectionName);
        
        for (const fieldConfig of config.fields) {
          const existingField = collectionFields.find(f => f.field === fieldConfig.field);
          
          if (existingField && !existingField.interface) {
            console.log(`    🔧 Updating field interface: ${fieldConfig.field}`);
            
            await directus.request(updateField(collectionName, fieldConfig.field, {
              interface: fieldConfig.interface,
              display: fieldConfig.display || null,
              options: fieldConfig.options || null,
              readonly: fieldConfig.readonly || false,
              hidden: fieldConfig.hidden || false,
              width: fieldConfig.width || 'full',
              required: fieldConfig.required || false
            }));
            
            console.log(`    ✅ Updated field: ${fieldConfig.field}`);
          }
        }
      }
    }
    
    // Fix flashcards collection interfaces
    console.log(`📋 Processing existing collection: flashcards`);
    const flashcardFields = existingFields.filter(f => f.collection === 'flashcards');
    
    const flashcardFieldConfigs = {
      id: { interface: 'input', readonly: true, hidden: true },
      status: { interface: 'select-dropdown', options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }, { text: 'Archived', value: 'archived' }] } },
      sort: { interface: 'input', hidden: true },
      user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      date_created: { interface: 'datetime', readonly: true, hidden: true },
      user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      date_updated: { interface: 'datetime', readonly: true, hidden: true }
    };
    
    for (const [fieldName, fieldConfig] of Object.entries(flashcardFieldConfigs)) {
      const existingField = flashcardFields.find(f => f.field === fieldName);
      
      if (existingField && !existingField.interface) {
        console.log(`  🔧 Updating flashcards field interface: ${fieldName}`);
        
        await directus.request(updateField('flashcards', fieldName, fieldConfig));
        
        console.log(`  ✅ Updated flashcards field: ${fieldName}`);
      }
    }
    
    console.log('\n🎉 Bootstrap completed successfully!');
    console.log('📝 You can now refresh your Directus admin interface to see the changes.');
    
  } catch (error) {
    console.error('❌ Bootstrap failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

// Run the bootstrap
bootstrapCollections();