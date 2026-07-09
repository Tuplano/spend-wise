// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_old_morlocks.sql';
import m0001 from './0001_accounts_tables.sql';
import m0002 from './0002_drop_account_label.sql';
import m0003 from './0003_chunky_dakota_north.sql';
import m0004 from './0004_chubby_wildside.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004
    }
  }
  