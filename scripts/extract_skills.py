import re
import os

with open('kesher-skills-full.md', 'r') as f:
    content = f.read()

# Try to find all the sections that start with Source: `something`
pattern = re.compile(r'Source: `(.+?)`\n\n---\n([\s\S]+?)(?=\n---\n\n# |$)', re.MULTILINE)

matches = pattern.findall(content)

for file_path, file_content in matches:
    print(f"Creating {file_path}")
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as f:
        f.write('---\n' + file_content)
