# 国内音乐软件歌单导入到 YouTube Music

这个小脚本可以将国内音乐软件用户的歌单导入到 YouTube Music 中去。

## Prerequisites

### Listen1 Music Player

安装 [Listen1 Music Player](https://listen1.github.io/listen1/)，借助 listen1 导出各个平台的歌单。

具体操作：

- 下载 Listen1
- 登录帐号
- 在设置里导出歌单，得到 `listen1_backup.json` 文件

### Node.js
- [Node.js](https://nodejs.org/en/)


## Usage

```bash
# 首先确保你已经将你自己的 listen1_backup.json 文件放到了 src/ 文件下

# 从项目根目录开始
npm install

cd src

node ./index.js
# 然后会提醒你登录 Google 帐号
# 登录完成后就会开始导入歌单
# 具体原理是：
#  1. 搜索歌曲名称，选择第一个结果
#  2. 将歌曲设置为喜欢 
```
