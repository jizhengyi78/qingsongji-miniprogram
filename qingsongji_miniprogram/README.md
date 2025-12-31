# 轻松记 - 个人记账本Mini App

## 项目简介

"轻松记"是一款基于微信小程序平台的个人财务管理工具，专为日常快速记账设计。用户可以通过简单的操作记录收支、查看统计、管理财务，帮助用户养成良好的理财习惯。

## 功能特性

### 核心功能
- **快速记账**：3步完成记账操作，支持收入/支出记录
- **分类管理**：预设常用分类（餐饮、交通、购物、娱乐等）
- **账单管理**：账单列表展示，支持编辑、删除、筛选
- **数据统计**：月度收支总览、分类占比、趋势分析
- **数据管理**：支持数据导出、云端备份与恢复

### 技术特性
- 微信小程序原生开发
- 微信云开发（云函数、云数据库、云存储）
- ECharts数据可视化
- 本地缓存优化
- 响应式设计

## 技术架构

### 前端技术栈
- **WXML**：页面结构
- **WXSS**：页面样式
- **JavaScript**：业务逻辑
- **小程序组件**：自定义组件

### 后端技术栈
- **云函数**：Node.js运行环境
- **云数据库**：MongoDB
- **云存储**：文件存储

### 数据流
```
用户操作 → 页面事件 → 业务逻辑 → 数据服务 → 云数据库
    ↓           ↓           ↓           ↓           ↓
  显示更新 ←  数据绑定  ←  数据处理  ←  查询结果  ←  数据存储
```

## 项目结构

```
qingsongji_miniprogram/
├── pages/                    # 页面目录
│   ├── index/               # 记账页面
│   ├── bills/               # 账单页面
│   ├── stats/               # 统计页面
│   └── profile/             # 个人中心
├── components/              # 组件目录
├── cloudfunctions/          # 云函数目录
│   ├── addBill/            # 添加账单
│   ├── getBills/           # 获取账单列表
│   ├── updateBill/         # 更新账单
│   ├── deleteBill/         # 删除账单
│   └── getBillStats/       # 获取统计数据
├── utils/                  # 工具函数
├── app.js                  # 应用入口
├── app.json                # 应用配置
├── app.wxss                # 全局样式
└── README.md               # 项目说明
```

## 快速开始

### 1. 准备工作
- 注册微信小程序账号
- 下载并安装微信开发者工具
- 开通微信云开发服务

### 2. 项目配置
1. 打开微信开发者工具
2. 导入项目，选择项目根目录
3. 在 `app.js` 中配置云开发环境ID：
   ```javascript
   wx.cloud.init({
     env: 'your-cloud-env-id'  // 替换为你的云环境ID
   })
   ```

### 3. 部署云函数
1. 在微信开发者工具中打开云开发控制台
2. 创建云函数并上传代码
3. 部署所有云函数

### 4. 创建数据库集合
在云开发控制台创建以下集合：
- `bills` - 账单记录表
- `categories` - 分类表（可选）
- `users` - 用户表（可选）

## 数据库设计

### 账单记录表 (bills)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | String | 记录唯一ID |
| userId | String | 用户ID（OpenID）|
| type | String | 类型：income/expense |
| category | String | 分类ID |
| amount | Number | 金额 |
| account | String | 账户ID |
| date | Date | 日期 |
| note | String | 备注 |
| createTime | Date | 创建时间 |
| updateTime | Date | 更新时间 |

## API接口

### 云函数列表

#### 账单相关
- `addBill` - 添加账单
- `getBills` - 获取账单列表
- `updateBill` - 更新账单
- `deleteBill` - 删除账单
- `getBillStats` - 获取统计数据

### 调用示例

```javascript
// 添加账单
wx.cloud.callFunction({
  name: 'addBill',
  data: {
    type: 'expense',
    category: 'food',
    amount: 25.5,
    account: 'cash',
    date: Date.now(),
    note: '午餐'
  }
})

// 获取账单列表
wx.cloud.callFunction({
  name: 'getBills',
  data: {
    page: 1,
    pageSize: 20,
    type: 'expense'
  }
})
```

## 性能优化

### 1. 渲染优化
- 列表分页加载
- 使用key提升渲染性能
- setData合并更新

### 2. 网络优化
- 本地缓存常用数据
- 请求防抖处理
- 图片懒加载

### 3. 内存优化
- 及时释放资源
- 使用合适尺寸的图片

## 开发规范

### 代码规范
- 使用ES6+语法
- 统一的命名规范
- 添加必要的注释

### 提交规范
- 清晰的commit message
- 功能完整的代码提交
- 避免提交敏感信息

## 更新日志

### v1.0.0 (2025-12-30)
- 完成基础记账功能
- 实现账单管理
- 添加数据统计
- 支持数据导出

## 许可证

本项目仅供学习交流使用。

## 联系方式

如有问题或建议，欢迎提出Issue。

---

**产品口号：轻松记账，智慧理财！**
