// pages/index/index.js
const app = getApp()

Page({
  data: {
    type: 'expense', // 'expense' 或 'income'
    amount: '',
    category: '',
    accountIndex: 0,
    date: '',
    note: '',
    isSubmitting: false,
    accountList: [
      { id: 'cash', name: '现金' },
      { id: 'alipay', name: '支付宝' },
      { id: 'wechat', name: '微信' },
      { id: 'card', name: '银行卡' }
    ]
  },

  onLoad() {
    // 初始化日期
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    this.setData({
      date: `${year}-${month}-${day}`
    })
  },

  onShow() {
    // 页面显示时重置表单
    this.resetForm()
  },

  // 切换收入/支出类型
  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      type,
      category: '' // 重置分类选择
    })
  },

  // 金额输入
  onAmountInput(e) {
    let amount = e.detail.value
    // 限制只能输入数字和小数点
    amount = amount.replace(/[^\d.]/g, '')
    // 限制小数点后两位
    const dotIndex = amount.indexOf('.')
    if (dotIndex !== -1 && amount.length - dotIndex > 3) {
      amount = amount.substring(0, dotIndex + 3)
    }
    this.setData({ amount })
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ category })
  },

  // 选择账户
  onAccountChange(e) {
    this.setData({
      accountIndex: parseInt(e.detail.value)
    })
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 输入备注
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 保存账单
  async saveBill() {
    const { amount, category, accountIndex, accountList, date, note, type } = this.data
    
    // 验证数据
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      })
      return
    }
    
    if (!category) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return
    }

    // 防止重复提交
    if (this.data.isSubmitting) return
    
    this.setData({ isSubmitting: true })
    wx.showLoading({
      title: '保存中...'
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'addBill',
        data: {
          type,
          category,
          amount: parseFloat(amount),
          account: accountList[accountIndex].id,
          date: new Date(date).getTime(),
          note
        }
      })

      wx.hideLoading()
      
      if (result.result.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        })
        
        // 重置表单
        setTimeout(() => {
          this.resetForm()
        }, 1500)
      } else {
        wx.showToast({
          title: result.result.message || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('保存账单失败', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  // 重置表单
  resetForm() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    this.setData({
      type: 'expense',
      amount: '',
      category: '',
      accountIndex: 0,
      date: `${year}-${month}-${day}`,
      note: ''
    })
  }
})
