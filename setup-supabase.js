#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// معلومات الاتصال بـ Supabase
const SUPABASE_URL = 'https://wpougbxitczmgusszfpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sbp_13f2ca08cd51cf75b23abb66f022e5639e66bcec';

// إنشاء عميل Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filename) {
  console.log(`🔄 تطبيق ${filename}...`);
  
  try {
    const sqlContent = fs.readFileSync(path.join('database/complete', filename), 'utf8');
    
    // تقسيم الملف إلى أوامر منفصلة
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('\\echo'));
    
    console.log(`📋 عدد الأوامر: ${commands.length}`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: command + ';' 
          });
          
          if (error) {
            console.log(`⚠️  تحذير في الأمر ${i + 1}: ${error.message}`);
          } else {
            console.log(`✅ تم تنفيذ الأمر ${i + 1}`);
          }
        } catch (err) {
          console.log(`⚠️  خطأ في الأمر ${i + 1}: ${err.message}`);
        }
      }
    }
    
    console.log(`✅ تم الانتهاء من ${filename}`);
  } catch (error) {
    console.error(`❌ خطأ في قراءة ${filename}:`, error.message);
  }
}

async function setupDatabase() {
  console.log('🚀 بدء إعداد قاعدة البيانات...');
  
  try {
    // تطبيق الملفات بالترتيب
    await executeSQLFile('01-create-tables.sql');
    await executeSQLFile('02-create-indexes.sql');
    await executeSQLFile('03-row-level-security.sql');
    await executeSQLFile('04-seed-data.sql');
    await executeSQLFile('05-functions-triggers.sql');
    
    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
    
    // التحقق من البيانات
    console.log('🔍 التحقق من البيانات...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role, store_name');
    
    if (usersError) {
      console.error('❌ خطأ في قراءة المستخدمين:', usersError.message);
    } else {
      console.log('👥 المستخدمين المنشأين:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.store_name || 'بدون متجر'}`);
      });
    }
    
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('code, name, symbol');
    
    if (currenciesError) {
      console.error('❌ خطأ في قراءة العملات:', currenciesError.message);
    } else {
      console.log('💰 العملات المتاحة:');
      currencies.forEach(currency => {
        console.log(`   - ${currency.code}: ${currency.name} (${currency.symbol})`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  }
}

// تشغيل الإعداد
setupDatabase();

