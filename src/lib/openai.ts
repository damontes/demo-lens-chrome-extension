import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-tech-services-openai-proofreading-next-zf1JJxdYhr37ytrXFNPOT3BlbkFJfr9zyN6ofuWWQtkkMkjg',
  dangerouslyAllowBrowser: true,
});

export const processItems = async (params: any, onProgress: (progress: number) => void) => {
  let result = {};
  const { dashboardName, tabName, scenarioText, queries } = params;
  const itemsToProcess = Object.entries(queries);
  const total = itemsToProcess.length;

  for (let i = 0; i < total; i++) {
    const [queryId, query] = itemsToProcess[i] as any;
    const { visualizationType, description, payload: rawJson } = query;
    const defaultPayload = {
      columns: rawJson.columns.slice(0, 5),
      rows: rawJson.rows,
      measures: rawJson.measures,
      rowsHeaders: rawJson.rowsHeaders,
      rowsDataFields: rawJson.rowsDataFields,
    };
    const params = {
      visualizationType,
      description,
      payload: defaultPayload,
      dashboardName,
      tabName,
      scenarioText,
    };
    try {
      const queryPayload = await callOpenAI(params);
      onProgress(Math.round(((i + 1) / total) * 100));

      result = { ...result, [queryId]: queryPayload };
    } catch (error) {
      console.log('ERROR', error);
      result = { ...result, [queryId]: { ...defaultPayload, default: true } };
    }
  }

  return result;
};

async function callOpenAI(params: any) {
  const { visualizationType, description, dashboardName, tabName, payload, scenarioText } = params;

  const PROMPT = `
🧠 What to do:

1. Use the full payload below as a **schema reference only**.
2. You MUST generate a new version of:
- \`columns\`: matching the widget type and possibly expanded
- \`cellData\`: values aligned with the new columns
- If widget is \`simpleGrid2\`, also generate:
    - \`rows\` — each with contextual members
    - \`rowsHeaders\` and \`rowsDataFields\`

---

📌 Widget Metadata:

- Dashboard: **${dashboardName}**
- Tab: **${tabName}**
- Widget Type: **${visualizationType}**
- Widget Purpose: **${description}**

---

🧭 Simulation Context (provided by user):

- Scenario: **${scenarioText || 'No scenario provided'}**

🎯 Use this context to guide your value generation:
- You may increase ticket volume, activity, or engagement where appropriate.
- Modify success or engagement rates **only if the scenario logically supports it**.
- Do **not fabricate unrelated behaviors** or drop values without cause.

🚫 IMPORTANT: Simulation context must **never override structure rules**.

- You MUST strictly follow the structural rules defined below for each widget type.
- Do NOT add columns or duplicate values for:
  - \`kpiChart\`
  - \`autoChart\`
  
---


📂 Input Payload (Schema Reference):
Use this to infer structure and required keys.
\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`

---

⚠️ CRITICAL STRUCTURE RULES

- For **non-grid widgets** (e.g. barChart, lineChart, areaChart, pieChart, kpiChart, autoChart):
  - \`columns.length === cellData[0].length\` MUST ALWAYS be true
  - \`cellData\` must be a 2D array with a **single inner array** only

- For **"kpiChart" or "autoChart"**:
  - Do NOT add or duplicate columns, even if multiple measures exist
  - Use only the original \`columns\`
  - \`columns.length === 1\`
  - \`cellData.length === 1\` and \`cellData[0].length === 1\`

- For **time-based widgets** (e.g. visualizationType includes "line", "area", "column", "bar"):
  - Even if \`isTimeSeries = false\`, treat it as time-based
  - Expand \`columns\` to 10–20 entries with distinct time period labels
  - Each \`column.members\` MUST contain:
    - An exact clone of all keys from the first member of the reference
    - Update ONLY \`name\` and \`displayName\` with time-based values (e.g. "Jan 2024", "February 2024")
    - The second member must remain the original measure definition, unchanged
  - \`columns.length === cellData[0].length\`

- For **"simpleGrid2"** only:
  - \`rowsHeaders.length === rowsDataFields.length\` MUST hold true
  - The number of headers/fields MUST NOT exceed 2
  - \`rowsDataFields[]\` must be the **snake_case** version of \`rowsHeaders[]\`
  - You MUST generate:
    - A \`rows\` array with 5–15 entries
    - \`rowsHeaders\` (e.g. "Article title") and \`rowsDataFields\` (e.g. "article_title")
  - Each \`row.members[]\` must:
    - Contain one member per rowHeader
    - Include ALL required keys seen in the row reference
    - Set \`attributeDisplayName\` from rowsHeaders
    - Map \`attributeName\`, \`dataField\`, \`attributeDatafield\`, and \`levelName\` from rowsDataFields
    - Set \`name\` and \`displayName\` to realistic values
  - \`cellData.length === rows.length\`
  - \`cellData[i].length === columns.length\`

---

🧱 Column Handling:

- NEVER drop or alter any keys from a column’s \`members[]\`
- If expanding columns (e.g. by time or category):
  - Clone the entire \`members[]\` array from the reference
  - Modify ONLY \`name\` and \`displayName\` of the first member to reflect the group label (e.g. month or category)
  - DO NOT touch the second member (the measure definition)

---

🔢 Value Guidelines:

- COUNT / SUM → integers
- AVG → float with 1–2 decimals
- % or displayName containing “%” → normalized float 0–1
- All \`cellData[].value\` must be numeric (no strings)

---

📈 \`cellData\` Format:

- Non-grid:
\`\`\`json
[
  [ { "value": 123 }, { "value": 456 } ]
]
\`\`\`

- Grid (simpleGrid2):
\`\`\`json
[
  [ { "value": 12 }, { "value": 34 } ],
  [ { "value": 22 }, { "value": 19 } ]
]
\`\`\`

---

📋 Final Output Format (Return only this structure):

\`\`\`json
{
  "columns": [...],
  "cellData": [ [...], ... ],
  "rows": [...],              // only for simpleGrid2
  "rowsHeaders": [...],       // only for simpleGrid2
  "rowsDataFields": [...]     // only for simpleGrid2
}
\`\`\`

❌ Do NOT include markdown or explanation.  
✅ Return only valid JSON.

Begin now.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: `
                You are a data simulation engine for Zendesk Explore dashboards.

                Your task is to generate **realistic, expanded data** based on the **reference structure** provided in the payload.
            `,
      },
      { role: 'user', content: PROMPT },
    ],
  });

  if (!completion.choices[0].message.content) {
    throw new Error('OpenAI API returned no content');
  }

  const resultJson = JSON.parse(completion.choices[0].message.content);

  return resultJson;
}
