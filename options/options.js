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

  const grammarPrompts = {
    '语法分析器': 
`
你是一个有用的助手，可以分析英语句子的语法。总是用中文回复。
# 步骤

1. **语法分析**：分析句子的结构，包括词性和短语结构。
2. **规则解释**：解释相关的语法规则，并指出其中可能的错误或改善方式。
3. **建议改进**：提供句子的改进建议，确保结构和用词标准且优雅。

# 输出格式

按照以下格式输出分析结果，不要有任何空行：
- **分析结构**：
  1. 句子类型：[陈述句、疑问句、祈使句等]
  2. 核心句式：主-谓-宾-宾补
  3. 主要成分：[主语、谓语、宾语、补语等分析]
- **语法规则**：[详细的语法规则解释及例子]
- **改进建议**：[针对此句的提升建议]

# 示例
例如，输入句子为："She can sing beautifully."
- **翻译**：她的歌声非常好听。
- **分析结构**：
  - 句子类型：陈述句
  - 核心句式：主-谓
  - 主要成分：
    1. 主语：She
    2. 谓语：can sing
    3. 状语：beautifully
- **语法规则**：
  1. "She"是主语，代词形式，用于指代人或物。
  2. "can"是情态动词，接动词原形，表示能力。
  3. "sing"是动词，作为谓语表示动作。
  4. "beautifully"是副词，修饰动词，表示方式。
- **改进建议**：句子结构正确，无需改动。
# 注意事项
- 所有英语句子的核心句式都能够匹配到以下五种中的一个，必须从中挑选一个。
  1. 主——谓 ：例如 She cried.
  2. 主——谓——宾 ：例如 I hit the ball.
  3. 主——谓——间宾——直宾 ：例如 He gave me a book.
  4. 主——谓——宾——宾补 ：例如 I found her sleeping.
  5. 主——系——表 ：例如 The question is whether he will come.
- 确保解释清晰，例子易懂。
- 输出建议时，以语法和实际运用为出发点。
`,
    '简洁': '你是一个简洁的英语语法分析助手。请分析给定文本的语法，并提供主要成分和句子类型。总是用中文回复。\n\n输出格式：\n翻译：[中文翻译]\n分析结构：\n  - 主要成分：[主语、谓语、宾语、补语等分析]\n  - 句子类型：[陈述句、疑问句、祈使句等]',
    '错误聚焦': '你是一个专注于错误的英语语法检查助手。请分析给定文本的语法，找出其中的语法错误，并提供修改建议。总是用中文回复。\n\n输出格式：\n翻译：[中文翻译]\n语法错误：[语法错误分析]\n修改建议：[修改建议]',
    '比较': '你是一个比较英语语法分析助手。请分析给定的两个句子，找出它们之间的语法差异，并解释原因。总是用中文回复。\n\n输出格式：\n翻译1：[句子1的中文翻译]\n翻译2：[句子2的中文翻译]\n语法差异：[句子1和句子2的语法差异分析]\n原因解释：[语法差异的原因解释]'
  };

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

  // Load saved settings
  chrome.storage.sync.get(['apiKey', 'model', 'promptSelect', 'systemPrompt', 'customPrompts'], function (data) {
    apiKeyInput.value = data.apiKey || '';
    modelSelect.value = data.model || 'meta-llama/Llama-3.3-70B-Instruct';
    const savedPromptSelectValue = data.promptSelect || 'grammar_analyzer';
    const savedSystemPrompt = data.systemPrompt || grammarPrompts['grammar_analyzer'];
    const customPrompts = data.customPrompts || {};

    // Populate promptSelect with custom prompts
    for (const key in customPrompts) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      promptSelect.appendChild(option);
    }

    // Set the selected value of the promptSelect dropdown
    for (const key in grammarPrompts) {
      if (grammarPrompts[key] === savedSystemPrompt) {
        promptSelect.value = key;
        break;
      }
    }

    if (customPrompts[savedPromptSelectValue]) {
      promptSelect.value = savedPromptSelectValue;
      systemPromptTextarea.value = customPrompts[savedPromptSelectValue];
    } else {
      promptSelect.value = savedPromptSelectValue;
      systemPromptTextarea.value = savedSystemPrompt;
    }

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

    chrome.storage.sync.get(['customPrompts'], (result) => {
      const customPrompts = result.customPrompts || {};
      if (customPrompts[promptSelectValue]) {
        customPrompts[promptSelectValue] = systemPrompt;
      }
      chrome.storage.sync.set({ apiKey: apiKey, model: model, promptSelect: promptSelectValue, systemPrompt: systemPrompt, customPrompts: customPrompts }, function () {
        showNotification('选项已保存');
      });
    });
  });

  // Reset settings
  resetButton.addEventListener('click', function () {
    chrome.storage.sync.get(['apiKey', 'model', 'promptSelect', 'systemPrompt', 'customPrompts'], (result) => {
      apiKeyInput.value = result.apiKey || '';
      modelSelect.value = result.model || 'meta-llama/Llama-3.3-70B-Instruct';
      const savedPromptSelectValue = result.promptSelect || 'grammar_analyzer';
      const savedSystemPrompt = result.systemPrompt || grammarPrompts['grammar_analyzer'];
      const customPrompts = result.customPrompts || {};

      // 恢复选择框
      restoreSelectFromInput();

      // 清除promptSelect的所有选项
      while (promptSelect.options.length > 0) {
        promptSelect.remove(0);
      }

      // 重新添加预设的提示词选项
      for (const key in grammarPrompts) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        promptSelect.appendChild(option);
      }

      // 重新添加自定义提示词选项
      for (const key in customPrompts) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        promptSelect.appendChild(option);
      }

      // 设置默认选中的选项和系统提示词
      if (customPrompts[savedPromptSelectValue]) {
        promptSelect.value = savedPromptSelectValue;
        systemPromptTextarea.value = customPrompts[savedPromptSelectValue];
      } else {
        promptSelect.value = savedPromptSelectValue;
        systemPromptTextarea.value = savedSystemPrompt;
      }

      // 重置按钮状态
      replaceButton.disabled = true;
      newButton.disabled = true;

      showNotification('选项已重置');
    });
  });

  // Add event listener to systemPromptTextarea to handle prompt selection
  systemPromptTextarea.addEventListener('input', () => {
    if (systemPromptTextarea.value !== grammarPrompts[promptSelect.value] && systemPromptTextarea.value !== promptInput.value) {
      replaceButton.disabled = false;
      promptInput.value = promptSelect.options[promptSelect.selectedIndex].textContent;
      promptInput.style.width = '85%';
      promptInput.style.marginRight = '10px';
      promptSelect.parentNode.replaceChild(promptInput, promptSelect);
      newButton.disabled = true;
    } else {
      replaceButton.disabled = true;
    }
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
    systemPromptTextarea.value = grammarPrompts[promptSelect.value] || grammarPrompts['grammar_analyzer'];
    promptInput.value = promptSelect.options[promptSelect.selectedIndex].textContent;
    replaceButton.disabled = true;
    newButton.disabled = true;
  });

  // Add event listener to replaceButton
  replaceButton.addEventListener('click', () => {
    const newPromptName = promptInput.value;
    const newPromptContent = systemPromptTextarea.value;

    chrome.storage.sync.get(['customPrompts'], (result) => {
      let customPrompts = result.customPrompts || {};
      customPrompts[newPromptName] = newPromptContent;

      chrome.storage.sync.set({ customPrompts: customPrompts }, function () {
        showNotification('预设系统提示词已替换');

        // Update promptSelect with new custom prompts
        while (promptSelect.options.length > 0) {
          promptSelect.remove(0);
        }

        for (const key in customPrompts) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          promptSelect.appendChild(option);
        }

        for (const key in grammarPrompts) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          promptSelect.appendChild(option);
        }

        promptSelect.value = newPromptName;
        systemPromptTextarea.value = newPromptContent;

        // 恢复选择框
        restoreSelectFromInput();

        // 重置按钮状态
        replaceButton.disabled = true;
        newButton.disabled = true;
      });
    });
  });

  // Add event listener to newButton
  newButton.addEventListener('click', () => {
    const newPromptName = promptInput.value;
    const newPromptContent = systemPromptTextarea.value;

    chrome.storage.sync.get(['customPrompts'], (result) => {
      let customPrompts = result.customPrompts || {};
      customPrompts[newPromptName] = newPromptContent;

      chrome.storage.sync.set({ customPrompts: customPrompts }, function () {
        showNotification('预设系统提示词已新建');

        // Update promptSelect with new custom prompts
        while (promptSelect.options.length > 0) {
          promptSelect.remove(0);
        }

        for (const key in customPrompts) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          promptSelect.appendChild(option);
        }

        for (const key in grammarPrompts) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          promptSelect.appendChild(option);
        }

        promptSelect.value = newPromptName;
        systemPromptTextarea.value = newPromptContent;

        // 恢复选择框
        restoreSelectFromInput();

        // 重置按钮状态
        replaceButton.disabled = true;
        newButton.disabled = true;
      });
    });
  });
});
