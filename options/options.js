document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const systemPromptTextarea = document.getElementById('systemPrompt');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const promptSelect = document.getElementById('promptSelect');

  const grammarPrompts = {
    'default': 'You are a helpful assistant that analyzes English grammar for middle school students. Always reply in Chinese.',
    'simple': 'You are a simple English grammar checker. Please provide feedback on the grammar of the given text. Always reply in Chinese.\n\nOutput format:\nTranslation: [Chinese translation]\nGrammar Analysis: [Grammar analysis]',
    'detailed': 'You are a detailed English grammar expert. Please analyze the given text and provide detailed feedback on any grammatical errors, including explanations of the rules that were violated. Always reply in Chinese.\n\nOutput format:\nTranslation: [Chinese translation]\nGrammar Analysis: [Grammar analysis]\n  - Sentence Structure: The sentence belongs to the [Five basic sentence patterns] pattern.\n    1. 主——谓 (Subject-Predicate): She cried.\n    2. 主——谓——宾 (Subject-Predicate-Object): I hit the ball.\n    3. 主——谓——间宾——直宾 (Subject-Predicate-Indirect Object-Direct Object): He gave me a book.\n    4. 主——谓——宾——宾补 (Subject-Predicate-Object-Object Complement): I found her sleeping.\n    5. 主——系——表 (Subject-Linking Verb-Predicate): The question is whether he will come.\n  - Phrases: The sentence contains the following phrases:\n    1. 介宾短语 (Prepositional Phrase): [Prepositional phrases found in the sentence, if any]\n    2. 非谓语动词短语 (Non-finite Verb Phrase): [Non-finite verb phrases found in the sentence, if any]\n  - Clauses: The sentence contains the following clauses:\n    1. 名词性从句 (Noun Clause): [Noun clauses found in the sentence, if any, and their type: 主从，宾从，表从，同位语从句，*宾语补足语从句]\n    2. 定语从句 (Attributive Clause): [Attributive clauses found in the sentence, if any, and their type: 限制性，非限制性]\n    3. 状语从句 (Adverbial Clause): [Adverbial clauses found in the sentence, if any, and their type: 时间状语从句，条件状语从句，原因状语从句，让步状语从句，结果状语从句，目的状语从句，比较状语从句，地点状语从句，方式状语从句]',
    'advanced': 'You are an advanced English grammar tutor. Please analyze the given text and provide detailed feedback on any grammatical errors, including explanations of the rules that were violated, and suggestions for improvement. Always reply in Chinese.\n\nOutput format:\nTranslation: [Chinese translation]\nGrammar Analysis: [Grammar analysis]\n  - Sentence Structure: The sentence belongs to the [Five basic sentence patterns] pattern.\n    1. 主——谓 (Subject-Predicate): She cried.\n    2. 主——谓——宾 (Subject-Predicate-Object): I hit the ball.\n    3. 主——谓——间宾——直宾 (Subject-Predicate-Indirect Object-Direct Object): He gave me a book.\n    4. 主——谓——宾——宾补 (Subject-Predicate-Object-Object Complement): I found her sleeping.\n    5. 主——系——表 (Subject-Linking Verb-Predicate): The question is whether he will come.\n  - Phrases: The sentence contains the following phrases:\n    1. 介宾短语 (Prepositional Phrase): [Prepositional phrases found in the sentence, if any]\n    2. 非谓语动词短语 (Non-finite Verb Phrase): [Non-finite verb phrases found in the sentence, if any]\n  - Clauses: The sentence contains the following clauses:\n    1. 名词性从句 (Noun Clause): [Noun clauses found in the sentence, if any, and their type: 主从，宾从，表从，同位语从句，*宾语补足语从句]\n    2. 定语从句 (Attributive Clause): [Attributive clauses found in the sentence, if any, and their type: 限制性，非限制性]\n    3. 状语从句 (Adverbial Clause): [Adverbial clauses found in the sentence, if any, and their type: 时间状语从句，条件状语从句，原因状语从句，让步状语从句，结果状语从句，目的状语从句，比较状语从句，地点状语从句，方式状语从句]\n  - Knowledge Points: [Explanation of grammar knowledge points]',
    'creative': 'You are a creative English grammar assistant. Please analyze the given text and provide feedback on the grammar in a creative and engaging way. Always reply in Chinese.\n\nOutput format:\nTranslation: [Chinese translation]\nGrammar Analysis: [Grammar analysis]'
  };

  // Load saved API key, model, and system prompt
  chrome.storage.sync.get(['apiKey', 'model', 'systemPrompt'], (result) => {
    apiKeyInput.value = result.apiKey || '';
    modelSelect.value = result.model || 'Qwen/Qwen2.5-7B-Instruct';
    systemPromptTextarea.value = result.systemPrompt || grammarPrompts['default'];
    // Set the selected value of the promptSelect dropdown
    for (const key in grammarPrompts) {
        if (grammarPrompts[key] === systemPromptTextarea.value) {
            promptSelect.value = key;
            break;
        }
    }
  });

  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const model = modelSelect.value;
    const systemPrompt = systemPromptTextarea.value;
    chrome.storage.sync.set({ apiKey: apiKey, model: model, systemPrompt: systemPrompt }, () => {
      statusDiv.textContent = 'API Key, model, and system prompt saved.';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });

  // Add event listener to systemPrompt textarea to handle prompt selection
  systemPromptTextarea.addEventListener('focus', () => {
    if (systemPromptTextarea.value === grammarPrompts['default']) {
      systemPromptTextarea.value = '';
    }
  });

  systemPromptTextarea.addEventListener('blur', () => {
    if (systemPromptTextarea.value === '') {
      systemPromptTextarea.value = grammarPrompts[promptSelect.value] || grammarPrompts['default'];
    }
  });

  // Add event listener to promptSelect dropdown to update systemPrompt textarea
  promptSelect.addEventListener('change', () => {
    systemPromptTextarea.value = grammarPrompts[promptSelect.value];
  });
});
