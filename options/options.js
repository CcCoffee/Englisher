document.addEventListener('DOMContentLoaded', function () {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const promptSelect = document.getElementById('promptSelect');
  const promptInput = document.createElement('input');
  const systemPromptTextarea = document.getElementById('systemPrompt');
  const saveButton = document.getElementById('save');
  const resetButton = document.getElementById('reset');
  const notificationDiv = document.getElementById('notification');
  const replaceButton = document.getElementById('replaceBtn');
  const newButton = document.getElementById('newBtn');
  const deleteButton = document.getElementById('deleteBtn');

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

    // 设置默认选中项和系统提示词
    promptSelect.value = '语法分析器';
    systemPromptTextarea.value = prompts['语法分析器'];
  }

  // Function to show notification
  function showNotification(message) {
    notificationDiv.textContent = message;
    notificationDiv.style.display = 'block';
    setTimeout(() => {
      notificationDiv.style.display = 'none';
    }, 3000); // Hide after 3 seconds
  }

  // 公共函数：将输入框恢复为选择框
  function restoreSelectFromInput() {
    if (document.getElementById('promptInput')) {
      promptInput.parentNode.replaceChild(promptSelect, promptInput);
    }
  }

  // 初始化模型和提示词
  initializeModelSelect();
  initializePrompts();

  // 添加预设系统提示词选择事件监听器
  promptSelect.addEventListener('change', function() {
    chrome.storage.sync.get(['prompts'], function(result) {
      const prompts = result.prompts || {};
      const selectedPrompt = promptSelect.value;
      systemPromptTextarea.value = prompts[selectedPrompt] || '';
    });
  });

  // Load saved settings
  chrome.storage.sync.get(['apiKey', 'model', 'promptSelect', 'systemPrompt'], function (data) {
    apiKeyInput.value = data.apiKey || '';
    const savedPromptSelectValue = data.promptSelect || '语法分析器';

    // Initialize promptInput
    promptInput.type = 'text';
    promptInput.className = promptSelect.className;
    promptInput.id = 'promptInput';
    promptInput.value = promptSelect.options[promptSelect.selectedIndex].textContent;
    promptInput.style.width = '85%';
    promptInput.style.marginRight = '10px';
  });

  // Save settings
  saveButton.addEventListener('click', function () {
    const apiKey = apiKeyInput.value;
    const model = modelSelect.value;
    const promptSelectValue = promptInput.value || promptSelect.value;
    const systemPrompt = systemPromptTextarea.value;

    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || {};

      // 更新 prompts
      prompts[promptSelectValue] = systemPrompt;

      chrome.storage.sync.set({ 
        apiKey: apiKey, 
        model: model, 
        promptSelect: promptSelectValue, 
        systemPrompt: systemPrompt, 
        prompts: prompts
      }, function () {
        showNotification('选项已保存');
        loadPrompts(prompts);
      });
    });
  });

  // Reset settings
  resetButton.addEventListener('click', function () {
    chrome.storage.sync.get(['apiKey', 'model'], (result) => {
      // 重新加载初始提示词
      fetch('../settings.json')
        .then(response => response.json())
        .then(data => {
          chrome.storage.sync.set({
            apiKey: result.apiKey || '',
            model: result.model || 'meta-llama/Llama-3.3-70B-Instruct',
            prompts: data.prompts,
            promptSelect: '语法分析器',
            systemPrompt: data.prompts['语法分析器']
          }, function() {
            apiKeyInput.value = result.apiKey || '';
            modelSelect.value = result.model || 'meta-llama/Llama-3.3-70B-Instruct';
            loadPrompts(data.prompts);
            systemPromptTextarea.value = data.prompts['语法分析器'];
            showNotification('选项已重置');
          });
        })
        .catch(error => {
          console.error('重置提示词失败:', error);
          showNotification('重置提示词失败');
        });
    });
  });

  // Add event listener to systemPromptTextarea to handle prompt selection
  systemPromptTextarea.addEventListener('input', () => {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || {};
      if (systemPromptTextarea.value !== prompts[promptSelect.value]) {
        replaceButton.disabled = false;
        promptInput.value = promptSelect.options[promptSelect.selectedIndex].textContent;
        promptInput.style.width = '85%';
        promptInput.style.marginRight = '10px';
        promptSelect.parentNode.replaceChild(promptInput, promptSelect);
        newButton.disabled = true;
        deleteButton.disabled = true;
      } else {
        replaceButton.disabled = true;
      }
    });
  });

  // Add event listener to promptInput to handle new prompt name
  promptInput.addEventListener('input', () => {
    if (promptInput.value !== promptSelect.options[promptSelect.selectedIndex].textContent) {
      newButton.disabled = false;
    } else {
      newButton.disabled = true;
    }
  });

  // Add event listener to promptSelect dropdown to update systemPrompt textarea
  promptSelect.addEventListener('change', () => {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || {};
      systemPromptTextarea.value = prompts[promptSelect.value] || prompts['语法分析器'];
      promptInput.value = promptSelect.options[promptSelect.selectedIndex].textContent;
      replaceButton.disabled = true;
      newButton.disabled = true;
      deleteButton.disabled = false;
    });
  });

  // Add event listener to replaceButton
  replaceButton.addEventListener('click', () => {
    const newPromptName = promptInput.value;
    const newPromptContent = systemPromptTextarea.value;

    chrome.storage.sync.get(['prompts'], (result) => {
      let prompts = result.prompts || {};

      // 更新 prompts
      prompts[newPromptName] = newPromptContent;

      chrome.storage.sync.set({ 
        prompts: prompts
      }, function () {
        showNotification('预设系统提示词已替换');
        loadPrompts(prompts);
        promptSelect.value = newPromptName;
        systemPromptTextarea.value = newPromptContent;

        // 恢复选择框
        restoreSelectFromInput();

        // 重置按钮状态
        replaceButton.disabled = true;
        newButton.disabled = true;
        deleteButton.disabled = false;
      });
    });
  });

  // Add event listener to newButton
  newButton.addEventListener('click', () => {
    const newPromptName = promptInput.value;
    const newPromptContent = systemPromptTextarea.value;

    chrome.storage.sync.get(['prompts'], (result) => {
      let prompts = result.prompts || {};

      // 更新 prompts
      prompts[newPromptName] = newPromptContent;

      chrome.storage.sync.set({ 
        prompts: prompts
      }, function () {
        showNotification('预设系统提示词已新建');
        loadPrompts(prompts);
        promptSelect.value = newPromptName;
        systemPromptTextarea.value = newPromptContent;

        // 恢复选择框
        restoreSelectFromInput();

        // 重置按钮状态
        replaceButton.disabled = true;
        newButton.disabled = true;
        deleteButton.disabled = false;
      });
    });
  });

  // Add event listener to deleteButton
  deleteButton.addEventListener('click', () => {
    const currentPromptName = promptSelect.value;

    // 不允许删除默认提示词
    if (currentPromptName === '语法分析器' || currentPromptName === '简洁' || 
        currentPromptName === '错误聚焦' || currentPromptName === '比较') {
      showNotification('不能删除预设提示词');
      return;
    }

    chrome.storage.sync.get(['prompts'], (result) => {
      let prompts = result.prompts || {};

      // 删除当前提示词
      delete prompts[currentPromptName];

      chrome.storage.sync.set({ 
        prompts: prompts
      }, function () {
        showNotification('预设系统提示词已删除');
        loadPrompts(prompts);
        
        // 设置为默认提示词
        promptSelect.value = '语法分析器';
        systemPromptTextarea.value = prompts['语法分析器'];

        // 重置按钮状态
        deleteButton.disabled = false;
        replaceButton.disabled = true;
        newButton.disabled = true;
      });
    });
  });
});
