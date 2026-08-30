import re

with open('chatbot-frontend/app/(main)/report-issue/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

resolved = (
    '          {/* BACK TO CHAT */}\n'
    '          <div className="mb-8 flex justify-start">\n'
    '            <Link\n'
    '              href="/chat"\n'
    '              aria-label="Back to Chat"\n'
    '              title="Back to Chat"\n'
    '              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#A10D5A] bg-[#A10D5A] text-white shadow-md transition-all duration-200 hover:bg-white hover:text-[#A10D5A] hover:shadow-lg active:scale-95 dark:bg-[#A10D5A] dark:text-white dark:hover:bg-gray-900 dark:hover:text-[#A10D5A]"\n'
    '            >\n'
    '              <ArrowLeft size={18} strokeWidth={2.3} />\n'
    '            </Link>\n'
    '          </div>\n'
)

pattern = r'<<<<<<< Updated upstream\n.*?>>>>>>> Stashed changes\n'
new_content = re.sub(pattern, resolved, content, flags=re.DOTALL)
if new_content == content:
    print('NO CHANGE')
else:
    with open('chatbot-frontend/app/(main)/report-issue/page.tsx', 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)
    print('SUCCESS')
    remaining = re.findall(r'(<<<<<<<|=======|>>>>>>>)', new_content)
    print(f'Remaining markers: {remaining}')
