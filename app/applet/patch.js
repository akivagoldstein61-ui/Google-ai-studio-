const fs = require('fs');

let code = fs.readFileSync('server/aiRoutes.ts', 'utf-8');

code = code.replace(/\} catch \(error\) \{\s+console\.error\("([^"]+)", error\);\s+res\.json\(([^)]+)\);(?:\s+\/\/.*?)?\s+\}/g, 
`} catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("$1", error);
    }
    res.json($2);
  }`);

code = code.replace(/const getAI = \(\) => \{[\s\S]*?return new GoogleGenAI\(\{ apiKey \}\);\n\};/, `const getAI = () => {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("MISSING_API_KEY");
  }
  
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  
  return new GoogleGenAI({ apiKey });
};`);

fs.writeFileSync('server/aiRoutes.ts', code);
console.log("Patched server/aiRoutes.ts");
