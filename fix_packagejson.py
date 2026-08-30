import re

with open('chatbot-frontend/package.json', 'r', encoding='utf-8') as f:
    content = f.read()

# The conflict is between tsparticles (upstream) and resend (stash)
# We want BOTH dependencies
resolved = (
    '    "tsparticles": "^4.3.2",\n'
    '    "resend": "^6.19.0"\n'
)

pattern = r'<<<<<<< Updated upstream\n.*?>>>>>>> Stashed changes\n'
new_content = re.sub(pattern, resolved, content, flags=re.DOTALL)
if new_content == content:
    print('NO CHANGE')
else:
    with open('chatbot-frontend/package.json', 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)
    print('SUCCESS')
    remaining = re.findall(r'(<<<<<<<|=======|>>>>>>>)', new_content)
    print(f'Remaining markers: {remaining}')
    print('\n--- Resolved package.json ---')
    print(new_content)
