// app.js
App({
  onLaunch() {
    // 检查更新
    this.checkUpdate()
    
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 替换为你的云环境ID
        traceUser: true,
      })
    }
    
    // 获取用户信息
    this.getUserInfo()
  },

  // 检查更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    } else {
      // 获取用户OpenID
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then(res => {
        this.globalData.openId = res.result.openid
      }).catch(err => {
        console.error('获取OpenID失败', err)
      })
    }
  },

  globalData: {
    userInfo: null,
    openId: null,
    categories: [
      { id: 'food', name: '餐饮', icon: '🍽️', type: 'expense' },
      { id: 'transport', name: '交通', icon: '🚗', type: 'expense' },
      { id: 'shopping', name: '购物', icon: '🛍️', type: 'expense' },
      { id: 'entertainment', name: '娱乐', icon: '🎬', type: 'expense' },
      { id: 'housing', name: '居住', icon: '🏠', type: 'expense' },
      { id: 'medical', name: '医疗', icon: '💊', type: 'expense' },
      { id: 'education', name: '教育', icon: '📚', type: 'expense' },
      { id: 'salary', name: '工资', icon: '💰', type: 'income' },
      { id: 'bonus', name: '奖金', icon: '🎁', type: 'income' },
      { id: 'investment', name: '投资', icon: '📈', type: 'income' },
      { id: 'other', name: '其他', icon: '📝', type: 'other' }
    ]
  }
})
