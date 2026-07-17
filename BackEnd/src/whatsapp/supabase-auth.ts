import { SupabaseClient } from '@supabase/supabase-js';
// We only import TYPES at the top level. This doesn't break the code.
// We only import TYPES at the top level. This doesn't break the code.
import type {
    SignalDataTypeMap
} from '@whiskeysockets/baileys' with { 'resolution-mode': 'import' };

export const useSupabaseAuthState = async (supabase: SupabaseClient, bucketName: string, sessionId: string) => {
  
  // FIX: Dynamic Import for ESM Library
  const { initAuthCreds, BufferJSON, proto } = await import('@whiskeysockets/baileys');

  const getPath = (category: string, filename: string) => `${sessionId}/${category}/${filename}`;

  const writeData = async (data: any, category: string, filename: string) => {
    const serialized = JSON.stringify(data, BufferJSON.replacer);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(getPath(category, filename), serialized, {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) console.error(`Failed to save ${filename}:`, error.message);
  };

  const readData = async (category: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(getPath(category, filename));

      if (error || !data) return null;

      const text = await data.text();
      return JSON.parse(text, BufferJSON.reviver);
    } catch (error) {
      return null;
    }
  };

  const removeData = async (category: string, filename: string) => {
    await supabase.storage
      .from(bucketName)
      .remove([getPath(category, filename)]);
  };

  const creds = (await readData('creds', 'creds.json')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: keyof SignalDataTypeMap, ids: string[]) => {
          const data: any = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(type, `${id}.json`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              if (value) {
                data[id] = value;
              }
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const filename = `${id}.json`;
              if (value) {
                tasks.push(writeData(value, category, filename));
              } else {
                tasks.push(removeData(category, filename));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => {
      return writeData(creds, 'creds', 'creds.json');
    },
  };
};