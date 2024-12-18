document.addEventListener('DOMContentLoaded', function () {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const promptSelect = document.getElementById('promptSelect');
  const notificationDiv = document.getElementById('notification');

  // 初始化模型选择器
  function initializeModelSelect() {
    fetch('../settings.json')
      .then(response => response.json())
      .then(data => {
        // 清除现有选项
        while (modelSelect.options.length > 0) {
          modelSelect.remove(0);
        }

        // 添加模型选项
        data.models.forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelSelect.appendChild(option);
        });

        // 设置默认选中项
        chrome.storage.sync.get(['model'], function(result) {
          modelSelect.value = result.model || 'meta-llama/Llama-3.3-70B-Instruct';
        });
      })
      .catch(error => {
        console.error('加载模型列表失败:', error);
        showNotification('加载模型列表失败');
      });
  }

  // 初始化预设提示词
  function initializePrompts() {
    fetch('../settings.json')
      .then(response => response.json())
      .then(data => {
        chrome.storage.sync.get(['prompts'], function(result) {
          if (!result.prompts) {
            // 首次使用，加载默认提示词
            chrome.storage.sync.set({ prompts: data.prompts }, function() {
              loadPrompts(data.prompts);
            });
          } else {
            loadPrompts(result.prompts);
          }
        });
      })
      .catch(error => {
        console.error('加载预设提示词失败:', error);
        showNotification('加载预设提示词失败');
      });
  }

  // 加载提示词到下拉框
  function loadPrompts(prompts) {
    // 清除现有选项
    while (promptSelect.options.length > 0) {
      promptSelect.remove(0);
    }

    // 按字符自然排序
    const sortedKeys = Object.keys(prompts).sort();

    // 添加排序后的选项
    sortedKeys.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      promptSelect.appendChild(option);
    });

    // 设置默认选中项
    promptSelect.value = '语法分析器';
  }

  // Function to show notification
  function showNotification(message) {
    notificationDiv.textContent = message;
    notificationDiv.classList.add('show');
    setTimeout(() => {
      notificationDiv.classList.remove('show');
    }, 3000); // Hide after 3 seconds
  }

  // 初始化模型和提示词
  initializeModelSelect();
  initializePrompts();

  // 添加预设系统提示词选择事件监听器
  promptSelect.addEventListener('change', function() {
    chrome.storage.sync.get(['prompts'], function(result) {
      const prompts = result.prompts || {};
      const selectedPrompt = promptSelect.value;
      // 可以在这里添加额外的处理逻辑
    });
  });

  // Load saved settings
  chrome.storage.sync.get(['apiKey', 'model', 'promptSelect'], function (data) {
    apiKeyInput.value = data.apiKey || '';
    modelSelect.value = data.model || 'meta-llama/Llama-3.3-70B-Instruct';
    promptSelect.value = data.promptSelect || '语法分析器';
  });

  // 保存设置
  apiKeyInput.addEventListener('change', function () {
    const apiKey = apiKeyInput.value;
    const model = modelSelect.value;
    const promptSelectValue = promptSelect.value;

    chrome.storage.sync.set({ 
      apiKey: apiKey, 
      model: model, 
      promptSelect: promptSelectValue
    }, function () {
      showNotification('设置已保存');
    });
  });

  modelSelect.addEventListener('change', function () {
    const apiKey = apiKeyInput.value;
    const model = modelSelect.value;
    const promptSelectValue = promptSelect.value;

    chrome.storage.sync.set({ 
      apiKey: apiKey, 
      model: model, 
      promptSelect: promptSelectValue
    }, function () {
      showNotification('设置已保存');
    });
  });
});
