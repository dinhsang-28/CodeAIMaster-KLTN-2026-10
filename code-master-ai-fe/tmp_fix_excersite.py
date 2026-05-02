from pathlib import Path
import sys
path = Path('src/pages/lesson/excersite.tsx')
text = path.read_text(encoding='utf-8')
lines = text.splitlines(keepends=True)
start = next((i for i, line in enumerate(lines) if line.lstrip().startswith('import ') and not line.lstrip().startswith('// import')), None)
if start is None:
    print('No active import line found')
    sys.exit(1)
path.write_text(''.join(lines[start:]), encoding='utf-8')
print(f'Kept {len(lines)-start} lines starting at line {start+1}')
