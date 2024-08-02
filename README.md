## Install

yarn add comfy-client

```js
// 启用 WebSocket-(node服务)
import { ComfyUIClient } from 'comfy-client';
import { v4 as uuidv4 } from 'uuid';
const serverAddress = '127.0.0.1:8189';
const clientId = uuidv4();
const client = new ComfyUIClient(serverAddress, clientId);
// 连接comfy服务器
await client.connect();
// 生成图片
const images = await client.getImages(prompt);
// 将图片保存到文件
const outputDir = './tmp/output';
await client.saveImages(images, outputDir);
// 断开comfy连接
await client.disconnect();
```

```js
// web服务
import { ComfyUIWeb } from 'comfy-client';
// 传输多个地址会寻找占用资源少的推送队列
const url = 'http://127.0.0.1:8189' & ['http://127.0.0.1:8189','http://127.0.0.1:8188']
const client = new ComfyUIWeb('http://127.0.0.1:8189');
// 将url转Blob
await client.urlToBlob(url);
// 上传图片-传值 (图片图片名称)
await client.uploadImage(image, filename);
// 获取当前队列排队情况
await client.getPrompt();
// 获取历史记录 -- promptId,传入promptId,查询指定历史记录
await client.getHistory()
// 获取当前设备的自定义节点信息
await client.getObjectInfo()
// 数据合并(数据，规则)
let payload = {
  positive: ' 1 girl',
  negative: ' 1 boy',
  batchSize: 1,
  images: [
    {
      id: '12',
      file: 'file',
    },
  ],
  outPainting: {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
    feathering: 50,
  },
  style: {
    samplers: [
      {
        id: '136',
        cfg: 7,
        steps: 30,
        samplers_name: '',
        scheduler: '',
      },
    ],
    checkpoints: [{ ckpt_name: '', 'id:': '235' }],
    loras: [
      {
        id: '156',
        lora_name: '',
        strength_model: 1,
      },
    ],
  },
};
let feature = {
  input: {
    negative: {
      id: '23',
      key: 'string',
      title: '反向提示词',
    },
    positive: {
      id: '21',
      key: 'string',
      title: '正向提示词',
    },
    batchSize: {
      id: '12',
      key: 'num_images_per_prompt',
    },
    outPainting: {
      id: '13',
    },
    images: [
      {
        id: '11',
        title: '主图',
      },
    ],
    styles: [
      {
        samplers: [
          {
            id: '136',
            cfg: 7,
            steps: 30,
            samplers_name: '',
            scheduler: '',
          },
        ],
        checkpoints: [{ ckpt_name: '', 'id:': '235' }],
        loras: [
          {
            id: '156',
            lora_name: '',
            strength_model: 1,
          },
        ],
      },
    ],
  },
  workflow: {
    6: {
      _meta: {
        title: '(Down)load Kolors Model',
      },
      inputs: {
        model: 'Kwai-Kolors/Kolors',
        precision: 'fp16',
      },
      class_type: 'DownloadAndLoadKolorsModel',
    },
    10: {
      _meta: {
        title: 'VAE解码',
      },
      inputs: {
        vae: ['11', 0],
        samples: ['14', 0],
      },
      class_type: 'VAEDecode',
    },
    11: {
      _meta: {
        title: 'VAE加载器',
      },
      inputs: {
        vae_name: 'kolors\\diffusion_pytorch_model.fp16.safetensors',
      },
      class_type: 'VAELoader',
    },
    12: {
      _meta: {
        title: 'Kolors Text Encode',
      },
      inputs: {
        prompt: ['21', 0],
        chatglm3_model: ['19', 0],
        negative_prompt: ['23', 0],
        num_images_per_prompt: 1,
      },
      class_type: 'KolorsTextEncode',
    },
    13: {
      _meta: {
        title: '(Down)load ChatGLM3 Model',
      },
      inputs: {
        precision: 'quant8',
      },
      class_type: 'DownloadAndLoadChatGLM3',
    },
    14: {
      _meta: {
        title: 'Kolors Sampler',
      },
      inputs: {
        cfg: 5,
        seed: ['20', 0],
        steps: 25,
        width: 1920,
        height: 1088,
        scheduler: 'EulerDiscreteScheduler',
        kolors_model: ['6', 0],
        kolors_embeds: ['12', 0],
        denoise_strength: 1,
      },
      class_type: 'KolorsSampler',
    },
    19: {
      _meta: {
        title: 'Load ChatGLM3 Model',
      },
      inputs: {
        chatglm3_checkpoint: 'chatglm3-8bit.safetensors',
      },
      class_type: 'LoadChatGLM3',
    },
    20: {
      _meta: {
        title: '随机种',
      },
      inputs: {
        seed: -1,
      },
      class_type: 'Seed (rgthree)',
    },
    21: {
      _meta: {
        title: 'String Literal',
      },
      inputs: {
        string: '',
      },
      class_type: 'String Literal',
    },
    23: {
      _meta: {
        title: 'String Literal',
      },
      inputs: {
        string: '',
      },
      class_type: 'String Literal',
    },
    26: {
      _meta: {
        title: '保存图像',
      },
      inputs: {
        images: ['10', 0],
        filename_prefix: 'ComfyUI',
      },
      class_type: 'SaveImage',
    },
    30: {
      _meta: {
        title: '(Down)load Kolors Model',
      },
      inputs: {
        model: 'Kwai-Kolors/Kolors',
        precision: 'fp16',
      },
      class_type: 'DownloadAndLoadKolorsModel',
    },
  },
};
const prompt = await client.updateObject(payload, feature);
const images = await client.getImages(prompt);

// 图片上传
client.uploadImage(file, file.name,'WEB-SD').then(res => {
  return url = res.subfolder === ''? res.name : res.subfolder + '/' + res.name
})
```

``` js
// dify
import { DifyAPI } from 'comfy-client';
const client = new DifyAPI('http://127.0.0.1:8189');
// 发送对话消息
await client.chatMessages();

```
