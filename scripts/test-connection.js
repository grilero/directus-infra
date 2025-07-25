#!/usr/bin/env node

/**
 * Test Database and Directus Connection
 * 
 * This script tests both database and Directus connections for local development.
 * 
 * Usage: node test-connection.js [environment]
 * Examples:
 *   node test-connection.js          # Uses .env.local
 *   node test-connection.js local    # Uses .env.local
 *   node test-connection.js prod     # Uses .env.production
 */

const { Client } = require('pg');
const { createDirectus, rest } = require('@directus/sdk');
require('dotenv').config({ path: `./.env.${process.argv[2] || 'local'}` });

async function testDatabase() {
    console.log('🔍 Testing database connection...');
    
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 54322,
        database: process.env.DB_DATABASE || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    try {
        await client.connect();
        console.log('✅ Database connection successful!');
        
        // Test query
        const result = await client.query('SELECT version()');
        console.log(`📊 PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
        
        // Check if our tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('domains', 'books', 'chapters', 'questions')
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log('📋 Found tables:', tablesResult.rows.map(r => r.table_name).join(', '));
        } else {
            console.log('⚠️  No application tables found. Run bootstrap script first.');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

async function testDirectus() {
    console.log('\n🎯 Testing Directus health...');
    
    const directusUrl = process.env.PUBLIC_URL || 'http://localhost:8055';
    console.log(`📡 URL: ${directusUrl}`);
    
    try {
        const response = await fetch(`${directusUrl}/server/health`);
        if (response.ok) {
            const health = await response.json();
            console.log('✅ Directus is healthy:', health.status);
            
            // Test collections endpoint
            const collectionsResponse = await fetch(`${directusUrl}/collections`);
            if (collectionsResponse.ok) {
                const collectionsData = await collectionsResponse.json();
                console.log(`📋 Found ${collectionsData.data?.length || 0} collections`);
            }
            
            return true;
        } else {
            console.log('⚠️  Directus responded with status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Directus is not accessible:', error.message);
        console.log('💡 Make sure to run: npm run dev');
        return false;
    }
}

async function main() {
    const env = process.argv[2] || 'local';
    console.log(`🚀 Connection Test Started (${env} environment)\n`);
    
    const dbSuccess = await testDatabase();
    const directusSuccess = await testDirectus();
    
    console.log('\n📋 Summary:');
    console.log(`Database: ${dbSuccess ? '✅' : '❌'}`);
    console.log(`Directus: ${directusSuccess ? '✅' : '❌'}`);
    
    if (dbSuccess && directusSuccess) {
        console.log('\n🎉 All tests passed! System is ready for development.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        process.exit(1);
    }
}

main().catch(console.error);