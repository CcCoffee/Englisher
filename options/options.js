document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const systemPromptTextarea = document.getElementById('systemPrompt');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const promptSelect = document.getElementById('promptSelect');

  const grammarPrompts = {
    'grammar_analyzer': `你是一个有用的助手，可以分析英语句子的语法。总是用中文回复。
      # 步骤

      1. **语法分析**：分析句子的结构，包括词性和短语结构。
      2. **规则解释**：解释相关的语法规则，并指出其中可能的错误或改善方式。
      3. **建议改进**：提供句子的改进建议，确保结构和用词标准且优雅。

      # 输出格式

      按照以下格式输出分析结果：

      \\
      - **分析结构**：
        - 主要成分：[主语、谓语、宾语、补语等分析]
        - 句子类型：[陈述句、疑问句、祈使句等]
        - 核心句式：主-谓-宾-宾补
      \\
      - **语法规则**：[详细的语法规则解释及例子]
      - **改进建议**：[针对此句的提升建议]

      # 示例

      例如，输入句子为：“She can sing beautifully.”
      - **翻译**：她的歌声非常好听。
      - **分析结构**：
        - 主要成分：
          - 主语：She
          - 谓语：can sing
          - 状语：beautifully
        - 句子类型：陈述句
        - 核心句式：主-谓
      - **语法规则**：
        - “She”是主语，代词形式，用于指代人或物。
        - “can”是情态动词，接动词原形，表示能力。
        - “sing”是动词，作为谓语表示动作。
        - “beautifully”是副词，修饰动词，表示方式。
      - **改进建议**：句子结构正确，无需改动。

      # 注意事项

      - 确保解释清晰，例子易懂。
      - 输出建议时，以语法和实际运用为出发点。
      `,
    'concise': '你是一个简洁的英语语法分析助手。请分析给定文本的语法，并提供主要成分和句子类型。总是用中文回复。\n\n输出格式：\n翻译：[中文翻译]\n分析结构：\n  - 主要成分：[主语、谓语、宾语、补语等分析]\n  - 句子类型：[陈述句、疑问句、祈使句等]',
    'error_focused': '你是一个专注于错误的英语语法检查助手。请分析给定文本的语法，找出其中的语法错误，并提供修改建议。总是用中文回复。\n\n输出格式：\n翻译：[中文翻译]\n语法错误：[语法错误分析]\n修改建议：[修改建议]',
    'comparative': '你是一个比较英语语法分析助手。请分析给定的两个句子，找出它们之间的语法差异，并解释原因。总是用中文回复。\n\n输出格式：\n翻译1：[句子1的中文翻译]\n翻译2：[句子2的中文翻译]\n语法差异：[句子1和句子2的语法差异分析]\n原因解释：[语法差异的原因解释]'
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
