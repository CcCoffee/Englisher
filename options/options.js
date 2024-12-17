document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const systemPromptTextarea = document.getElementById('systemPrompt');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const promptSelect = document.getElementById('promptSelect');

  const grammarPrompts = {
    'default': 'You are a helpful assistant that analyzes English grammar for middle school students. Always reply in Chinese.',
    'simple': 'You are a simple English grammar checker. Please provide feedback on the grammar of the given text. Always reply in Chinese.',
    'detailed': 'You are a detailed English grammar expert. Please analyze the given text and provide detailed feedback on any grammatical errors, including explanations of the rules that were violated. Always reply in Chinese.',
    'advanced': 'You are an advanced English grammar tutor. Please analyze the given text and provide detailed feedback on any grammatical errors, including explanations of the rules that were violated, and suggestions for improvement. Always reply in Chinese.',
    'creative': 'You are a creative English grammar assistant. Please analyze the given text and provide feedback on the grammar in a creative and engaging way. Always reply in Chinese.'
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
