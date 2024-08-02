export class DifyAPI {
  constructor(serverAddress, apiKey, userName) {
    this.serverAddress = serverAddress;
    this.api_key = apiKey;
    this.user_name = userName;
  }
  
  // 发送对话消息
  async chatMessages(params) {
    const res = await fetch(`${this.serverAddress}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: JSON.stringify(params)
    });
    const json = res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 上传图片
  async uploadImage(image, filename) {
    const formData = new FormData();
    formData.append('file', new Blob([image]), filename);
    formData.append('user', this.user_name)
    const res = await fetch(`${this.serverAddress}/files/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: formData
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 停止响应 - task_id:任务 ID
  async stopChatMessages(task_id) {
    const res = await fetch(`${this.serverAddress}/chat-messages/${task_id}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: JSON.stringify({ user: this.user_name })
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 获取会话历史消息
  async getChatMessages(conversation_id, first_id, limit) {
    const res = await fetch(`${this.serverAddress}/messages?user=${this.user_name}&conversation_id=${conversation_id}&first_id=${first_id}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
      }
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 获取会话列表
  async getConversations(last_id, limit) {
    const res = await fetch(`${this.serverAddress}/conversations?user=${this.user_name}&last_id=${last_id}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      }
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 删除会话
  async deleteConversation(conversation_id) {
    const res = await fetch(`${this.serverAddress}/conversations/:${conversation_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: JSON.stringify({ user: this.user_name })
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 语音转文字
  // 语音文件。 支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'] 文件大小限制：15MB
  async audioToText(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', this.user_name)
    const res = await fetch(`${this.serverAddress}/audio-to-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: formData
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 文字转语音
  async textToAudio(text) {
    const res = await fetch(`${this.serverAddress}/text-to-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: JSON.stringify({ text, user: this.user_name })
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 获取应用配置信息
  async getParameters() {
    const res = await fetch(`${this.serverAddress}/parameters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      }
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 执行 workflow
  async runWorkflow(params) {
    const res = await fetch(`${this.serverAddress}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: JSON.stringify({ 
        "inputs": params,
        "response_mode":"streaming", 
        "user": this.user_name 
      })
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 获取workflow执行情况
  async getWorkflow(workflow_id) {
    const res = await fetch(`${this.serverAddress}/workflows/run/:${workflow_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      }
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  // 停止响应workflow
  async stopWorkflow(task_id) {
    const res = await fetch(`${this.serverAddress}/workflows/tasks/:${task_id}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.api_key}`,
      },
      body: JSON.stringify({ user: this.user_name })
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

}