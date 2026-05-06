import fs from 'fs';

let code = fs.readFileSync('src/services/aiService.ts', 'utf-8');

// Insert safeApiFetch helper
if (!code.includes('safeApiFetch')) {
  const helper = `\nconst safeApiFetch = async (url: string, bodyObj: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(bodyObj),
  });
  
  if (!response.ok) throw new Error(\`Server error: \${response.status}\`);
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("INVALID_JSON_RESPONSE");
  }
  
  return await response.json();
};\n\n`;

  code = code.replace('export const aiService = {', helper + 'export const aiService = {');
}

// Replace the verbose fetch calls
code = code.replace(/const response = await fetch\("([^"]+)", \{\s*method: "POST",\s*headers: await getHeaders\(\),\s*body: JSON.stringify\(([^)]+)\),\s*\}\);\s*if \(!response.ok\) throw new Error\(`Server error: \${response\.status}`\);\s*return await response.json\(\);/g, 
  `return await safeApiFetch("$1", $2);`);

// Modify catch blocks to hide "INVALID_JSON_RESPONSE" logs which are unhelpful loading proxies
code = code.replace(/\} catch \((e|error)\) \{\s+console\.error\("([^"]+)", \1\);/g, 
  `} catch ($1: any) {
      if ($1?.message !== "INVALID_JSON_RESPONSE") {
        console.error("$2", $1);
      }`);

fs.writeFileSync('src/services/aiService.ts', code);
console.log("Patched src/services/aiService.ts");
