/**
 * AI Article Writer - Core Logic
 */

const keywordInput = document.getElementById('keywordInput');
const generateBtn = document.getElementById('generateBtn');
const loadingState = document.getElementById('loadingState');
const articleOutput = document.getElementById('articleOutput');

const OPENROUTER_API_KEY = "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";

async function generateArticle(keyword) {
  if (!keyword) return;

  // UI States
  generateBtn.disabled = true;
  loadingState.classList.remove('hidden');
  articleOutput.innerHTML = '';
  articleOutput.classList.remove('fade-in');

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          {
            role: "user",
            content: `Write a long, professional article about the keyword: "${keyword}". 
            Return the article formatted in clean HTML. 
            Include:
            - Exactly one <h1> for the main title
            - Several <h2> or <h3> for subheadings to break up the content
            - <p> tags for all paragraphs
            Do NOT include <html>, <body>, <head> or code block backticks. Just return the raw HTML tags.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Status ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No content generated. Please check your OpenRouter balance or account status.");
    }

    let content = data.choices[0].message.content;
    
    // Safety check to remove any markdown code block indicators if the AI adds them
    content = content.replace(/```html/g, '').replace(/```/g, '').trim();
    
    displayArticle(content);
  } catch (error) {
    console.error("Detailed Error:", error);
    articleOutput.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p class="font-bold mb-1 tracking-tight">API Error Detected</p>
        <p class="text-sm font-mono bg-white/50 p-2 rounded mt-2 border border-red-100">${error.message}</p>
        <p class="text-[10px] uppercase tracking-wider mt-4 opacity-70">Likely cause: API key invalidation or OpenRouter service restriction. Ensure your key has credits.</p>
      </div>
    `;
  } finally {
    generateBtn.disabled = false;
    loadingState.classList.add('hidden');
  }
}

function displayArticle(htmlContent) {
  articleOutput.innerHTML = htmlContent;
  
  // Add fade-in classes to all children for a smooth reveal
  Array.from(articleOutput.children).forEach((child, index) => {
    child.classList.add('fade-in');
    child.style.animationDelay = `${index * 0.15}s`;
  });
}

generateBtn.addEventListener('click', () => {
  generateArticle(keywordInput.value);
});

keywordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    generateArticle(keywordInput.value);
  }
});
