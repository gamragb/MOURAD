const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove StaffManagementView import
content = content.replace('import { StaffManagementView } from "./views/StaffManagementView";\n', '');

// 2. Remove staff tab rendering
const staff_block = `            {activeTab === "staff" && currentUser && (
              <StaffManagementView
                key="staff"
                currentUser={currentUser}
                onRefresh={() => setAppData(storage.getData())}
                isRtl={isRtl}
                t={t}
              />
            )}\n`;
content = content.replace(staff_block, '');

// 3. Combine archive and logs tab rendering
const archive_logs_block_old = `            {activeTab === "archive" && (
              <ArchiveView
                key="archive"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                currentUser={currentUser}
              />
            )
            {activeTab === "logs" && currentUser && (
              <ActivityLogView
                key="logs"
                isRtl={isRtl}
              />
            )}`;

// wait, there is a missing } in the above old string block compared to App.tsx?
// Let's use regex instead
content = content.replace(
  /\{\s*activeTab === "archive" && \(\s*<ArchiveView[\s\S]*?\/>\s*\)\s*\}/,
  `{activeTab === "archive" && (
              <div className="flex flex-col gap-10">
                <ArchiveView
                  key="archive"
                  appData={appData}
                  setAppData={setAppData}
                  t={t}
                  isRtl={isRtl}
                  currentUser={currentUser}
                />
                <div className="pt-6 border-t border-slate-200">
                  <h2 className="text-2xl font-black mb-6 px-4 italic text-slate-800">{isRtl ? "سجل النشاطات" : "Activity Logs"}</h2>
                  <ActivityLogView
                    key="logs"
                    isRtl={isRtl}
                  />
                </div>
              </div>
            )}`
);

content = content.replace(
  /\{\s*activeTab === "logs" && currentUser && \(\s*<ActivityLogView[\s\S]*?\/>\s*\)\s*\}/,
  ''
);

// 4. Avatar size update
const avatar_old = '<img referrerPolicy="no-referrer" src={firebaseUser.photoURL} alt="User" className="h-14 w-14 rounded-full border-2 border-violet-500" />';
const avatar_new = '<img referrerPolicy="no-referrer" src={firebaseUser.photoURL} alt="User" className="h-10 w-10 rounded-full border-2 border-violet-500" />';

content = content.replace(avatar_old, avatar_new);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Modifications applied successfully');
