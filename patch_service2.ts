import fs from 'fs';

let code = fs.readFileSync('src/services/aiService.ts', 'utf-8');

code = code.replace(/const response = await fetch\("\/api\/ai\/rephrase", \{\s+method: "POST",\s+headers: await getHeaders\(\),\s+body: JSON\.stringify\(\{ text \}\),\s+\}\);\s+if \(!response\.ok\) \{\s+throw new Error\(`Server error: \$\{response\.status\}`\);\s+\}\s+return await response\.json\(\);/g, 
  `return await safeApiFetch("/api/ai/rephrase", { text });`);

code = code.replace(/const response = await fetch\("\/api\/ai\/openers", \{\s+method: "POST",\s+headers: await getHeaders\(\),\s+body: JSON\.stringify\(\{ profileName, bio, prompt \}\),\s+\}\);\s+if \(!response\.ok\) \{\s+throw new Error\(`Server error: \$\{response\.status\}`\);\s+\}\s+return await response\.json\(\);/g, 
  `return await safeApiFetch("/api/ai/openers", { profileName, bio, prompt });`);

fs.writeFileSync('src/services/aiService.ts', code);
