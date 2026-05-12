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
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Article Writer",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
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

    if (!response.ok) throw new Error('API request failed');

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Safety check to remove any markdown code block indicators if the AI adds them
    content = content.replace(/```html/g, '').replace(/```/g, '').trim();
    
    displayArticle(content);
  } catch (error) {
    console.error(error);
    articleOutput.innerHTML = `<p class="text-red-500 font-medium">Sorry, I couldn't generate the article. Please check your API key or connection.</p>`;
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
