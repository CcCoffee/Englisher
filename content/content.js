// import { marked } from '../libs/marked.min.js';
class EnglishAnalyzer {
  constructor() {
    this.floatBtn = null;
    this.modal = null;
    this.apiKey = null; // 用于存储 API Key
    this.model = null; // 用于存储 model
    this.systemPrompt = null; // 用于存储 systemPrompt
    this.boundHandleSelection = this.handleSelection.bind(this);
    this.boundRemoveFloatButton = this.removeFloatButton.bind(this);
    this.init();
    this.loadSettings();
    this.currentContent = '';
  }

  async loadSettings() {
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'model', 'systemPrompt'], (result) => {
        resolve(result);
      });
    });
    this.apiKey = settings.apiKey;
    this.model = settings.model;
    this.systemPrompt = settings.systemPrompt;
    if (!this.apiKey) {
      throw new Error('API Key 未设置，请在插件选项中设置 API Key。');
    }
    if (!this.model) {
        this.model = 'Qwen/Qwen2.5-7B-Instruct';
    }
    if (!this.systemPrompt) {
        this.systemPrompt = 'You are a helpful assistant that analyzes English grammar for middle school students.';
    }
  }

  init() {
    // 移除可能存在的旧事件监听器
    this.removeEventListeners();
    // 添加新的事件监听器
    document.addEventListener('mouseup', this.boundHandleSelection);
    document.addEventListener('scroll', this.boundRemoveFloatButton);
  }

  removeEventListeners() {
    document.removeEventListener('mouseup', this.boundHandleSelection);
    document.removeEventListener('scroll', this.boundRemoveFloatButton);
  }

  handleSelection(e) {
    
    // 如果点击的是浮动按钮，直接返回
    if (e.target.classList.contains('englisher-float-btn')) {
        console.log('[handleSelection] 点击了浮动按钮，忽略选择事件');
        return;
    }
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    // 移除已存在的按钮
    this.removeFloatButton();
    
    if (text && this.isEnglish(text)) {
        this.showFloatButton(e);
    }
  }
  // 修改 showFloatButton 方法，使按钮出现在鼠标附近
  showFloatButton(e) {
    this.floatBtn = document.createElement('button');
    this.floatBtn.className = 'englisher-float-btn';
    this.floatBtn.textContent = '语法解析';
    
    // 使用鼠标位置来定位按钮
    const mouseX = e.clientX + window.scrollX;
    const mouseY = e.clientY + window.scrollY;
    
    // 按钮位置稍微偏移，避免遮挡选中文本
    this.floatBtn.style.top = `${mouseY + 20}px`;
    this.floatBtn.style.left = `${mouseX}px`;
    
    // 添加点击事件监听器
    const boundHandler = this.handleAnalyzeClick.bind(this);
    this.floatBtn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        boundHandler();
    };
    
    document.body.appendChild(this.floatBtn);
  }

  // 修改 isEnglish 方法，添加单词数量判断
  isEnglish(text) {
    // 计算单词数量
    const wordCount = text.trim().split(/\s+/).length;
    
    return wordCount >= 3;
  }

  // 修改 showModal 方法，优化事件处理
  showModal(text) {
    this.cleanupModal();
    
    const overlay = document.createElement('div');
    overlay.className = 'englisher-overlay';
    document.body.appendChild(overlay);
    
    this.modal = document.createElement('div');
    this.modal.className = 'englisher-modal';
    
    this.modal.innerHTML = `
      <div class="englisher-modal-header">
        <div class="englisher-modal-title">语法解析<span class="englisher-spinner"></span></div>
        <button class="englisher-close-btn">×</button>
      </div>
      <div class="englisher-content">
        <div class="englisher-question">${text}</div>
        <div class="englisher-answer"></div>
      </div>
    `;
    
    this.spinner = this.modal.querySelector('.englisher-spinner');
    this.spinner.style.display = 'none';
    
    const closeBtn = this.modal.querySelector('.englisher-close-btn');
    const closeModal = (e) => {
      e.stopPropagation();
      this.cleanupModal();
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    document.body.appendChild(this.modal);
  }

  // 新增清理模态框的方法
  cleanupModal() {
    if (this.modal) {
      this.modal.parentNode?.removeChild(this.modal);
      this.modal = null;
    }
    const overlay = document.querySelector('.englisher-overlay');
    if (overlay) {
      overlay.parentNode?.removeChild(overlay);
    }
  }

  removeFloatButton() {
    if (this.floatBtn) {
      if (this.floatBtn.parentNode) {
        this.floatBtn.parentNode.removeChild(this.floatBtn);
      } else {
        console.log('[removeFloatButton] 浮动按钮没有父节点');
      }
      this.floatBtn = null;
    } else {
      console.log('[removeFloatButton] 没有浮动按钮需要移除');
    }
  }

  async handleAnalyzeClick() {
    const text = window.getSelection().toString().trim();
    
    if (this.modal) {
      this.modal.parentNode?.removeChild(this.modal);
      const oldOverlay = document.querySelector('.englisher-overlay');
      oldOverlay?.parentNode?.removeChild(oldOverlay);
    }
    
    this.removeFloatButton();
    
    this.showModal(text);
    
    try {
      await this.analyzeGrammar(text);
    } catch (error) {
      console.error('[handleAnalyzeClick] 分析出错:', error);
      this.updateModalContent('抱歉，分析过程中出现错误。');
      this.spinner.style.display = 'none';
    }
  }

  updateModalContent(content) {
    if (this.modal) {
      const answerDiv = this.modal.querySelector('.englisher-answer');
      if (answerDiv) {
        this.currentContent = (this.currentContent || '') + content;
        // Create an iframe
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        
        // Append the iframe to the answerDiv
        answerDiv.innerHTML = ''; // Clear previous content
        answerDiv.appendChild(iframe);
  
        // Get the iframe's document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Write the markdown content to the iframe
        iframeDoc.body.innerHTML = marked.parse(this.currentContent);
        
        // Dynamically set the iframe's height
        iframe.style.height = `${iframe.contentDocument.body.scrollHeight + 10}px`;
      } else {
        console.error('[updateModalContent] 未找到答案区域');
      }
    } else {
      console.error('[updateModalContent] 模态框不存在');
    }
  }

  // 添加 analyzeGrammar 方法
  async analyzeGrammar(text) {
    if (!this.apiKey) {
      throw new Error('API Key 未设置，请在插件选项中设置 API Key。');
    }
    if (!this.model) {
        throw new Error('Model 未设置，请在插件选项中设置 Model。');
    }
    if (!this.systemPrompt) {
        throw new Error('System prompt 未设置，请在插件选项中设置 System prompt。');
    }
    const apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
      model: this.model,
      messages: [{ role: 'system', content: this.systemPrompt }, { role: 'user', content: text }],
      stream: true,
      max_tokens: 512,
    });

    try {
      this.currentContent = '';
      this.spinner.style.display = 'inline-block';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body
      });
      if (!response.ok) {
          const error = await response.json();
          throw new Error(`API 请求失败: ${response.status} - ${error.message || JSON.stringify(error)}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          // console.log('[analyzeGrammar] Received chunk:', chunk);
          
          // Split the chunk into individual data events
          const events = chunk.split('data: ').filter(Boolean);
          
          for (const event of events) {
            try {
              if (event.trim() === '[DONE]') {
                console.log('[analyzeGrammar] Stream finished.');
                done = true;
                this.spinner.style.display = 'none';
                break;
              } else {
                const parsedData = JSON.parse(event);
                if (parsedData.choices && parsedData.choices.length > 0 && parsedData.choices[0].delta.content) {
                  const content = parsedData.choices[0].delta.content;
                  this.updateModalContent(content);
                }
              }
            } catch (e) {
              console.error('[analyzeGrammar] Error parsing JSON:', e, event);
            }
          }
        }
      }
    } catch (error) {
      console.error('[analyzeGrammar] API 请求错误:', error);
      this.spinner.style.display = 'none';
      this.updateModalContent('抱歉，分析过程中出现错误。');
    }
  }

  // 修改析构方法，确保清理所有事件监听器
  destroy() {
    this.removeEventListeners();
    this.cleanupModal();
    this.removeFloatButton();
  }
}

// 初始化分析器
const analyzer = new EnglishAnalyzer();
