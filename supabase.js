import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

class SupabaseSessionRestorer {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Supabase credentials missing in Environment Variables');
            this.supabase = null;
        } else {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            console.log('✅ Supabase Restorer Initialized');
        }
    }

    /**
     * Restore session from Supabase to local sessions folder
     */
    async restoreSession() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase client not initialized. Check your URL and Key.');
            }

            // Get session ID from environment variable
            const sessionId = process.env.SESSION_ID;
            if (!sessionId) {
                throw new Error('❌ SESSION_ID environment variable is required');
            }

            console.log(`🔍 Searching Supabase for session: ${sessionId}`);

            // Fetch the session from the session_store table
            const { data, error } = await this.supabase
                .from('session_store')
                .select('session_id, creds_data')
                .ilike('session_id', `%${sessionId}%`)
                .limit(1)
                .single();
            
            if (error || !data) {
                throw new Error(`❌ No session found in Supabase matching: ${sessionId}`);
            }

            const foundSessionId = data.session_id;
            const credsData = data.creds_data;

            console.log(`✅ Found session: ${foundSessionId}`);

            // Create sessions folder if it doesn't exist
            const sessionsDir = './sessions';
            await fs.mkdir(sessionsDir, { recursive: true });

            // Save as creds.json in the sessions folder
            const credsPath = path.join(sessionsDir, 'creds.json');
            
            // Supabase stores JSON as an object, so we stringify it for the file
            await fs.writeFile(credsPath, JSON.stringify(credsData, null, 2));
            
            console.log(`✅ Session restored to: ${credsPath}`);
            console.log(`📥 Logged in as: ${credsData.me?.id || 'unknown'}`);

            return {
                success: true,
                sessionId: foundSessionId,
                filePath: credsPath
            };

        } catch (error) {
            console.error('❌ Session restoration failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search for available sessions in Supabase
     */
    async searchSessions(searchPattern = '') {
        try {
            if (!this.supabase) return [];

            let query = this.supabase.from('session_store').select('session_id');
            
            if (searchPattern) {
                query = query.ilike('session_id', `%${searchPattern}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            
            console.log(`🔍 Found ${data.length} sessions in Supabase`);
            return data.map(item => ({
                sessionId: item.session_id
            }));
        } catch (error) {
            console.error('❌ Search failed:', error.message);
            return [];
        }
    }
}

// Create and export singleton instance
const supabaseSessionRestorer = new SupabaseSessionRestorer();
export default supabaseSessionRestorer;
