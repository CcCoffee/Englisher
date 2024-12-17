document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Load saved API key and model
  chrome.storage.sync.get(['apiKey', 'model'], (result) => {
    apiKeyInput.value = result.apiKey || '';
    modelSelect.value = result.model || 'Qwen/Qwen2.5-7B-Instruct';
  });

  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const model = modelSelect.value;
    chrome.storage.sync.set({ apiKey: apiKey, model: model }, () => {
      statusDiv.textContent = 'API Key and model saved.';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });
});
