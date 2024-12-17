document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Load saved API key
  chrome.storage.sync.get(['apiKey'], (result) => {
    apiKeyInput.value = result.apiKey || '';
  });

  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.sync.set({ apiKey: apiKey }, () => {
      statusDiv.textContent = 'API Key saved.';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });
});
