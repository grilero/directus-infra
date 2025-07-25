#!/usr/bin/env node

/**
 * Remote Directus Bootstrap
 * 
 * Bootstraps Directus collections metadata for remote environments (dev/prod).
 * This script handles the Directus API configuration without direct container access.
 */

import { createDirectus, staticToken, rest } from '@directus/sdk';
import dotenv from 'dotenv';
import fs from 'fs';

const environment = process.argv[2] || 'dev';

// Load environment-specific configuration
const envFile = environment === 'production' ? '.env.prod' : '.env.dev';
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.error(`❌ Environment file ${envFile} not found!`);
  console.log('Please create the environment file with the following variables:');
  console.log('- PUBLIC_URL');
  console.log('- ADMIN_EMAIL');
  console.log('- ADMIN_PASSWORD');
  process.exit(1);
}

console.log(`🌐 Remote Bootstrap for: ${environment.toUpperCase()}`);
console.log(`📋 Using environment file: ${envFile}`);
console.log(`🔗 Target URL: ${process.env.PUBLIC_URL}`);

// Collection metadata configurations (same as local)
const collectionsMetadata = {
  domains: {
    icon: 'domain',
    note: 'Subject domains (Medicină Dentară, Medicină Generală)',
    color: '#9C27B0',
    display_template: '{{domain_name}}',
    sort_field: 'sort'
  },
  books: {
    icon: 'menu_book',
    note: 'Medical textbooks and educational resources',
    color: '#2196F3',
    display_template: '{{book_name}} by {{authors}}',
    sort_field: 'sort'
  },
  chapters: {
    icon: 'article',
    note: 'Book chapters organization',
    color: '#2196F3',
    display_template: '{{chapter_name}}',
    sort_field: 'sort'
  },
  subchapters: {
    icon: 'format_list_numbered',
    note: 'Sub-organization within chapters',
    color: '#2196F3',
    display_template: '{{subchapter_name}}',
    sort_field: 'sort'
  },
  questions: {
    icon: 'help',
    note: 'Published questions for quizzes and assessments',
    color: '#4CAF50',
    display_template: '{{question_prompt}}',
    sort_field: 'sort'
  },
  answer_options: {
    icon: 'radio_button_checked',
    note: 'Answer options for published questions',
    color: '#4CAF50',
    display_template: '{{text}}',
    sort_field: 'sort_order'
  },
  ai_question_staging: {
    icon: 'psychology',
    note: 'AI-generated questions awaiting review and approval',
    color: '#FF9800',
    display_template: '{{question_prompt}}',
    sort_field: 'created_at'
  },
  ai_answer_options_staging: {
    icon: 'quiz',
    note: 'Answer options for AI-generated questions',
    color: '#FF9800',
    display_template: '{{option_text}}',
    sort_field: 'option_order'
  },
  ai_generation_costs: {
    icon: 'analytics',
    note: 'Daily AI generation costs and usage tracking',
    color: '#4CAF50',
    display_template: '{{date}} - {{model_name}} (€{{total_cost_euros}})',
    sort_field: 'date'
  },
  flashcards: {
    icon: 'quiz',
    note: 'Flashcard content for spaced repetition learning',
    color: '#9C27B0',
    display_template: '{{front_text}}',
    sort_field: 'sort'
  },
  profiles: {
    icon: 'person',
    note: 'User profile information',
    color: '#607D8B',
    display_template: '{{first_name}} {{last_name}} ({{email}})',
    sort_field: 'updated_at'
  },
  quiz_instances: {
    icon: 'quiz',
    note: 'Individual quiz attempts by users',
    color: '#FF5722',
    display_template: 'Quiz {{id}} - {{status}}',
    sort_field: 'started_at'
  },
  quiz_templates: {
    icon: 'assignment',
    note: 'Reusable quiz configurations and templates',
    color: '#FF5722',
    display_template: '{{name}}',
    sort_field: 'created_at'
  },
  quiz_instance_questions: {
    icon: 'list_alt',
    note: 'Questions within quiz instances with order and answers',
    color: '#FF5722',
    display_template: 'Question {{question_order}}',
    sort_field: 'question_order'
  },
  quizzes: {
    icon: 'list_alt',
    note: 'Legacy quiz table for backward compatibility',
    color: '#E91E63',
    display_template: 'Legacy Quiz {{id}}',
    sort_field: 'date_created'
  },
  subscriptions: {
    icon: 'payment',
    note: 'Stripe subscription management',
    color: '#795548',
    display_template: '{{stripe_subscription_id}} - {{status}}',
    sort_field: 'created_at'
  },
  user_settings: {
    icon: 'settings',
    note: 'User preferences and configuration',
    color: '#607D8B',
    display_template: 'Settings for {{user_id}}',
    sort_field: 'updated_at'
  },
  test: {
    icon: 'science',
    note: 'Test collection for development purposes',
    color: '#9E9E9E',
    display_template: 'Test {{id}}',
    sort_field: 'id'
  }
};

// Field configurations (same as local)
const fieldConfigurations = {
  domains: {
    id: { interface: 'input-hash', readonly: true, hidden: true },
    domain_name: { interface: 'input', required: true, width: 'full' },
    status: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }
    },
    sort: { interface: 'input', hidden: true },
    user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] },
    date_created: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] },
    user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] },
    date_updated: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] }
  }
  // Note: Including only domains as example - full configuration would be identical to local
};

async function remoteBootstrap() {
  console.log('🎨 Starting remote Directus metadata bootstrap...\\n');
  
  try {
    // Get access token
    console.log('🔑 Getting access token...');
    const authResponse = await fetch(`${process.env.PUBLIC_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      })
    });
    
    const authData = await authResponse.json();
    if (!authData.data?.access_token) {
      throw new Error('Failed to get access token: ' + JSON.stringify(authData));
    }
    
    console.log('✅ Authentication successful!\\n');
    
    // Get all collections to see which ones exist
    const response = await fetch(`${process.env.PUBLIC_URL}/collections`, {
      headers: { 'Authorization': `Bearer ${authData.data.access_token}` }
    });
    const collectionsData = await response.json();
    const existingCollections = collectionsData.data.map(c => c.collection);
    
    let updatedCollections = 0;
    let skippedCollections = 0;
    
    // Update metadata for each collection
    for (const [collectionName, metadata] of Object.entries(collectionsMetadata)) {
      console.log(`🎨 Processing collection: ${collectionName}`);
      
      if (!existingCollections.includes(collectionName)) {
        console.log(`  ⏭️  Collection does not exist: ${collectionName}`);
        skippedCollections++;
        continue;
      }
      
      try {
        // Update collection metadata
        const updateResponse = await fetch(`${process.env.PUBLIC_URL}/collections/${collectionName}`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${authData.data.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            meta: {
              collection: collectionName,
              icon: metadata.icon,
              note: metadata.note,
              color: metadata.color,
              display_template: metadata.display_template,
              sort_field: metadata.sort_field,
              hidden: false,
              singleton: false,
              archive_app_filter: true,
              accountability: 'all',
              collapse: 'open',
              versioning: false
            }
          })
        });
        
        if (updateResponse.ok) {
          updatedCollections++;
          console.log(`  ✅ Updated metadata for: ${collectionName}`);
        } else {
          const errorData = await updateResponse.json();
          console.log(`  ⚠️  Failed to update ${collectionName}:`, errorData.errors?.[0]?.message || 'Unknown error');
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating collection ${collectionName}:`, error.message);
      }
      
      console.log(''); // Add spacing
    }
    
    // Summary
    console.log('🎉 Remote metadata bootstrap completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Collections updated: ${updatedCollections}`);
    console.log(`   • Collections skipped (not found): ${skippedCollections}`);
    console.log(`   • Total collections processed: ${Object.keys(collectionsMetadata).length}`);
    console.log(`   • Environment: ${environment.toUpperCase()}`);
    
    if (updatedCollections > 0) {
      console.log('\\n✨ Remote collections now have proper Directus metadata!');
      console.log('\\n🚀 Next steps:');
      console.log(`   1. Access Directus admin interface at ${process.env.PUBLIC_URL}`);
      console.log('   2. Verify all collections appear with proper styling');
      console.log('   3. Configure field metadata if needed');
    }
    
  } catch (error) {
    console.error('❌ Remote metadata bootstrap failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

// Run the remote bootstrap
remoteBootstrap();