#!/usr/bin/env node

/**
 * Migration script to export drawings from SQLite and import to Supabase
 * 
 * Usage:
 * 1. First run: node migrate-drawings.js export
 *    - This exports all drawings from SQLite to drawings-backup.json
 * 
 * 2. Then run: node migrate-drawings.js import
 *    - This imports all drawings from drawings-backup.json to Supabase
 * 
 * Prerequisites:
 * - Your .env.development.local file must be set up with Supabase credentials
 * - Supabase tables must be created (run supabase-schema.sql first)
 */

const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.development.local' });

const BACKUP_FILE = 'drawings-backup.json';
const SQLITE_DB_PATH = path.join(__dirname, 'data', 'drawings.db');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase environment variables not found.');
    console.log('Make sure your .env.development.local file contains:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Export drawings from SQLite to JSON file
 */
async function exportDrawings() {
    try {
        console.log('🔍 Checking SQLite database...');

        if (!fs.existsSync(SQLITE_DB_PATH)) {
            console.error(`❌ SQLite database not found at: ${SQLITE_DB_PATH}`);
            process.exit(1);
        }

        const db = new Database(SQLITE_DB_PATH, { readonly: true });

        // Get all drawings
        const drawings = db.prepare('SELECT * FROM drawings ORDER BY created_at ASC').all();
        console.log(`📊 Found ${drawings.length} drawings in SQLite database`);

        if (drawings.length === 0) {
            console.log('ℹ️  No drawings to export');
            db.close();
            return;
        }

        // Get all entities for reference
        const entities = {};
        const entityTables = ['canals', 'rides', 'headgates', 'meters', 'pumps', 'pivots', 'lands'];

        for (const table of entityTables) {
            try {
                const tableData = db.prepare(`SELECT * FROM ${table}`).all();
                entities[table] = tableData;
                console.log(`📋 Found ${tableData.length} ${table}`);
            } catch (error) {
                console.log(`⚠️  Table ${table} not found or empty`);
                entities[table] = [];
            }
        }

        db.close();

        // Save to JSON file
        const backupData = {
            timestamp: new Date().toISOString(),
            drawings: drawings,
            entities: entities
        };

        fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));
        console.log(`✅ Exported ${drawings.length} drawings to ${BACKUP_FILE}`);
        console.log(`📁 Backup file size: ${(fs.statSync(BACKUP_FILE).size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('❌ Export failed:', error.message);
        process.exit(1);
    }
}

/**
 * Import drawings from JSON file to Supabase
 */
async function importDrawings() {
    try {
        console.log('📂 Checking backup file...');

        if (!fs.existsSync(BACKUP_FILE)) {
            console.error(`❌ Backup file not found: ${BACKUP_FILE}`);
            console.log('Run "node migrate-drawings.js export" first');
            process.exit(1);
        }

        const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
        const { drawings, entities } = backupData;

        console.log(`📊 Loading ${drawings.length} drawings from backup`);
        console.log(`📅 Backup created: ${backupData.timestamp}`);

        // Test Supabase connection
        console.log('🔗 Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase.from('drawings').select('count').limit(1);
        if (testError) {
            console.error('❌ Supabase connection failed:', testError.message);
            console.log('Make sure:');
            console.log('1. Your Supabase credentials are correct');
            console.log('2. You have run the supabase-schema.sql to create tables');
            process.exit(1);
        }
        console.log('✅ Supabase connection successful');

        // Import entities first
        for (const [tableName, tableData] of Object.entries(entities)) {
            if (tableData.length > 0) {
                console.log(`📥 Importing ${tableData.length} ${tableName}...`);

                const { error } = await supabase
                    .from(tableName)
                    .upsert(tableData, { onConflict: 'id' });

                if (error) {
                    console.error(`❌ Failed to import ${tableName}:`, error.message);
                } else {
                    console.log(`✅ Imported ${tableData.length} ${tableName}`);
                }
            }
        }

        // Import drawings in batches (Supabase has limits)
        const batchSize = 100;
        let importedCount = 0;

        for (let i = 0; i < drawings.length; i += batchSize) {
            const batch = drawings.slice(i, i + batchSize);
            console.log(`📥 Importing drawings ${i + 1}-${Math.min(i + batchSize, drawings.length)} of ${drawings.length}...`);

            const { error } = await supabase
                .from('drawings')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Failed to import batch ${i + 1}-${i + batchSize}:`, error.message);
                console.log('Stopping import to prevent data corruption');
                break;
            } else {
                importedCount += batch.length;
                console.log(`✅ Imported batch of ${batch.length} drawings`);
            }
        }

        console.log(`🎉 Migration complete! Successfully imported ${importedCount} of ${drawings.length} drawings`);

        // Verify the import
        console.log('🔍 Verifying import...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('drawings')
            .select('count');

        if (!verifyError) {
            console.log(`✅ Verification: Found drawings in Supabase database`);
        }

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    }
}

/**
 * Main function
 */
async function main() {
    const command = process.argv[2];

    console.log('🚀 SQLite to Supabase Migration Tool\n');

    if (command === 'export') {
        await exportDrawings();
    } else if (command === 'import') {
        await importDrawings();
    } else {
        console.log('Usage:');
        console.log('  node migrate-drawings.js export   # Export from SQLite to JSON');
        console.log('  node migrate-drawings.js import   # Import from JSON to Supabase');
        console.log('');
        console.log('Make sure to:');
        console.log('1. Set up your .env.development.local file with Supabase credentials');
        console.log('2. Run the supabase-schema.sql in your Supabase dashboard first');
        console.log('3. Run export first, then import');
        process.exit(1);
    }
}

main().catch(console.error);
