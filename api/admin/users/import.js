// User import API endpoint
// POST /api/admin/users/import - Import users from CSV file

import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const users = await parseCSVFile(file.filepath);
    const result = await importUsers(users);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error importing users:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Import failed'
    });
  }
}

async function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const users = [];
    const errors = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Validate required fields
          if (!row.first_name || !row.last_name || !row.email) {
            errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row.email)) {
            errors.push(`Invalid email format: ${row.email}`);
            return;
          }

          const user = {
            first_name: row.first_name.trim(),
            last_name: row.last_name.trim(),
            email: row.email.trim().toLowerCase(),
            role: row.role?.trim() || 'participant',
            phone: row.phone?.trim() || null,
            location: row.location?.trim() || null,
            status: 'active',
            created_at: new Date().toISOString()
          };

          // Validate role
          const validRoles = ['admin', 'researcher', 'participant'];
          if (!validRoles.includes(user.role)) {
            user.role = 'participant'; // Default to participant for invalid roles
          }

          users.push(user);
        } catch (err) {
          errors.push(`Error processing row: ${err.message}`);
        }
      })
      .on('end', () => {
        resolve({ users, errors });
      })
      .on('error', reject);
  });
}

async function importUsers(parsedData) {
  const { users, errors } = parsedData;
  const successful = [];
  const failed = [];
  const skipped = [];

  for (const user of users) {
    try {
      // TODO: Replace with real Supabase operations
      
      // Check if user already exists
      // const { data: existingUser, error: checkError } = await supabase
      //   .from('users')
      //   .select('id')
      //   .eq('email', user.email)
      //   .single();

      // if (existingUser) {
      //   skipped.push({
      //     email: user.email,
      //     reason: 'User already exists'
      //   });
      //   continue;
      // }

      // Create new user
      // const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      //   email: user.email,
      //   password: generateRandomPassword(),
      //   email_confirm: true,
      //   user_metadata: {
      //     first_name: user.first_name,
      //     last_name: user.last_name,
      //     role: user.role
      //   }
      // });

      // if (createError) throw createError;

      // Update user profile
      // const { error: profileError } = await supabase
      //   .from('user_profiles')
      //   .insert({
      //     user_id: newUser.user.id,
      //     first_name: user.first_name,
      //     last_name: user.last_name,
      //     phone: user.phone,
      //     location: user.location,
      //     created_at: user.created_at
      //   });

      // if (profileError) throw profileError;

      // For now, simulate successful import
      successful.push({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role
      });

    } catch (error) {
      failed.push({
        email: user.email,
        reason: error.message
      });
    }
  }

  return {
    total: users.length,
    successful: successful.length,
    failed: failed.length,
    skipped: skipped.length,
    errors: [
      ...errors,
      ...failed.map(f => `Failed to import ${f.email}: ${f.reason}`),
      ...skipped.map(s => `Skipped ${s.email}: ${s.reason}`)
    ],
    details: {
      successful,
      failed,
      skipped
    }
  };
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}
