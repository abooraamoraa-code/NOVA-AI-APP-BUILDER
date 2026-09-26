const axios = require("axios");

/*
|--------------------------------------------------------------------------
| NOVA AI - Gemini Service
|--------------------------------------------------------------------------
| مسؤول عن التواصل مع Google Gemini API
|--------------------------------------------------------------------------
*/

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

function validateConfiguration() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Build Gemini URL
|--------------------------------------------------------------------------
*/

function buildModelUrl(model) {
  return (
    `${GEMINI_API_URL}/` +
    `${model}:generateContent` +
    `?key=${GEMINI_API_KEY}`
  );
}

/*
|--------------------------------------------------------------------------
| Generate Text
|--------------------------------------------------------------------------
*/

async function generateText({
  prompt,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxOutputTokens = 8192
}) {
  validateConfiguration();

  if (!prompt || !prompt.trim()) {
    throw new Error(
      "Prompt is required"
    );
  }

  const response =
    await axios.post(
      buildModelUrl(model),
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens
        }
      },
      {
        headers: {
          "Content-Type":
            "application/json"
        },
        timeout: 120000
      }
    );

  const candidates =
    response.data?.candidates || [];

  if (!candidates.length) {
    throw new Error(
      "Gemini returned no candidates"
    );
  }

  const parts =
    candidates[0]?.content?.parts || [];

  const text =
    parts
      .map((part) => part.text || "")
      .join("")
      .trim();

  if (!text) {
    throw new Error(
      "Gemini returned empty text"
    );
  }

  return {
    text,
    model,
    raw: response.data
  };
}

/*
|--------------------------------------------------------------------------
| Generate Structured JSON
|--------------------------------------------------------------------------
*/

async function generateJSON({
  prompt,
  model = DEFAULT_MODEL,
  temperature = 0.4,
  maxOutputTokens = 12000
}) {
  const enhancedPrompt = `
أنت جزء من منصة NOVA AI App Builder.

أعد النتيجة بصيغة JSON صحيحة فقط.

ممنوع:
- Markdown
- ```json
- شرح خارج JSON
- نص قبل JSON
- نص بعد JSON

المطلوب:

${prompt}
`;

  const result =
    await generateText({
      prompt: enhancedPrompt,
      model,
      temperature,
      maxOutputTokens
    });

  let clean =
    result.text.trim();

  if (
    clean.startsWith("```")
  ) {
    clean =
      clean
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
  }

  try {
    return {
      data: JSON.parse(clean),
      model,
      raw: result.raw
    };
  } catch (error) {
    throw new Error(
      "Gemini returned invalid JSON"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Generate Application Plan
|--------------------------------------------------------------------------
*/

async function generateApplicationPlan({
  description,
  requirements = [],
  pages = [],
  features = []
}) {
  const prompt = `
أنشئ مخططًا احترافيًا لتطبيق ويب.

وصف التطبيق:
${description}

المتطلبات:
${JSON.stringify(
  requirements,
  null,
  2
)}

الصفحات المطلوبة:
${JSON.stringify(
  pages,
  null,
  2
)}

الميزات المطلوبة:
${JSON.stringify(
  features,
  null,
  2
)}

أعد JSON بهذا الشكل:

{
  "name": "",
  "description": "",
  "type": "",
  "pages": [],
  "features": [],
  "components": [],
  "database": {
    "tables": []
  },
  "api": {
    "routes": []
  },
  "files": []
}
`;

  return generateJSON({
    prompt,
    temperature: 0.3,
    maxOutputTokens: 16000
  });
}

/*
|--------------------------------------------------------------------------
| Generate Application Code
|--------------------------------------------------------------------------
*/

async function generateApplicationCode({
  applicationPlan,
  filePath,
  filePurpose
}) {
  const prompt = `
أنت الآن تعمل كمبرمج داخل NOVA AI App Builder.

خطة التطبيق:

${JSON.stringify(
  applicationPlan,
  null,
  2
)}

الملف المطلوب:
${filePath}

وظيفة الملف:
${filePurpose}

أنشئ الكود الكامل لهذا الملف.

الشروط:
1. الكود يجب أن يكون صالحًا.
2. لا تستخدم كودًا وهميًا.
3. لا تضع TODO.
4. لا تضع شرحًا داخل النتيجة خارج الكود.
5. أعد الكود فقط.
6. حافظ على توافق الملف مع بقية المشروع.
7. لا تستخدم أسرارًا أو مفاتيح API داخل الكود.
8. استخدم متغيرات البيئة عند الحاجة.
`;

  const result =
    await generateText({
      prompt,
      temperature: 0.2,
      maxOutputTokens: 30000
    });

  return {
    filePath,
    code: result.text
  };
}

/*
|--------------------------------------------------------------------------
| Analyze User Request
|--------------------------------------------------------------------------
*/

async function analyzeRequest({
  message
}) {
  const prompt = `
حلل طلب المستخدم التالي لمنصة NOVA AI App Builder:

${message}

أعد JSON فقط:

{
  "intent": "",
  "applicationType": "",
  "summary": "",
  "requirements": [],
  "pages": [],
  "features": [],
  "needsDatabase": false,
  "needsAuthentication": false,
  "needsPayments": false,
  "needsAI": false,
  "recommendedStack": []
}
`;

  return generateJSON({
    prompt,
    temperature: 0.2,
    maxOutputTokens: 8000
  });
}

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

async function healthCheck() {
  try {
    validateConfiguration();

    const result =
      await generateText({
        prompt:
          "Respond with exactly: NOVA_OK",
        temperature: 0,
        maxOutputTokens: 20
      });

    return {
      success:
        result.text === "NOVA_OK",
      model:
        result.model
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  generateText,
  generateJSON,
  generateApplicationPlan,
  generateApplicationCode,
  analyzeRequest,
  healthCheck
};
