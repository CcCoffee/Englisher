document.addEventListener('DOMContentLoaded', function() {
    const analyzeButton = document.getElementById('analyze');
    const translateButton = document.getElementById('translate');
    const collectButton = document.getElementById('collect');
    const sentenceDiv = document.getElementById('sentence');
    const resultDiv = document.getElementById('result');
  
    // 获取当前选中的文本
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, function(response) {
        if (response && response.text) {
          sentenceDiv.textContent = '选中的句子: ' + response.text;
        } else {
          sentenceDiv.textContent = '请选择一个句子';
        }
      });
    });
  
    analyzeButton.addEventListener('click', function() {
      resultDiv.textContent = '语法解析功能开发中...';
      // TODO: 实现语法解析功能
    });
  
    translateButton.addEventListener('click', function() {
      resultDiv.textContent = '翻译功能开发中...';
      // TODO: 实现翻译功能
    });
  
    collectButton.addEventListener('click', function() {
      // 获取当前选中的文本
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, function(response) {
          if (response && response.text) {
            // 存储收藏的句子
            chrome.storage.sync.get({collectedSentences: []}, function(data) {
              const updatedSentences = [...data.collectedSentences, response.text];
              chrome.storage.sync.set({collectedSentences: updatedSentences}, function() {
                resultDiv.textContent = '已收藏';
              });
            });
          }
        });
      });
    });
  });