document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('model');
    const promptSelect = document.getElementById('promptSelect');
    const notification = document.getElementById('notification');

    // 加载保存的设置
    chrome.storage.sync.get(['siliconflowApiKey', 'selectedModel', 'selectedPrompt', 'presetPrompts'], function(data) {
        // 恢复API密钥
        if (data.siliconflowApiKey) {
            apiKeyInput.value = data.siliconflowApiKey;
        }

        // 加载模型选择
        const models = [
            { value: 'yi-34b-chat', label: 'Yi-34B Chat' },
            { value: 'qwen-72b-chat', label: 'Qwen-72B Chat' },
            { value: 'chatglm-6b', label: 'ChatGLM-6B' }
        ];

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            modelSelect.appendChild(option);
        });

        // 恢复选中的模型
        if (data.selectedModel) {
            modelSelect.value = data.selectedModel;
        }

        // 加载预设系统提示词
        const defaultPrompts = [
            { value: 'academic', label: '学术写作助手' },
            { value: 'creative', label: '创意写作助手' },
            { value: 'professional', label: '职场沟通助手' }
        ];

        // 合并默认提示词和用户保存的提示词
        const presetPrompts = [...defaultPrompts, ...(data.presetPrompts || [])];

        presetPrompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.value;
            option.textContent = prompt.label;
            promptSelect.appendChild(option);
        });

        // 恢复选中的提示词
        if (data.selectedPrompt) {
            promptSelect.value = data.selectedPrompt;
        }
    });

    // 保存设置的事件监听器
    function saveSettings() {
        chrome.storage.sync.set({
            siliconflowApiKey: apiKeyInput.value,
            selectedModel: modelSelect.value,
            selectedPrompt: promptSelect.value
        }, function() {
            showNotification('设置已保存');
        });
    }

    apiKeyInput.addEventListener('change', saveSettings);
    modelSelect.addEventListener('change', saveSettings);
    promptSelect.addEventListener('change', saveSettings);

    // 显示通知
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
});
