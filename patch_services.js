import fs from 'fs';

function applyPatch(file) {
  let code = fs.readFileSync(file, 'utf-8');

  // Modify catch blocks
  code = code.replace(/\} catch \((e|error)\) \{\s+console\.error\("([^"]+)", \1\);/g, 
    `} catch ($1: any) {
      if ($1?.message !== "INVALID_JSON_RESPONSE") {
        console.error("$2", $1);
      }`);

  // Inject content-type check before response.json()
  code = code.replace(/if \(!response\.ok\) \{?\s*throw new Error\(`Server error:\s*[^`]+`\);\s*\}?\s*return await response\.json\(\);/g, 
    `if (!response.ok) {
        throw new Error(\`Server error: \${response.status}\`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("INVALID_JSON_RESPONSE");
      }
      
      return await response.json();`);

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
}

applyPatch('src/services/aiDatePlannerService.ts');
applyPatch('src/services/aiSafetyService.ts');
applyPatch('src/services/trustService.ts');
