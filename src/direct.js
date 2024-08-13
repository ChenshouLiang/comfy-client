export class ComfyUIWeb {
  constructor(serverAddress) {
    if (ComfyUIWeb.instance) {
      return ComfyUIWeb.instance;
    }
    this.serverAddress = serverAddress
    this.address = null;
    ComfyUIWeb.instance = this;
  }

  async getAddress() {
    if (!this.address) {
      if (Array.isArray(this.serverAddress)) {
        const addressArray = [];
        const execInfoPromises = this.serverAddress.map(address => this.getPrompt(address));
        const settledPromises = await Promise.allSettled(execInfoPromises);
        settledPromises.forEach(({ status, value }, index) => {
          if (status === 'fulfilled') {
            addressArray.push({ address: this.serverAddress[index], exec_info: value.exec_info.queue_remaining });
          }
        });

        if (addressArray.length === 0) {
          throw new Error('没有找到有效的地址');
        }
        const result = addressArray.reduce((min, current) => current.exec_info < min.exec_info ? current : min);
        this.address = result.address;
      } else {
        this.address = this.serverAddress;
      }
    }
    return this.address;
  }

  async uploadImage(image, overwrite) {
    const formData = new FormData();
    formData.append('image', image);
    if (overwrite !== undefined) {
      formData.append('subfolder', overwrite.toString());
    }
    let url = await this.getAddress()
    try {
      const res = await fetch(`${url}/upload/image`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if ('error' in json) {
        throw new Error(JSON.stringify(json));
      }
      return json;
    } catch (error) {
      throw new Error('上传图片时出错：' + error.message);
    }
  }

  async getEmbeddings() {
    let url = await this.getAddress()
    const res = await fetch(`${url}/embeddings`);
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async queuePrompt(workflow) {
    let url = await this.getAddress()
    const res = await fetch(`${url}/prompt`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: workflow
      })
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async interrupt() {
    let url = await this.getAddress()
    const res = await fetch(`${url}/interrupt`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
  }

  async editHistory(params) {
    let url = await this.getAddress()
    const res = await fetch(`${url}/history`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const json = await res.json();

    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
  }

  async getImage(filename, subfolder, type) {
    let url = await this.getAddress()
    const res = await fetch(`${url}/view?` + new URLSearchParams({
      filename,
      subfolder,
      type
    })
    );
    const blob = await res.blob();
    return blob;
  }

  async viewMetadata(folderName, filename) {
    let url = await this.getAddress()
    const res = await fetch(
      `${url}/view_metadata/${folderName}?filename=${filename}`,
    );
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async getSystemStats() {
    let url = await this.getAddress()
    const res = await fetch(`${url}/system_stats`);
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async getPrompt(url) {
    const res = await fetch(`${url}/prompt`);
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async getObjectInfo(nodeClass) {
    let url = await this.getAddress()
    const res = await fetch(`${url}/object_info` + (nodeClass ? `/${nodeClass}` : ''));
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async getHistory(promptId) {
    let url = await this.getAddress()
    const res = await fetch(
      `${url}/history` + (promptId ? `/${promptId}` : ''),
    );
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async getQueue() {
    let url = await this.getAddress()
    const res = await fetch(`${url}/queue`);
    const json = await res.json();
    if ('error' in json) {
      throw new Error(JSON.stringify(json));
    }
    return json;
  }

  async paramObj(url) {
    const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
    if (!search) {
      return {}
    }
    const obj = {}
    const searchArr = search.split('&')
    searchArr.forEach(v => {
      const index = v.indexOf('=')
      if (index !== -1) {
        const name = v.substring(0, index)
        const val = v.substring(index + 1, v.length)
        obj[name] = val
      }
    })
    return obj
  }

  // url转Blob
  async urlToBlob(url) {
    let { filename, subfolder, type } = await this.paramObj(url)
    const blob = await this.getImage(filename, subfolder, type)
    return blob
  }

  // 查找节点然后覆盖数据
  async updateObject(payload, feature) {
    const { input, workflow } = feature;
    await Promise.all(Object.keys(input).map(async (keys) => {
      let idKey = input[keys].id;
      let updatedObject = {};
      if (payload.hasOwnProperty(keys)) {
        if (keys === 'images') {
          let updatedObjectImage = {};
          await Promise.all(payload[keys].map(async (obj) => {
            // 判断是否是数据流图片
            if (obj.hasOwnProperty('file')) {
              let imgs = await this.uploadImage(obj.file, '');
              updatedObjectImage = { image: imgs.name };
            }
            // 判断是否是url图片
            if (obj.hasOwnProperty('url')) {
              updatedObjectImage = { url: obj.url };
            }
            if (workflow.hasOwnProperty(obj.id)) {
              workflow[obj.id].inputs = { ...workflow[obj.id].inputs, ...updatedObjectImage };
            }
          }));
        } else if (keys === 'style') {
          let { checkpoints, loras, samplers } = payload[keys];
          let updatedObjectStyle = {};
          if (checkpoints.length > 0) {
            checkpoints.forEach((v) => {
              updatedObjectStyle = { ckpt_name: v.ckpt_name };
              if (workflow.hasOwnProperty(v.id)) {
                workflow[v.id].inputs = { ...workflow[v.id].inputs, ...updatedObjectStyle };
              }
            });
          }
          if (samplers.length > 0) {
            samplers.forEach((v) => {
              updatedObjectStyle = {
                cfg: v.cfg,
                steps: v.steps,
                sampler_name: v.sampler_name,
                scheduler: v.scheduler,
              };
              if (workflow.hasOwnProperty(v.id)) {
                workflow[v.id].inputs = { ...workflow[v.id].inputs, ...updatedObjectStyle };
              }
            });
          }
          if (loras.length > 0) {
            loras.forEach((v) => {
              updatedObjectStyle = {
                lora_name: v.lora_name,
                strength_model: v.strength_model,
              };
              if (workflow.hasOwnProperty(v.id)) {
                workflow[v.id].inputs = { ...workflow[v.id].inputs, ...updatedObjectStyle };
              }
            });
          }
        } else if (keys === 'outPainting') {
          updatedObject = payload[keys];
        } else {
          updatedObject = { [input[keys].key]: payload[keys] };
        }
      }
      if (workflow.hasOwnProperty(idKey)) {
        workflow[idKey].inputs = { ...workflow[idKey].inputs, ...updatedObject };
      }
    }));
    return workflow;
  }

  async genWithWorkflow(prompt) {
    let url = await this.getAddress()
    const queue = await this.queuePrompt(prompt);
    const promptId = queue.prompt_id;
    return new Promise(async (resolve, reject) => {
      const outputImages = {}
      let isProcessComplete = false
      try {
        while (!isProcessComplete) {
          // 获取图片进度
          const queueInfo = await this.getQueue();
          if (queueInfo.queue_running.length === 0 && queueInfo.queue_pending.length === 0) {
            isProcessComplete = true
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        //根据promptId 获取历史
        const historyRes = await this.getHistory(promptId);
        //根据promptId 返回图片
        const history = historyRes[promptId];
        // 处理多多个节点
        for (const nodeId of Object.keys(history.outputs)) {
          // 获取key_nodeId,去取值
          const nodeOutput = history.outputs[nodeId];
          if (nodeOutput.images) {
            // 用于存放图片
            const imagesOutput = []
            for (const item of nodeOutput.images) {
              const imageUrl = `${url}/view?subfolder=${item.subfolder}&type=${item.type}&filename=${item.filename}`
              imagesOutput.push(imageUrl);
            }
            outputImages[nodeId] = imagesOutput
          }
        }
        return resolve(outputImages);
      } catch (err) {
        return reject(err);
      }
    })
  }
}