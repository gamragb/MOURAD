import sys

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove StaffManagementView import
content = content.replace('import { StaffManagementView } from "./views/StaffManagementView";\n', '')

# 2. Remove staff tab rendering
staff_block = '''            {activeTab === "staff" && currentUser && (
              <StaffManagementView
                key="staff"
                currentUser={currentUser}
                onRefresh={() => setAppData(storage.getData())}
                isRtl={isRtl}
                t={t}
              />
            )}\n'''
content = content.replace(staff_block, '')

# 3. Combine archive and logs tab rendering
archive_logs_block_old = '''            {activeTab === "archive" && (
              <ArchiveView
                key="archive"
                appData={appData}
                setAppData={setAppData}
                t={t}
                isRtl={isRtl}
                currentUser={currentUser}
              />
            )}
            {activeTab === "logs" && currentUser && (
              <ActivityLogView
                key="logs"
                isRtl={isRtl}
              />
            )}'''

archive_logs_block_new = '''            {activeTab === "archive" && (
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
            )}'''

if archive_logs_block_old in content:
    content = content.replace(archive_logs_block_old, archive_logs_block_new)
    print('Replaced archive and logs blocks.')
else:
    print('archive and logs block not found.')

# 4. Avatar size update
avatar_old = '<img referrerPolicy="no-referrer" src={firebaseUser.photoURL} alt="User" className="h-14 w-14 rounded-full border-2 border-violet-500" />'
avatar_new = '<img referrerPolicy="no-referrer" src={firebaseUser.photoURL} alt="User" className="h-10 w-10 rounded-full border-2 border-violet-500" />'

if avatar_old in content:
    content = content.replace(avatar_old, avatar_new)
    print('Replaced avatar image size.')
else:
    print('Avatar size block not found.')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
